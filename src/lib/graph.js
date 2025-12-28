import Graph from 'graphology';
import { getAllNodes, getAllRelationships, createNode, getNode as getNodeFromDB, updateNode, createRelationship, updateRelationship, deleteNode, deleteRelationship } from './db.js';

// Create graph instance
let graph = new Graph();

let loadingPromise = null;

// Load graph from IndexedDB
export async function loadGraph() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      graph.clear();

      // Load nodes
      const nodes = await getAllNodes();
      nodes.forEach(node => {
        try {
          if (!graph.hasNode(node.id)) {
            const attributes = {
              ...node,
              nodeType: node.type, // Map internal type to nodeType
              label: node.name,
              size: Math.max(5, (node.leverageScore || 0) / 10),
              color: getNodeColor(node),
              x: Math.random(),
              y: Math.random(),
            };
            delete attributes.type; // Ensure Sigma doesn't use it
            graph.addNode(node.id, attributes);
          }
        } catch (e) {
          if (!e.message?.includes('already exist')) {
            console.error('Error adding node to graph:', e);
          }
        }
      });

      // Load relationships
      const relationships = await getAllRelationships();
      relationships.forEach(rel => {
        try {
          if (graph.hasNode(rel.source) && graph.hasNode(rel.target)) {
            if (!graph.hasEdge(rel.source, rel.target)) {
              graph.addEdge(rel.source, rel.target, {
                ...rel,
                size: rel.strength / 2,
                color: getEdgeColor(rel.type),
              });
            }
          }
        } catch (e) {
          if (!e.message?.includes('already exist')) {
            console.error('Error adding edge to graph:', e);
          }
        }
      });

      return graph;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

// Get graph instance
export function getGraph() {
  return graph;
}

// Node operations
export async function addNode(nodeData) {
  const id = nodeData.id || `node_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const node = {
    id,
    type: nodeData.type || 'person',
    name: nodeData.name || '',
    email: nodeData.email || '',
    phone: nodeData.phone || '',
    location: nodeData.location || '',
    social: nodeData.social || {},
    occupation: nodeData.occupation || { role: '', company: '', industry: '' },
    skills: nodeData.skills || [],
    scores: nodeData.scores || {
      trust: 0,
      influence: 0,
      capitalAccess: 0,
      skillValue: 0,
      networkReach: 0,
      reliability: 0,
      speed: 0,
      alignment: 0,
    },
    leverageScore: nodeData.leverageScore || 0,
    notes: nodeData.notes || [],
    lastInteraction: nodeData.lastInteraction || null,
    metadata: nodeData.metadata || {},
  };

  try {
    await createNode(node);
  } catch (error) {
    if (error.name === 'ConstraintError' || error.message?.includes('already exists')) {
      await updateNode(id, node);
    } else {
      console.error('Error creating node in DB:', error);
      throw error;
    }
  }

  try {
    // Check if node already exists in graph before adding
    if (!graph.hasNode(id)) {
      const attributes = {
        ...node,
        nodeType: node.type,
        label: node.name || 'Unnamed',
        size: Math.max(5, (node.leverageScore || 0) / 10),
        color: getNodeColor(node),
        x: nodeData.x !== undefined ? nodeData.x : Math.random(),
        y: nodeData.y !== undefined ? nodeData.y : Math.random(),
      };
      delete attributes.type;
      graph.addNode(id, attributes);
    } else {
      // Update existing node in graph
      Object.keys(node).forEach(key => {
        if (key !== 'id' && key !== 'type') {
          graph.setNodeAttribute(id, key, node[key]);
        }
      });
      graph.setNodeAttribute(id, 'nodeType', node.type);
      graph.setNodeAttribute(id, 'label', node.name || 'Unnamed');
      graph.setNodeAttribute(id, 'size', Math.max(5, (node.leverageScore || 0) / 10));
      graph.setNodeAttribute(id, 'color', getNodeColor(node));
    }
  } catch (e) {
    if (!e.message?.includes('already exist')) {
      console.error('Error adding node to graph instance:', e);
    }
  }

  return node;
}

export async function updateNodeData(id, updates) {
  const node = await getNodeFromDB(id);
  if (!node) return null;

  const updated = { ...node, ...updates };
  await updateNode(id, updates);

  graph.setNodeAttribute(id, 'label', updated.name);
  graph.setNodeAttribute(id, 'size', (updated.leverageScore || 0) / 10);
  graph.setNodeAttribute(id, 'color', getNodeColor(updated));

  // Update all node attributes
  Object.keys(updates).forEach(key => {
    graph.setNodeAttribute(id, key, updates[key]);
  });

  return updated;
}

export async function removeNode(id) {
  await deleteNode(id);
  graph.dropNode(id);
}

export function getNodeData(id) {
  return graph.getNodeAttributes(id);
}

export function getAllGraphNodes() {
  return graph.nodes().map(id => graph.getNodeAttributes(id));
}

// Relationship operations
export async function addRelationship(relData) {
  const id = relData.id || `rel_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const relationship = {
    id,
    source: relData.source,
    target: relData.target,
    type: relData.type || 'business',
    strength: relData.strength || 5,
    direction: relData.direction || 'bidirectional',
    contextTags: relData.contextTags || [],
    createdAt: relData.createdAt || new Date().toISOString(),
    lastInteraction: relData.lastInteraction || null,
  };

  // Check if relationship already exists
  const existing = graph.edge(relationship.source, relationship.target);
  if (existing) {
    // Update existing
    await updateRelationship(graph.getEdgeAttribute(existing, 'id'), relationship);
    graph.setEdgeAttribute(existing, 'size', relationship.strength / 2);
    graph.setEdgeAttribute(existing, 'color', getEdgeColor(relationship.type));
    Object.keys(relationship).forEach(key => {
      graph.setEdgeAttribute(existing, key, relationship[key]);
    });
    return relationship;
  }

  await createRelationship(relationship);
  graph.addEdge(relationship.source, relationship.target, {
    ...relationship,
    size: relationship.strength / 2,
    color: getEdgeColor(relationship.type),
  });

  return relationship;
}

