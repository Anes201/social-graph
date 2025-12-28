import { getAllNodes } from './db.js';
import { addNode } from './graph.js';

const ROOT_NODE_ID = 'root';

/**
 * Initialize root node if it doesn't exist
 */
export async function ensureRootNode() {
  const nodes = await getAllNodes();
  const rootNode = nodes.find(n => n.id === ROOT_NODE_ID);

  if (!rootNode) {
    console.log('ensureRootNode: Creating root node for the first time');
    await addNode({
      id: ROOT_NODE_ID,
      type: 'person',
      name: 'Me',
      email: '',
      phone: '',
      location: '',
      social: {},
      occupation: { role: 'System Owner', company: 'PRIG', industry: 'Intelligence' },
      skills: [],
      scores: {
        trust: 10,
        influence: 10,
        capitalAccess: 10,
        skillValue: 10,
        networkReach: 10,
        reliability: 10,
        speed: 10,
        alignment: 10,
      },
      leverageScore: 100,
      notes: [],
      lastInteraction: new Date().toISOString(),
      metadata: { isRoot: true },
      x: 0,
      y: 0,
    });
    return true;
  }
  return false;
}

export function getRootNodeId() {
  return ROOT_NODE_ID;
}

