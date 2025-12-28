/**
 * Calculate relationship strength decay based on lastInteraction
 * Decay formula: strength = originalStrength * (0.95 ^ monthsSinceInteraction)
 */

/**
 * Calculate months between two dates
 */
function monthsBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const years = d2.getFullYear() - d1.getFullYear();
  const months = d2.getMonth() - d1.getMonth();
  return years * 12 + months + (d2.getDate() - d1.getDate()) / 30;
}

/**
 * Calculate decayed strength
 * @param {number} originalStrength - Original strength (1-10)
 * @param {string|Date} lastInteraction - Last interaction date
 * @param {string|Date} referenceDate - Reference date (default: now)
 * @returns {number} Decayed strength (1-10)
 */
export function calculateDecayedStrength(originalStrength, lastInteraction, referenceDate = new Date()) {
  if (!lastInteraction) {
    // No interaction date, apply maximum decay (assume 12 months)
    return Math.max(1, originalStrength * Math.pow(0.95, 12));
  }
  
  const monthsSince = monthsBetween(lastInteraction, referenceDate);
  if (monthsSince <= 0) {
    return originalStrength;
  }
  
  const decayed = originalStrength * Math.pow(0.95, monthsSince);
  return Math.max(1, Math.min(10, Math.round(decayed * 10) / 10));
}

/**
 * Apply decay to a relationship
 */
export function applyDecayToRelationship(relationship) {
  const decayedStrength = calculateDecayedStrength(
    relationship.strength,
    relationship.lastInteraction
  );
  
  return {
    ...relationship,
    decayedStrength,
    originalStrength: relationship.strength,
  };
}

/**
 * Apply decay to all relationships in graph
 * This should be called on graph load
 */
export async function applyDecayToAllRelationships(getGraph, updateRelationshipData) {
  const graph = getGraph();
  const edges = graph.edges();
  const now = new Date();
  
  const updates = [];
  
  for (const edgeId of edges) {
    const rel = graph.getEdgeAttributes(edgeId);
    if (rel.lastInteraction) {
      const decayedStrength = calculateDecayedStrength(rel.strength, rel.lastInteraction, now);
      
      // Only update if decayed strength is different (avoid unnecessary updates)
      if (Math.abs(decayedStrength - rel.strength) > 0.1) {
        updates.push({
          id: rel.id,
          strength: decayedStrength,
        });
      }
    }
  }
  
  // Batch update relationships
  for (const update of updates) {
    await updateRelationshipData(update.id, { strength: update.strength });
  }
  
  return updates.length;
}

