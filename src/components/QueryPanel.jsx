import { useState } from 'react';
import {
  topUnderutilizedConnections,
  shortestPathToIndustry,
  connectorsToInvestors,
  fastValidators,
  weakTiesHighUpside,
  peopleToReconnectWith,
  findPeopleByIndustry,
} from '../lib/queries.js';
import { getAllGraphNodes } from '../lib/graph.js';

export default function QueryPanel({ onNodeSelect, onHighlightNodes }) {
  const [results, setResults] = useState([]);
  const [queryType, setQueryType] = useState(null);
  const [industryInput, setIndustryInput] = useState('');

  const handleQuery = async (queryFn, ...args) => {
    try {
      const result = await queryFn(...args);
      setResults(Array.isArray(result) ? result : [result].filter(Boolean));
      if (onHighlightNodes && Array.isArray(result)) {
        const nodeIds = result.map(r => r.id || r.node?.id).filter(Boolean);
        onHighlightNodes(nodeIds);
      }
    } catch (error) {
      console.error('Query error:', error);
      setResults([]);
    }
  };

  const handleTopUnderutilized = () => {
    setQueryType('topUnderutilized');
    handleQuery(topUnderutilizedConnections, 5);
  };

  const handleShortestPath = () => {
    if (!industryInput.trim()) {
      alert('Please enter an industry');
      return;
    }
    const nodes = getAllGraphNodes();
    if (nodes.length === 0) {
      alert('No nodes in graph');
      return;
    }
    setQueryType('shortestPath');
    const firstNode = nodes[0];
    const result = shortestPathToIndustry(firstNode.id, industryInput);
    setResults(result ? [result] : []);
    if (onHighlightNodes && result) {
      const pathIds = result.path.map(n => n.id).filter(Boolean);
      onHighlightNodes(pathIds);
    }
  };

  const handleConnectorsToInvestors = () => {
    setQueryType('connectors');
    handleQuery(connectorsToInvestors);
  };

  const handleFastValidators = () => {
    setQueryType('fastValidators');
    handleQuery(fastValidators, 48);
  };

  const handleWeakTies = () => {
    setQueryType('weakTies');
    handleQuery(weakTiesHighUpside);
  };

  const handleReconnect = () => {
    setQueryType('reconnect');
    handleQuery(peopleToReconnectWith);
  };

  const handleFindByIndustry = () => {
    if (!industryInput.trim()) {
      alert('Please enter an industry');
      return;
    }
    setQueryType('byIndustry');
    handleQuery(findPeopleByIndustry, industryInput);
  };

  const renderResult = (result, index) => {
    if (!result) return null;

    const node = result.node || result;
    const path = result.path;

    return (
      <div
        key={index}
        className="p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
        onClick={() => onNodeSelect && onNodeSelect(node.id)}
      >
        <div className="font-medium">{node.name || node.id}</div>
        {node.leverageScore !== undefined && (
          <div className="text-sm text-gray-400">Leverage: {node.leverageScore}/100</div>
        )}
        {node.occupation?.role && (
          <div className="text-sm text-gray-400">{node.occupation.role}</div>
        )}
        {node.occupation?.company && (
          <div className="text-sm text-gray-400">{node.occupation.company}</div>
        )}
        {path && (
          <div className="mt-2 text-xs text-blue-400">
            Path length: {path.length} steps
          </div>
        )}
        {result.investorConnections !== undefined && (
          <div className="text-sm text-gray-400">
            Connected to {result.investorConnections} investor(s)
          </div>
        )}
        {result.connection && (
          <div className="mt-2 text-xs text-gray-400">
            Via: {result.connection.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-black text-white tracking-tight">STRATEGIC QUERIES</h2>
        <p className="text-xs text-gray-500 font-medium uppercase mt-1">Extract Business Leverage</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">High ROI</h3>
          <button
            onClick={handleTopUnderutilized}
            className="w-full px-4 py-3 bg-gray-800/50 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500/50 rounded-xl text-left transition-all group"
          >
            <div className="text-sm font-bold text-white group-hover:text-blue-400">Underutilized Links</div>
            <div className="text-[10px] text-gray-500 group-hover:text-blue-300 uppercase tracking-tighter mt-0.5">High leverage, low interaction</div>
          </button>

          <button
            onClick={handleReconnect}
            className="w-full px-4 py-3 bg-gray-800/50 hover:bg-emerald-600/20 border border-gray-700 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <div className="text-sm font-bold text-white group-hover:text-emerald-400">Reconnect Priority</div>
            <div className="text-[10px] text-gray-500 group-hover:text-emerald-300 uppercase tracking-tighter mt-0.5">Critical gaps in network</div>
          </button>

          <button
            onClick={handleConnectorsToInvestors}
            className="w-full px-4 py-3 bg-gray-800/50 hover:bg-purple-600/20 border border-gray-700 hover:border-purple-500/50 rounded-xl text-left transition-all group"
          >
            <div className="text-sm font-bold text-white group-hover:text-purple-400">Investor Connectors</div>
            <div className="text-[10px] text-gray-500 group-hover:text-purple-300 uppercase tracking-tighter mt-0.5">Proxies to capital access</div>
          </button>

          <button
            onClick={handleFastValidators}
            className="w-full px-4 py-3 bg-gray-800/50 hover:bg-rose-600/20 border border-gray-700 hover:border-rose-500/50 rounded-xl text-left transition-all group"
          >
            <div className="text-sm font-bold text-white group-hover:text-rose-400">48h Idea Validation</div>
            <div className="text-[10px] text-gray-500 group-hover:text-rose-300 uppercase tracking-tighter mt-0.5">High speed + alignment</div>
          </button>

          <button
            onClick={handleWeakTies}
            className="w-full px-4 py-3 bg-gray-800/50 hover:bg-amber-600/20 border border-gray-700 hover:border-amber-500/50 rounded-xl text-left transition-all group"
          >
            <div className="text-sm font-bold text-white group-hover:text-amber-400">Weak Ties High Upside</div>
            <div className="text-[10px] text-gray-500 group-hover:text-amber-300 uppercase tracking-tighter mt-0.5">Hidden opportunities</div>
          </button>

          <div className="pt-2 border-t border-gray-700">
            <input
              type="text"
              placeholder="Industry (e.g., tech, finance)"
              value={industryInput}
              onChange={(e) => setIndustryInput(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white mb-2"
            />
            <button
              onClick={handleShortestPath}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-left mb-2"
            >
              Shortest Path to Industry
            </button>
            <button
              onClick={handleFindByIndustry}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-left"
            >
              Find People by Industry
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">
              Results ({results.length})
            </h3>
            <div className="space-y-2">
              {results.map((result, index) => renderResult(result, index))}
            </div>
          </div>
        )}

        {queryType && results.length === 0 && (
          <div className="text-gray-400 text-sm">No results found</div>
        )}
      </div>
    </div>
  );
}

