import { useState } from 'react';
import { getRelationshipsForNode } from '../lib/graph.js';
import ScoreEditor from './ScoreEditor.jsx';
import EdgeForm from './EdgeForm.jsx';
import RadarChart from './RadarChart.jsx';

export default function NodePanel({ node, onUpdate, onDelete, onClose, onAddRelationship, allNodes = [], onEdit }) {
  const [editingScores, setEditingScores] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [newNote, setNewNote] = useState({ text: '', date: new Date().toISOString().split('T')[0] });

  if (!node) return null;

  const relationships = getRelationshipsForNode(node.id);
  const notes = node.notes || [];

  const handleScoreUpdate = async (scores) => {
    if (onUpdate) {
      await onUpdate(node.id, { scores, leverageScore: scores.leverageScore });
    }
    setEditingScores(false);
  };

  const handleAddNote = () => {
    if (newNote.text.trim()) {
      const updatedNotes = [...notes, { ...newNote, date: newNote.date || new Date().toISOString() }];
      if (onUpdate) {
        onUpdate(node.id, {
          notes: updatedNotes,
          lastInteraction: newNote.date || new Date().toISOString(),
        });
      }
      setNewNote({ text: '', date: new Date().toISOString().split('T')[0] });
      setEditingNote(false);
    }
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    if (onUpdate) {
      onUpdate(node.id, { notes: updatedNotes });
    }
  };

  return (
    <div className="w-96 h-full bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-white">{node.name || 'Unnamed'}</h2>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                title="Edit full details"
              >
                ✏️ Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
            >
              ✕
            </button>
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this node?')) {
                    onDelete(node.id);
                  }
                }}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                title="Delete node"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {node.email && (
            <div>
              <span className="text-gray-400">Email:</span> {node.email}
            </div>
          )}
          {node.phone && (
            <div>
              <span className="text-gray-400">Phone:</span> {node.phone}
            </div>
          )}
          {node.location && (
            <div>
              <span className="text-gray-400">Location:</span> {node.location}
            </div>
          )}
          {node.occupation?.role && (
            <div>
              <span className="text-gray-400">Role:</span> {node.occupation.role}
            </div>
          )}
          {node.occupation?.company && (
            <div>
              <span className="text-gray-400">Company:</span> {node.occupation.company}
            </div>
          )}
          {node.occupation?.industry && (
            <div>
              <span className="text-gray-400">Industry:</span> {node.occupation.industry}
            </div>
          )}
        </div>

        {node.social && Object.values(node.social).some(v => v) && (
          <div>
            <h3 className="text-sm font-medium mb-2">Social Links</h3>
            <div className="flex flex-wrap gap-2">
              {node.social.linkedin && (
                <a href={node.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  LinkedIn
                </a>
              )}
              {node.social.x && (
                <a href={node.social.x} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  X
                </a>
              )}
              {node.social.instagram && (
                <a href={node.social.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  Instagram
                </a>
              )}
              {node.social.whatsapp && (
                <a href={node.social.whatsapp} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        {node.skills && node.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {node.skills.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-gray-700 rounded text-sm">
                  {skill.tag} ({skill.weight})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Leverage Profile</h3>
            <div className="text-2xl font-black text-blue-500">{node.leverageScore || 0}</div>
          </div>

          <RadarChart
            scores={node.scores || {}}
            size={240}
            color="#3b82f6"
          />

          {!editingScores ? (
            <button
              onClick={() => setEditingScores(true)}
              className="w-full mt-4 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition-all"
            >
              Adjust Component Scores
            </button>
          ) : (
            <div className="space-y-4 mt-4">
              <ScoreEditor scores={node.scores || {}} onChange={handleScoreUpdate} />
              <button
                onClick={() => setEditingScores(false)}
                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-all"
              >
                Close Editor
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Relationships ({relationships.length})</h3>
            <button
              onClick={() => setShowAddRelationship(!showAddRelationship)}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
            >
              + Add
            </button>
          </div>
          {showAddRelationship && (
            <div className="mb-2">
              <EdgeForm
                sourceNodeId={node.id}
                allNodes={allNodes}
                onSave={(relData) => {
                  if (onAddRelationship) {
                    onAddRelationship(relData);
                  }
                  setShowAddRelationship(false);
                }}
                onCancel={() => setShowAddRelationship(false)}
              />
            </div>
          )}
          <div className="space-y-2">
            {relationships.map((rel) => (
              <div key={rel.id} className="p-2 bg-gray-700 rounded text-sm">
                <div className="font-medium">{rel.otherNode.name}</div>
                <div className="text-gray-400 text-xs">
                  {rel.type} • Strength: {rel.strength}/10
                </div>
                {rel.contextTags && rel.contextTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rel.contextTags.map((tag, i) => (
                      <span key={i} className="px-1 py-0.5 bg-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Notes & Timeline</h3>
            <button
              onClick={() => setEditingNote(!editingNote)}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
            >
              + Add Note
            </button>
          </div>
          {editingNote && (
            <div className="mb-2 space-y-2">
              <input
                type="date"
                value={newNote.date}
                onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
              />
              <textarea
                value={newNote.text}
                onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
                placeholder="Add a note..."
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingNote(false);
                    setNewNote({ text: '', date: new Date().toISOString().split('T')[0] });
                  }}
                  className="flex-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {notes
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((note, index) => (
                <div key={index} className="p-2 bg-gray-700 rounded text-sm">
                  <div className="text-gray-400 text-xs mb-1">
                    {new Date(note.date).toLocaleDateString()}
                  </div>
                  <div>{note.text}</div>
                  <button
                    onClick={() => handleDeleteNote(index)}
                    className="mt-1 text-red-400 hover:text-red-300 text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
          {node.lastInteraction && (
            <div className="mt-2 text-xs text-gray-400">
              Last interaction: {new Date(node.lastInteraction).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

