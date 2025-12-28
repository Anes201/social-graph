import { useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PRIGNode from './PRIGNode.jsx';
import { getGraph } from '../lib/graph.js';

const nodeTypes = {
  prigNode: PRIGNode
};

export default function GraphView({ onNodeClick, selectedNodeId, highlightedNodeIds = [], refreshTrigger = 0, onError }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync with Graphology
  useEffect(() => {
    try {
      const graph = getGraph();
      if (!graph) return;

      const rfNodes = graph.nodes().map((id) => {
        const attrs = graph.getNodeAttributes(id);
        const isRoot = id === 'root';

        return {
          id,
          type: 'prigNode',
          position: {
            x: attrs.x !== undefined ? attrs.x * 500 : (isRoot ? 0 : Math.random() * 800 - 400),
            y: attrs.y !== undefined ? attrs.y * 500 : (isRoot ? 0 : Math.random() * 800 - 400)
          },
          data: { ...attrs },
          selected: id === selectedNodeId
        };
      });

      const rfEdges = graph.edges().map((id) => {
        const attrs = graph.getEdgeAttributes(id);
        const source = graph.source(id);
        const target = graph.target(id);

        return {
          id,
          source,
          target,
          animated: true,
          style: {
            stroke: highlightedNodeIds.includes(source) || highlightedNodeIds.includes(target) ? '#60a5fa' : '#4b5563',
            strokeWidth: attributesToWidth(attrs.strength)
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#4b5563',
          },
        };
      });

      setNodes(rfNodes);
      setEdges(rfEdges);
    } catch (e) {
      console.error('React Flow sync failed:', e);
      if (onError) onError(e);
    }
  }, [refreshTrigger, selectedNodeId, highlightedNodeIds, setNodes, setEdges, onError]);

  const attributesToWidth = (strength) => {
    return Math.max(1, (strength || 5) / 2);
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((event, node) => {
    if (onNodeClick) onNodeClick(node.id);
  }, [onNodeClick]);

  const handlePaneClick = useCallback(() => {
    if (onNodeClick) onNodeClick(null);
  }, [onNodeClick]);

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gray-900"
        colorMode="dark"
      >
        <Background color="#333" gap={20} size={1} variant="dots" />
        <Controls />
        <MiniMap
          style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151' }}
          nodeColor={(n) => n.id === 'root' ? '#10b981' : '#3b82f6'}
          maskColor="rgba(0, 0, 0, 0.3)"
        />
      </ReactFlow>
    </div>
  );
}