export async function updateRelationshipData(id, updates) {
  // Find edge by id
  const edges = graph.edges();
  let edgeId = null;
  for (const e of edges) {
    if (graph.getEdgeAttribute(e, 'id') === id) {
      edgeId = e;
      break;
    }
  }

  if (!edgeId) return null;

  const rel = graph.getEdgeAttributes(edgeId);
  const updated = { ...rel, ...updates };

  await updateRelationship(id, updates);

  graph.setEdgeAttribute(edgeId, 'size', updated.strength / 2);
  graph.setEdgeAttribute(edgeId, 'color', getEdgeColor(updated.type));

  Object.keys(updates).forEach(key => {
    graph.setEdgeAttribute(edgeId, key, updates[key]);
  });

  return updated;
}

export async function removeRelationship(id) {
  // Find edge by id
  const edges = graph.edges();
  for (const e of edges) {
    if (graph.getEdgeAttribute(e, 'id') === id) {
      await deleteRelationship(id);
      graph.dropEdge(e);
      return;
    }
  }
}

export function getNeighbors(nodeId) {
  return graph.neighbors(nodeId).map(id => graph.getNodeAttributes(id));
}

export function getRelationshipsForNode(nodeId) {
  const edges = graph.edges(nodeId);
  return edges.map(edgeId => {
    const attrs = graph.getEdgeAttributes(edgeId);
    const source = graph.source(edgeId);
    const target = graph.target(edgeId);
    return {
      ...attrs,
      sourceNode: graph.getNodeAttributes(source),
      targetNode: graph.getNodeAttributes(target),
      otherNode: source === nodeId ? graph.getNodeAttributes(target) : graph.getNodeAttributes(source),
    };
  });
}

// Graph algorithms
export function findShortestPath(sourceId, targetId) {
  try {
    const path = graph.shortestPath(sourceId, targetId);
    if (!path || path.length === 0) return null;

    return path.map(nodeId => graph.getNodeAttributes(nodeId));
  } catch (e) {
    return null;
  }
}

export function findPathsToIndustry(sourceId, industry) {
  const targetNodes = graph.nodes().filter(id => {
    const node = graph.getNodeAttributes(id);
    return node.occupation?.industry?.toLowerCase().includes(industry.toLowerCase());
  });

  const paths = [];
  for (const targetId of targetNodes) {
    const path = findShortestPath(sourceId, targetId);
    if (path) {
      paths.push({ target: graph.getNodeAttributes(targetId), path });
    }
  }

  return paths.sort((a, b) => a.path.length - b.path.length);
}

// Color helpers
function getNodeColor(node) {
  const industry = node.occupation?.industry?.toLowerCase() || '';
  const colorMap = {
    'tech': '#60a5fa',      // Blue
    'finance': '#10b981',   // Emerald
    'ecommerce': '#f59e0b', // Amber
    'logistics': '#8b5cf6', // Violet
    'consulting': '#f472b6', // Pink
    'media': '#fb7185',     // Rose
    'real estate': '#fb923c', // Orange
    'default': '#94a3b8',   // Slate
  };

  for (const [key, color] of Object.entries(colorMap)) {
    if (key !== 'default' && industry.includes(key)) {
      return color;
    }
  }

  return colorMap.default;
}

function getEdgeColor(type) {
  const colorMap = {
    'friend': '#10b981',
    'business': '#3b82f6',
    'family': '#f59e0b',
    'intro': '#8b5cf6',
    'online-only': '#6b7280',
  };

  return colorMap[type] || '#6b7280';
}

// Graph will be initialized by useGraph hook

