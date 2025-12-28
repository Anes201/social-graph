import { peopleToReconnectWith } from './queries.js';

/**
 * Get people to reconnect with
 * High leverage, >3 months since interaction
 */
export function getReconnectSuggestions() {
  return peopleToReconnectWith();
}

/**
 * Format suggestion for display
 */
export function formatSuggestion(person) {
  const lastInteraction = person.lastInteraction 
    ? new Date(person.lastInteraction)
    : null;
  
  const monthsAgo = lastInteraction
    ? Math.floor((new Date() - lastInteraction) / (1000 * 60 * 60 * 24 * 30))
    : null;
  
  return {
    person,
    monthsAgo,
    reason: `High leverage score (${person.leverageScore}/100)${monthsAgo ? `, ${monthsAgo} months since last interaction` : ', no recent interaction'}`,
  };
}

