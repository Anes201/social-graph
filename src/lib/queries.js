import { getGraph, getAllGraphNodes, getRelationshipsForNode, findPathsToIndustry } from './graph.js';

/**
 * Top underutilized connections
 * High leverage, low recent interaction
 */
export function topUnderutilizedConnections(limit = 5) {
  const graph = getGraph();
  const nodes = getAllGraphNodes();
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const scored = nodes
    .filter(node => {
      if (!node.lastInteraction) return true;
      const lastInteraction = new Date(node.lastInteraction);
      return lastInteraction < threeMonthsAgo;
    })
    .map(node => {
      const relationships = getRelationshipsForNode(node.id);
      const recentInteractions = relationships.filter(rel => {
        if (!rel.lastInteraction) return false;
        const lastInteraction = new Date(rel.lastInteraction);
        return lastInteraction > threeMonthsAgo;
      }).length;
      
      return {
        node,
        leverageScore: node.leverageScore || 0,
        recentInteractions,
        utilizationScore: (node.leverageScore || 0) / (recentInteractions + 1), // Higher leverage, fewer interactions = higher score
      };
    })
    .filter(item => item.leverageScore > 0)
    .sort((a, b) => b.utilizationScore - a.utilizationScore)
    .slice(0, limit);
  
  return scored.map(item => item.node);
}

/**
 * Shortest path to an industry
 */
export function shortestPathToIndustry(sourceNodeId, industry) {
  const paths = findPathsToIndustry(sourceNodeId, industry);
  if (paths.length === 0) return null;
  
  return paths[0]; // Return shortest path
}

/**
 * Connectors to investors (people who know investors but aren't investors)
 */
export function connectorsToInvestors() {
  const graph = getGraph();
  const nodes = getAllGraphNodes();
  
  // Find potential investors (high capitalAccess score or role/industry keywords)
  const investorKeywords = ['investor', 'vc', 'venture', 'capital', 'angel', 'fund'];
  const investors = nodes.filter(node => {
    const capitalAccess = node.scores?.capitalAccess || 0;
    const role = node.occupation?.role?.toLowerCase() || '';
    const industry = node.occupation?.industry?.toLowerCase() || '';
    const company = node.occupation?.company?.toLowerCase() || '';
    
    return capitalAccess >= 7 || 
           investorKeywords.some(keyword => 
             role.includes(keyword) || 
             industry.includes(keyword) || 
             company.includes(keyword)
           );
  });
  
  const investorIds = new Set(investors.map(i => i.id));
  
  // Find connectors: people connected to investors but not investors themselves
  const connectors = nodes
    .filter(node => !investorIds.has(node.id))
    .map(node => {
      const relationships = getRelationshipsForNode(node.id);
      const investorConnections = relationships.filter(rel => {
        const otherNode = rel.otherNode;
        return investorIds.has(otherNode.id);
      });
      
      return {
        node,
        investorConnections: investorConnections.length,
        connections: investorConnections.map(rel => rel.otherNode),
      };
    })
    .filter(item => item.investorConnections > 0)
    .sort((a, b) => b.investorConnections - a.investorConnections);
  
  return connectors;
}

/**
 * Fast validators - high speed + alignment, within timeframe
 */
export function fastValidators(timeframeDays = 48) {
  const nodes = getAllGraphNodes();
  const now = new Date();
  const timeframe = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
  
  return nodes
    .filter(node => {
      const speed = node.scores?.speed || 0;
      const alignment = node.scores?.alignment || 0;
      const lastInteraction = node.lastInteraction ? new Date(node.lastInteraction) : null;
      
      // High speed and alignment
      if (speed < 7 || alignment < 7) return false;
      
      // Within timeframe (recent interaction or no interaction = available)
      if (!lastInteraction) return true;
      return lastInteraction > timeframe;
    })
    .sort((a, b) => {
      const aScore = (a.scores?.speed || 0) + (a.scores?.alignment || 0);
      const bScore = (b.scores?.speed || 0) + (b.scores?.alignment || 0);
      return bScore - aScore;
    });
}

/**
 * Weak ties with high upside
 * Low relationship strength but high leverage potential
 */
export function weakTiesHighUpside() {
  const graph = getGraph();
  const nodes = getAllGraphNodes();
  
  const results = [];
  
  for (const node of nodes) {
    const relationships = getRelationshipsForNode(node.id);
    
    const weakTies = relationships
      .filter(rel => {
        const strength = rel.strength || 5;
        const leverage = rel.otherNode.leverageScore || 0;
        return strength <= 4 && leverage >= 50; // Weak tie but high leverage
      })
      .map(rel => ({
        node: node,
        connection: rel.otherNode,
        relationship: rel,
        potential: (rel.otherNode.leverageScore || 0) - (rel.strength || 5) * 10, // Leverage minus relationship cost
      }));
    
    results.push(...weakTies);
  }
  
  return results
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 20); // Top 20
}

/**
 * People to reconnect with
 * High leverage, >3 months since interaction
 */
export function peopleToReconnectWith() {
  const nodes = getAllGraphNodes();
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  return nodes
    .filter(node => {
      if (!node.lastInteraction) return false;
      const lastInteraction = new Date(node.lastInteraction);
      return lastInteraction < threeMonthsAgo && (node.leverageScore || 0) >= 40;
    })
    .sort((a, b) => (b.leverageScore || 0) - (a.leverageScore || 0))
    .slice(0, 10);
}

/**
 * Find people by industry
 */
export function findPeopleByIndustry(industry) {
  const nodes = getAllGraphNodes();
  const lowerIndustry = industry.toLowerCase();
  
  return nodes.filter(node => {
    const nodeIndustry = node.occupation?.industry?.toLowerCase() || '';
    const company = node.occupation?.company?.toLowerCase() || '';
    return nodeIndustry.includes(lowerIndustry) || company.includes(lowerIndustry);
  });
}

/**
 * Find people by skill tag
 */
export function findPeopleBySkill(skill) {
  const nodes = getAllGraphNodes();
  const lowerSkill = skill.toLowerCase();
  
  return nodes.filter(node => {
    const skills = node.skills || [];
    return skills.some(s => s.tag?.toLowerCase().includes(lowerSkill));
  });
}

