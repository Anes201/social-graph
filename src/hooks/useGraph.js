import { useState, useEffect, useCallback } from 'react';
import { loadGraph, getGraph, addNode, updateNodeData, removeNode, addRelationship, updateRelationshipData, removeRelationship, getAllGraphNodes } from '../lib/graph.js';
import { ensureRootNode } from '../lib/root.js';
import { applyDecayToAllRelationships } from '../lib/decay.js';

export function useGraph() {
  const [graph, setGraph] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshGraph = useCallback(async () => {
    setLoading(true);
    try {
      // Ensure root node exists
      await ensureRootNode();
      await loadGraph();
      const g = getGraph();
      const allNodes = getAllGraphNodes();

      // Auto-decay relationship strength over time
      await applyDecayToAllRelationships(getGraph, updateRelationshipData);

      setGraph(g);
      setNodes(allNodes);
    } catch (error) {
      console.error('Error loading graph:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGraph();
  }, [refreshGraph]);

  const handleAddNode = useCallback(async (nodeData) => {
    const node = await addNode(nodeData);
    await refreshGraph();
    return node;
  }, [refreshGraph]);

  const handleUpdateNode = useCallback(async (id, updates) => {
    await updateNodeData(id, updates);
    await refreshGraph();
  }, [refreshGraph]);

  const handleDeleteNode = useCallback(async (id) => {
    await removeNode(id);
    await refreshGraph();
  }, [refreshGraph]);

  const handleAddRelationship = useCallback(async (relData) => {
    await addRelationship(relData);
    await refreshGraph();
  }, [refreshGraph]);

  const handleUpdateRelationship = useCallback(async (id, updates) => {
    await updateRelationshipData(id, updates);
    await refreshGraph();
  }, [refreshGraph]);

  const handleDeleteRelationship = useCallback(async (id) => {
    await removeRelationship(id);
    await refreshGraph();
  }, [refreshGraph]);

  return {
    graph,
    nodes,
    loading,
    refreshGraph,
    addNode: handleAddNode,
    updateNode: handleUpdateNode,
    deleteNode: handleDeleteNode,
    addRelationship: handleAddRelationship,
    updateRelationship: handleUpdateRelationship,
    deleteRelationship: handleDeleteRelationship,
  };
}

