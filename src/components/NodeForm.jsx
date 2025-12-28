import { useState, useEffect } from 'react';
import ScoreEditor from './ScoreEditor.jsx';

export default function NodeForm({ node = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'person',
    name: '',
    email: '',
    phone: '',
    location: '',
    social: {
      linkedin: '',
      x: '',
      instagram: '',
      whatsapp: '',
    },
    occupation: {
      role: '',
      company: '',
      industry: '',
    },
    skills: [],
    scores: {
      capitalAccess: 0,
      skillValue: 0,
      networkReach: 0,
      reliability: 0,
      speed: 0,
      alignment: 0,
    },
    leverageScore: 0,
    notes: [],
    lastInteraction: null,
  });

  const [newSkill, setNewSkill] = useState({ tag: '', weight: 5 });

  useEffect(() => {
    if (node) {
      setFormData({
        type: node.type || 'person',
        name: node.name || '',
        email: node.email || '',
        phone: node.phone || '',
        location: node.location || '',
        social: node.social || { linkedin: '', x: '', instagram: '', whatsapp: '' },
        occupation: node.occupation || { role: '', company: '', industry: '' },
        skills: node.skills || [],
        scores: node.scores || {
          capitalAccess: 0,
          skillValue: 0,
          networkReach: 0,
          reliability: 0,
          speed: 0,
          alignment: 0,
        },
        leverageScore: node.leverageScore || 0,
        notes: node.notes || [],
        lastInteraction: node.lastInteraction || null,
      });
    }
  }, [node]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleScoreChange = (scores) => {
    setFormData(prev => ({ ...prev, scores, leverageScore: scores.leverageScore }));
  };

  const handleAddSkill = () => {
    if (newSkill.tag.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill, weight: parseInt(newSkill.weight) || 5 }],
      }));
      setNewSkill({ tag: '', weight: 5 });
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{node ? 'Edit' : 'Add'} {formData.type === 'person' ? 'Person' : 'Company'}</h2>
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="person">Person</option>
            <option value="company">Company</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Social Links</label>
          <input
            type="text"
            placeholder="LinkedIn"
            value={formData.social.linkedin}
            onChange={(e) => handleChange('social.linkedin', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="text"
            placeholder="X (Twitter)"
            value={formData.social.x}
            onChange={(e) => handleChange('social.x', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="text"
            placeholder="Instagram"
            value={formData.social.instagram}
            onChange={(e) => handleChange('social.instagram', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="text"
            placeholder="WhatsApp"
            value={formData.social.whatsapp}
            onChange={(e) => handleChange('social.whatsapp', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Occupation</label>
          <input
            type="text"
            placeholder="Role"
            value={formData.occupation.role}
            onChange={(e) => handleChange('occupation.role', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="text"
            placeholder="Company"
            value={formData.occupation.company}
            onChange={(e) => handleChange('occupation.company', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="text"
            placeholder="Industry"
            value={formData.occupation.industry}
            onChange={(e) => handleChange('occupation.industry', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Skill tag"
              value={newSkill.tag}
              onChange={(e) => setNewSkill({ ...newSkill, tag: e.target.value })}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Weight"
              value={newSkill.weight}
              onChange={(e) => setNewSkill({ ...newSkill, weight: e.target.value })}
              className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-700 rounded flex items-center gap-2"
              >
                {skill.tag} ({skill.weight})
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <ScoreEditor scores={formData.scores} onChange={handleScoreChange} />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
        >
          {node ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

