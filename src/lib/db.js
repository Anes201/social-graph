import Dexie from 'dexie';

// Define the database schema
class PRIGDatabase extends Dexie {
  constructor() {
    super('PRIGDatabase');
    
    // Define schema
    this.version(1).stores({
      nodes: 'id, type, name, email, leverageScore, lastInteraction',
      relationships: 'id, source, target, type, strength, lastInteraction'
    });
    
    // Define table classes
    this.nodes = this.table('nodes');
    this.relationships = this.table('relationships');
  }
}

// Create database instance
export const db = new Dexie('PRIGDatabase');

// Define schema
db.version(2).stores({
  nodes: 'id, type, name, email, leverageScore, lastInteraction, [occupation.industry], [occupation.company]',
  relationships: 'id, source, target, type, strength, lastInteraction'
});

// Helper functions for CRUD operations

// Node operations
export async function createNode(node) {
  return await db.nodes.add(node);
}

export async function getNode(id) {
  return await db.nodes.get(id);
}

export async function getAllNodes() {
  return await db.nodes.toArray();
}

export async function getNodesByType(type) {
  return await db.nodes.where('type').equals(type).toArray();
}

export async function updateNode(id, updates) {
  return await db.nodes.update(id, updates);
}

export async function deleteNode(id) {
  // Also delete all relationships involving this node
  await db.relationships.where('source').equals(id).delete();
  await db.relationships.where('target').equals(id).delete();
  return await db.nodes.delete(id);
}

// Relationship operations
export async function createRelationship(relationship) {
  return await db.relationships.add(relationship);
}

export async function getRelationship(id) {
  return await db.relationships.get(id);
}

export async function getAllRelationships() {
  return await db.relationships.toArray();
}

export async function getRelationshipsByNode(nodeId) {
  const outgoing = await db.relationships.where('source').equals(nodeId).toArray();
  const incoming = await db.relationships.where('target').equals(nodeId).toArray();
  return [...outgoing, ...incoming];
}

export async function getRelationshipBetween(source, target) {
  const forward = await db.relationships.where('[source+target]').equals([source, target]).first();
  const reverse = await db.relationships.where('[source+target]').equals([target, source]).first();
  return forward || reverse;
}

export async function updateRelationship(id, updates) {
  return await db.relationships.update(id, updates);
}

export async function deleteRelationship(id) {
  return await db.relationships.delete(id);
}

// Batch operations
export async function bulkCreateNodes(nodes) {
  return await db.nodes.bulkAdd(nodes);
}

export async function bulkCreateRelationships(relationships) {
  return await db.relationships.bulkAdd(relationships);
}

// Search operations
export async function searchNodes(query) {
  const lowerQuery = query.toLowerCase();
  return await db.nodes
    .filter(node => 
      node.name?.toLowerCase().includes(lowerQuery) ||
      node.email?.toLowerCase().includes(lowerQuery) ||
      node.occupation?.role?.toLowerCase().includes(lowerQuery) ||
      node.occupation?.company?.toLowerCase().includes(lowerQuery) ||
      node.occupation?.industry?.toLowerCase().includes(lowerQuery)
    )
    .toArray();
}

export default db;

