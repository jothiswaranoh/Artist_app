import React, { useState } from 'react';
import { X, Edit2, Mail, MapPin, User as UserIcon } from 'lucide-react';
import { ArtistProfileService } from '../../services/ArtistProfileService';
import type { ArtistProfile } from '../../services/ArtistProfileService';
import './UserDetailsModal.css'; // reuse existing modal styles

interface Props {
  artist: ArtistProfile;
  onClose: () => void;
  onSuccess?: () => void; // optional: refresh list
}

const ArtistEditModal: React.FC<Props> = ({ artist, onClose, onSuccess }) => {
  const [name, setName] = useState(artist.name || '');
  const [email, setEmail] = useState(artist.email || '');
  const [city, setCity] = useState(artist.city || '');
  const [bio, setBio] = useState(artist.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      await ArtistProfileService.update(artist.id, {
        name,
        email,
        city,
        bio,
      });

      onSuccess?.(); // refresh list if passed
      onClose();
    } catch (err: any) {
      console.error('Update artist failed:', err);
      setError(err?.message || 'Failed to update artist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-container add-user-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="admin-modal-header">
          <h3>
            <Edit2 size={18} style={{ marginRight: 8 }} />
            Edit Artist
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="admin-modal-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="form-group">
              <label>Name</label>
              <div className="input-with-icon">
                <UserIcon size={16} className="input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter artist name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* City */}
            <div className="form-group">
              <label>City</label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label>Bio</label>
              <div className="input-with-icon" style={{ height: 'auto' }}>
                <UserIcon
                  size={16}
                  className="input-icon"
                  style={{ top: '16px', transform: 'none' }}
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Enter artist bio"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {loading ? (
                <span className="spinner-small" />
              ) : (
                <Edit2 size={16} />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistEditModal;