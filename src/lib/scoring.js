/**
 * Calculate Business Leverage Score from 6 component scores
 * Formula: (capitalAccess + skillValue + networkReach + reliability + speed + alignment) * 10 / 6
 * Result: 0-100 integer
 */
export function calculateLeverageScore(scores) {
  const {
    capitalAccess = 0,
    skillValue = 0,
    networkReach = 0,
    reliability = 0, // Trust / Reliability
    speed = 0,       // Speed / Responsiveness
    alignment = 0,   // Alignment with goals
  } = scores;

  const sum = capitalAccess + skillValue + networkReach + reliability + speed + alignment;
  const leverageScore = Math.round((sum * 10) / 6);

  // Clamp to 0-100
  return Math.max(0, Math.min(100, leverageScore));
}

/**
 * Update leverage score for a node
 */
export function updateLeverageScore(node) {
  const leverageScore = calculateLeverageScore(node.scores || {});
  return {
    ...node,
    leverageScore,
    scores: {
      ...node.scores,
    },
  };
}

/**
 * Get score breakdown for display
 */
export function getScoreBreakdown(scores) {
  return {
    capitalAccess: scores.capitalAccess || 0,
    skillValue: scores.skillValue || 0,
    networkReach: scores.networkReach || 0,
    reliability: scores.reliability || 0,
    speed: scores.speed || 0,
    alignment: scores.alignment || 0,
    leverageScore: calculateLeverageScore(scores),
  };
}

/**
 * Validate score value (0-10)
 */
export function validateScore(value) {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(10, Math.round(num)));
}

