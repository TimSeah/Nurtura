import React, { useState } from 'react';
import Modal from './Modal';
import { Save } from 'lucide-react';
import type { CareNoteData } from '../types';
import './CareNoteModal.css';

interface CareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CareNoteData) => void;
}

const CareNoteModal: React.FC<CareNoteModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<CareNoteData>({
    recipientId: '',
    category: 'general',
    title: '',
    content: '',
    priority: 'normal',
    tags: [],
    dateTime: new Date().toISOString().slice(0, 16),
    isPrivate: false
  });

  const [tagInput, setTagInput] = useState('');

  const careRecipients = [
    { id: '1', name: 'Eleanor Johnson' },
    { id: '2', name: 'John Smith' },
    { id: '3', name: 'Mary Brown' }
  ];

  const noteCategories = [
    { value: 'general', label: 'General Care' },
    { value: 'medical', label: 'Medical Notes' },
    { value: 'behavioral', label: 'Behavioral Observations' },
    { value: 'medication', label: 'Medication Notes' },
    { value: 'diet', label: 'Diet & Nutrition' },
    { value: 'activity', label: 'Activities' },
    { value: 'communication', label: 'Communication' },
    { value: 'safety', label: 'Safety Concerns' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const suggestedTags = [
    'mood', 'appetite', 'sleep', 'mobility', 'pain', 'confusion',
    'social', 'family', 'medication-change', 'improvement', 'concern',
    'routine', 'exercise', 'therapy', 'doctor-visit'
  ];

  const handleInputChange = (field: keyof CareNoteData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleInputChange('tags', [...formData.tags, tag.trim()]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.recipientId && formData.title && formData.content) {
      onSave(formData);
      // Reset form
      setFormData({
        recipientId: '',
        category: 'general',
        title: '',
        content: '',
        priority: 'normal',
        tags: [],
        dateTime: new Date().toISOString().slice(0, 16),
        isPrivate: false
      });
      setTagInput('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Care Note" size="large">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Care Recipient</label>
            <select 
              value={formData.recipientId}
              onChange={(e) => handleInputChange('recipientId', e.target.value)}
              required
            >
              <option value="">Select recipient</option>
              {careRecipients.map(recipient => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select 
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              {noteCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Note Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Brief description of the note"
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Note Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Detailed observations, behaviors, concerns, or other relevant information..."
            rows={6}
            required
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Priority</label>
            <select 
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              {priorityLevels.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => handleInputChange('dateTime', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Tags</label>
          <div className="tag-input-container">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Add tags to categorize this note (press Enter to add)"
            />
            <button 
              type="button" 
              onClick={() => addTag(tagInput)}
              className="btn btn-sm btn-secondary"
            >
              Add Tag
            </button>
          </div>
          
          {/* Current tags */}
          {formData.tags.length > 0 && (
            <div className="tags-display">
              {formData.tags.map(tag => (
                <span 
                  key={tag}
                  className="tag-badge"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove-btn"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Suggested tags */}
          <div className="suggested-tags">
            <span>Suggested tags: </span>
            {suggestedTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="suggested-tag-btn"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
            />
            Mark as private (only visible to primary caregivers)
          </label>
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">
            <Save className="btn-icon" />
            Save Care Note
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CareNoteModal;
