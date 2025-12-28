import { useState, useEffect } from 'react';

export default function EdgeForm({ relationship = null, sourceNodeId, targetNodeId: initialTargetNodeId, allNodes = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    source: sourceNodeId || '',
    target: initialTargetNodeId || '',
    type: 'business',
    strength: 5,
    direction: 'bidirectional',
    contextTags: [],
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (relationship) {
      setFormData({
        source: relationship.source || sourceNodeId || '',
        target: relationship.target || initialTargetNodeId || '',
        type: relationship.type || 'business',
        strength: relationship.strength || 5,
        direction: relationship.direction || 'bidirectional',
        contextTags: relationship.contextTags || [],
      });
    }
  }, [relationship, sourceNodeId, initialTargetNodeId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.contextTags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        contextTags: [...prev.contextTags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      contextTags: prev.contextTags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.source || !formData.target) {
      alert('Please select both source and target nodes');
      return;
    }
    if (formData.source === formData.target) {
      alert('Source and target cannot be the same');
      return;
    }
    if (onSave) {
      onSave({
        ...formData,
        strength: parseInt(formData.strength),
      });
    }
  };

  const availableNodes = allNodes.filter(n => n.id !== formData.source);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{relationship ? 'Edit' : 'Add'} Relationship</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Source</label>
        {sourceNodeId ? (
          <div className="px-3 py-2 bg-gray-700 rounded text-sm">
            {allNodes.find(n => n.id === sourceNodeId)?.name || sourceNodeId}
          </div>
        ) : (
          <select
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="">Select source node</option>
            {allNodes.map(node => (
              <option key={node.id} value={node.id}>{node.name || node.id}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Target</label>
        <select
          value={formData.target}
          onChange={(e) => handleChange('target', e.target.value)}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          <option value="">Select target node</option>
          {availableNodes.map(node => (
            <option key={node.id} value={node.id}>{node.name || node.id}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          <option value="friend">Friend</option>
          <option value="business">Business</option>
          <option value="family">Family</option>
          <option value="intro">Introduction</option>
          <option value="online-only">Online Only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Strength: {formData.strength}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.strength}
          onChange={(e) => handleChange('strength', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Direction</label>
        <select
          value={formData.direction}
          onChange={(e) => handleChange('direction', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          <option value="bidirectional">Bidirectional</option>
          <option value="source-to-target">Source → Target</option>
          <option value="target-to-source">Target → Source</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Context Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="e.g., ecom, dev, money, logistics"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.contextTags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-700 rounded flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
        >
          {relationship ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

