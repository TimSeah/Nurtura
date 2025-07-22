import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Mail, MapPin, Clock, Edit, Trash2 } from 'lucide-react';
import type { CareTeamMember } from '../types';
import { dataService } from '../services/dataService';
import Modal from '../components/Modal';
import './CareCircle.css';

const CareCircle: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMember[]>([]);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    role: '',
    relationship: 'Professional' as CareTeamMember['relationship'],
    phone: '',
    email: '',
    address: '',
    availability: [] as string[],
    specialties: '',
    emergencyContact: false
  });

  useEffect(() => {
    setCareTeamMembers(dataService.getCareTeamMembers());
  }, []);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData: Omit<CareTeamMember, 'id'> = {
      name: newMemberForm.name,
      role: newMemberForm.role,
      relationship: newMemberForm.relationship,
      phone: newMemberForm.phone,
      email: newMemberForm.email,
      address: newMemberForm.address || undefined,
      availability: newMemberForm.availability,
      specialties: newMemberForm.specialties ? newMemberForm.specialties.split(',').map(s => s.trim()) : undefined,
      emergencyContact: newMemberForm.emergencyContact
    };

    const savedMember = dataService.addCareTeamMember(memberData);
    setCareTeamMembers(prev => [...prev, savedMember]);
    
    // Reset form
    setNewMemberForm({
      name: '',
      role: '',
      relationship: 'Professional',
      phone: '',
      email: '',
      address: '',
      availability: [],
      specialties: '',
      emergencyContact: false
    });
    setShowAddForm(false);
  };

  const handleRemoveMember = (id: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      dataService.removeCareTeamMember(id);
      setCareTeamMembers(prev => prev.filter(member => member.id !== id));
    }
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setNewMemberForm(prev => ({
      ...prev,
      availability: checked 
        ? [...prev.availability, day]
        : prev.availability.filter(d => d !== day)
    }));
  };

  const emergencyContacts = careTeamMembers.filter(member => member.emergencyContact);
  const professionalCare = careTeamMembers.filter(member => member.relationship === 'Professional');
  const familyFriends = careTeamMembers.filter(member => member.relationship === 'Family' || member.relationship === 'Community');

  const getRoleColor = (relationship: CareTeamMember['relationship']) => {
    switch (relationship) {
      case 'Professional': return 'relationship-professional';
      case 'Family': return 'relationship-family';
      case 'Community': return 'relationship-community';
      default: return 'relationship-professional';
    }
  };

  return (
    <div className="care-circle">
      <div className="page-header">
        <h1>Care Circle</h1>
        <p>Manage your network of caregivers, family members, and healthcare professionals.</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="btn-icon" />
          Add Team Member
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Emergency Contacts</h2>
          <p className="card-description">Quick access to emergency contacts</p>
        </div>
        <div className="contacts-grid">
          {emergencyContacts.map(member => (
            <div key={member.id} className="emergency-contact-card">
              <div className="contact-header">
                <h3>{member.name}</h3>
                <span className="contact-role">{member.role}</span>
              </div>
              <div className="contact-actions">
                <button className="contact-btn phone">
                  <Phone className="btn-icon" />
                  Call
                </button>
                <button className="contact-btn email">
                  <Mail className="btn-icon" />
                  Email
                </button>
              </div>
              <p className="contact-phone">{member.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Care Team */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Users className="title-icon" />
            Professional Care Team
          </h2>
        </div>
        <div className="team-list">
          {professionalCare.map(member => (
            <div key={member.id} className="team-member-card">
              <div className="member-info">
                <div className="member-header">
                  <h3>{member.name}</h3>
                  <span 
                    className={`member-relationship-badge ${getRoleColor(member.relationship)}`}
                  >
                    {member.role}
                  </span>
                </div>
                <div className="member-details">
                  <div className="detail-item">
                    <Phone className="detail-icon" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="detail-item">
                    <Mail className="detail-icon" />
                    <span>{member.email}</span>
                  </div>
                  {member.address && (
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <span>{member.address}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <Clock className="detail-icon" />
                    <span>Available: {member.availability.join(', ')}</span>
                  </div>
                </div>
                {member.specialties && (
                  <div className="specialties">
                    {member.specialties.map(specialty => (
                      <span key={specialty} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="member-actions">
                <button className="btn btn-sm btn-secondary">
                  <Edit className="btn-icon" />
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 className="btn-icon" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family & Friends */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Family & Friends</h2>
        </div>
        <div className="team-list">
          {familyFriends.map(member => (
            <div key={member.id} className="team-member-card">
              <div className="member-info">
                <div className="member-header">
                  <h3>{member.name}</h3>
                  <span 
                    className={`member-relationship-badge ${getRoleColor(member.relationship)}`}
                  >
                    {member.role}
                  </span>
                </div>
                <div className="member-details">
                  <div className="detail-item">
                    <Phone className="detail-icon" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="detail-item">
                    <Mail className="detail-icon" />
                    <span>{member.email}</span>
                  </div>
                  <div className="detail-item">
                    <Clock className="detail-icon" />
                    <span>Available: {member.availability.join(', ')}</span>
                  </div>
                </div>
              </div>
              <div className="member-actions">
                <button className="btn btn-sm btn-secondary">
                  <Edit className="btn-icon" />
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 className="btn-icon" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add Team Member"
        size="large"
      >
        <form className="member-form" onSubmit={handleAddMember}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                placeholder="Full name" 
                value={newMemberForm.name}
                onChange={(e) => setNewMemberForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input 
                type="text" 
                placeholder="e.g., Doctor, Nurse, Son, Friend" 
                value={newMemberForm.role}
                onChange={(e) => setNewMemberForm(prev => ({ ...prev, role: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Relationship</label>
              <select 
                value={newMemberForm.relationship}
                onChange={(e) => setNewMemberForm(prev => ({ ...prev, relationship: e.target.value as CareTeamMember['relationship'] }))}
                required
              >
                <option value="">Select relationship</option>
                <option value="Professional">Professional</option>
                <option value="Family">Family</option>
                <option value="Community">Community</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input 
                type="tel" 
                placeholder="(555) 123-4567" 
                value={newMemberForm.phone}
                onChange={(e) => setNewMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                value={newMemberForm.email}
                onChange={(e) => setNewMemberForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input 
                type="checkbox" 
                checked={newMemberForm.emergencyContact}
                onChange={(e) => setNewMemberForm(prev => ({ ...prev, emergencyContact: e.target.checked }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address (Optional)</label>
            <input 
              type="text" 
              placeholder="Full address" 
              value={newMemberForm.address}
              onChange={(e) => setNewMemberForm(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Availability</label>
            <div className="checkbox-group">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <label key={day} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    value={day} 
                    checked={newMemberForm.availability.includes(day)}
                    onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Specialties (Optional)</label>
            <input 
              type="text" 
              placeholder="Comma-separated specialties" 
              value={newMemberForm.specialties}
              onChange={(e) => setNewMemberForm(prev => ({ ...prev, specialties: e.target.value }))}
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btn btn-primary">Add Member</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CareCircle;
