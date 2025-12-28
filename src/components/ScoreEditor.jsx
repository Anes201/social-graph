import { useState, useEffect } from 'react';
import { calculateLeverageScore, validateScore } from '../lib/scoring.js';

export default function ScoreEditor({ scores = {}, onChange }) {
  const [localScores, setLocalScores] = useState({
    capitalAccess: scores.capitalAccess || 0,
    skillValue: scores.skillValue || 0,
    networkReach: scores.networkReach || 0,
    reliability: scores.reliability || 0,
    speed: scores.speed || 0,
    alignment: scores.alignment || 0,
  });

  useEffect(() => {
    setLocalScores({
      capitalAccess: scores.capitalAccess || 0,
      skillValue: scores.skillValue || 0,
      networkReach: scores.networkReach || 0,
      reliability: scores.reliability || 0,
      speed: scores.speed || 0,
      alignment: scores.alignment || 0,
    });
  }, [scores]);

  const handleChange = (key, value) => {
    const validated = validateScore(value);
    const newScores = { ...localScores, [key]: validated };
    setLocalScores(newScores);
    
    if (onChange) {
      const leverageScore = calculateLeverageScore(newScores);
      onChange({ ...newScores, leverageScore });
    }
  };

  const leverageScore = calculateLeverageScore(localScores);

  const scoreLabels = {
    capitalAccess: 'Capital Access',
    skillValue: 'Skill Value',
    networkReach: 'Network Reach',
    reliability: 'Trust / Reliability',
    speed: 'Speed / Responsiveness',
    alignment: 'Alignment with Goals',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Business Leverage Score</h3>
        <div className="text-2xl font-bold text-blue-400">{leverageScore}/100</div>
      </div>
      
      {Object.entries(scoreLabels).map(([key, label]) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-sm">
            <label className="text-gray-300">{label}</label>
            <span className="text-gray-400">{localScores[key]}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={localScores[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

