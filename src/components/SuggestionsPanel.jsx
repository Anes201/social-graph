import { useState, useEffect } from 'react';
import { getReconnectSuggestions, formatSuggestion } from '../lib/suggestions.js';

export default function SuggestionsPanel({ onNodeSelect, onClose }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const loadSuggestions = () => {
      const results = getReconnectSuggestions();
      setSuggestions(results.map(formatSuggestion));
    };
    
    loadSuggestions();
    // Refresh every 5 minutes
    const interval = setInterval(loadSuggestions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="w-80 h-full bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Reconnect Suggestions</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
            >
              Close
            </button>
          )}
        </div>

        <div className="text-sm text-gray-400">
          People with high leverage scores who haven't been contacted recently
        </div>

        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.person.id}
              className="p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
              onClick={() => onNodeSelect && onNodeSelect(suggestion.person.id)}
            >
              <div className="font-medium">{suggestion.person.name}</div>
              <div className="text-sm text-gray-400 mt-1">
                Leverage: {suggestion.person.leverageScore}/100
              </div>
              {suggestion.monthsAgo !== null && (
                <div className="text-xs text-gray-500 mt-1">
                  {suggestion.monthsAgo} months ago
                </div>
              )}
              <div className="text-xs text-blue-400 mt-1">
                {suggestion.reason}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

