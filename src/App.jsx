import { useState, useEffect } from 'react';
import { useGraph } from './hooks/useGraph.js';
import GraphView from './components/GraphView.jsx';
import NodePanel from './components/NodePanel.jsx';
import SimpleNodeForm from './components/SimpleNodeForm.jsx';
import NodeForm from './components/NodeForm.jsx';
import QueryPanel from './components/QueryPanel.jsx';
import ImportDialog from './components/ImportDialog.jsx';
import SuggestionsPanel from './components/SuggestionsPanel.jsx';
import DirectionalButtons from './components/DirectionalButtons.jsx';
import { getNodeData } from './lib/graph.js';
import { getRootNodeId } from './lib/root.js';

function App() {
  const {
    graph,
    nodes,
    loading,
    refreshGraph,
    addNode,
    updateNode,
    deleteNode,
    addRelationship,
  } = useGraph();

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState([]);
  const [showSimpleForm, setShowSimpleForm] = useState(false);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [directionForNewNode, setDirectionForNewNode] = useState(null);
  const [graphError, setGraphError] = useState(false);

  const selectedNode = selectedNodeId ? getNodeData(selectedNodeId) : null;

  // Auto-select root node on load
  useEffect(() => {
    if (!loading && !selectedNodeId && nodes.length > 0) {
      const rootId = getRootNodeId();
      if (nodes.find(n => n.id === rootId)) {
        setSelectedNodeId(rootId);
      }
    }
  }, [loading, nodes, selectedNodeId]);

  const handleNodeClick = (nodeId) => {
    setSelectedNodeId(nodeId);
  };

  const handleSimpleNodeSave = async (simpleData) => {
    try {
      const newNode = await addNode({
        name: simpleData.name,
        type: 'person',
        email: '',
        phone: '',
        location: '',
        social: {},
        occupation: { role: '', company: '', industry: '' },
        skills: [],
        scores: {
          capitalAccess: 0,
          skillValue: 0,
          networkReach: 0,
          reliability: 0,
          speed: 0,
          alignment: 0,
        },
        leverageScore: 0,
        notes: [],
        lastInteraction: null,
      });

      // If created from a selected node, create relationship
      if (selectedNodeId && newNode) {
        await addRelationship({
          source: selectedNodeId,
          target: newNode.id,
          type: 'business',
          strength: 5,
          direction: 'bidirectional',
          contextTags: [],
        });
      }

      setShowSimpleForm(false);
      setDirectionForNewNode(null);
      setSelectedNodeId(newNode.id);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error creating node:', error);
      alert('Error creating node. Please try again.');
    }
  };

  const handleNodeSave = async (nodeData) => {
    if (editingNode) {
      await updateNode(editingNode.id, nodeData);
    } else {
      await addNode(nodeData);
    }
    setShowNodeForm(false);
    setEditingNode(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDirectionClick = (direction) => {
    if (selectedNodeId) {
      setDirectionForNewNode(direction);
      setShowSimpleForm(true);
    }
  };

  const handleNodeDelete = async (id) => {
    if (confirm('Are you sure you want to delete this node?')) {
      await deleteNode(id);
      setSelectedNodeId(null);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleRelationshipAdd = async (relData) => {
    await addRelationship(relData);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleImportComplete = () => {
    setShowImport(false);
    refreshGraph();
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="text-2xl font-black tracking-tighter mb-4 animate-pulse uppercase">Initializing PRIG Engine...</div>
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-blue-600 animate-slide"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex">
      {/* Left Sidebar - Queries */}
      <QueryPanel
        onNodeSelect={handleNodeClick}
        onHighlightNodes={setHighlightedNodeIds}
      />

      {/* Suggestions Panel (conditional) */}
      {showSuggestions && (
        <SuggestionsPanel
          onNodeSelect={handleNodeClick}
          onClose={() => setShowSuggestions(false)}
        />
      )}

      {/* Main Graph View */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {graphError ? (
          <div className="w-full h-full flex items-center justify-center p-12 text-center">
            <div className="max-w-md p-8 bg-red-900/20 border border-red-500/50 rounded-2xl backdrop-blur-xl">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">GRAPH ENGINE ERROR</h3>
              <p className="text-red-400 text-sm mb-6">The visualization engine encountered a fatal error. Your data is safe, but the 3D graph view is currently unavailable.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-sm transition-all"
              >
                REBOOT ENGINE
              </button>
            </div>
          </div>
        ) : (
          <GraphView
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNodeId}
            highlightedNodeIds={highlightedNodeIds}
            refreshTrigger={refreshTrigger}
            onError={() => setGraphError(true)}
          />
        )}

        {/* Directional Buttons */}
        <DirectionalButtons
          onDirectionClick={handleDirectionClick}
          selectedNodeId={selectedNodeId}
        />

        {/* Top Toolbar */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <button
            onClick={() => {
              setEditingNode(null);
              setShowSimpleForm(true);
              setDirectionForNewNode(null);
            }}
            className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600/90 hover:bg-blue-500 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 border border-blue-400/20 backdrop-blur-md"
          >
            <span className="text-xl leading-none">+</span>
            <span>DEPLOY NODE</span>
          </button>

          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
          >
            <span className="text-lg">📥</span>
            <span>IMPORT ASSETS</span>
          </button>

          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 backdrop-blur-md border ${showSuggestions
              ? 'bg-purple-600 border-purple-400 text-white'
              : 'bg-gray-800/80 border-gray-700 text-gray-300'
              }`}
          >
            <span className="text-lg">💡</span>
            <span>RECONNECT</span>
          </button>
        </div>

        {/* Simple Node Form Overlay */}
        {showSimpleForm && (
          <SimpleNodeForm
            onSave={handleSimpleNodeSave}
            onCancel={() => {
              setShowSimpleForm(false);
              setDirectionForNewNode(null);
            }}
            direction={directionForNewNode}
          />
        )}

        {/* Full Node Form Overlay (for editing) */}
        {showNodeForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl">
              <NodeForm
                node={editingNode}
                onSave={handleNodeSave}
                onCancel={() => {
                  setShowNodeForm(false);
                  setEditingNode(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Import Dialog */}
        {showImport && (
          <ImportDialog
            onClose={() => setShowImport(false)}
            onImportComplete={handleImportComplete}
          />
        )}
      </div>

      {/* Right Sidebar - Node Details */}
      {selectedNode ? (
        <div className="w-96 h-full bg-gray-800 border-l border-gray-700 shadow-2xl">
          <NodePanel
            node={selectedNode}
            onUpdate={updateNode}
            onDelete={handleNodeDelete}
            onClose={() => setSelectedNodeId(null)}
            onAddRelationship={handleRelationshipAdd}
            allNodes={nodes}
            onEdit={() => {
              setEditingNode(selectedNode);
              setShowNodeForm(true);
            }}
          />
        </div>
      ) : (
        <div className="w-96 h-full bg-gray-800 border-l border-gray-700 p-4 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-4">👤</div>
            <div className="text-lg mb-2">Select a node</div>
            <div className="text-sm">to view details</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
