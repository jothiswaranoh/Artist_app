import React, { useEffect, useState } from 'react';
import { AuthService } from '../../services/AuthService';
import './ProfilePage.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔥 Load user from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile..."); 
        const data = await AuthService.getProfile();
        console.log("Profile data:", data);
        setUser(data);
        setFormData({
          name: data.name,
          email: data.email,
        });
      } catch (err) {
        console.error("Profile error:", err);
        setError('Failed to load profile');
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEdit = () => {
    if (!user) return;
    setFormData({
      name: user.name,
      email: user.email,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!user) return;
    setFormData({
      name: user.name,
      email: user.email,
    });
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const updatedUser = await AuthService.updateProfile(formData);

      // ✅ sync UI with backend response
      setUser(updatedUser);

      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <h1 className="profile-title">Profile</h1>

        <div className="profile-card">
          {!isEditing ? (
            <>
              <div className="profile-row">
                <span className="profile-label">Name</span>
                <span className="profile-value">{user?.name}</span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user?.email}</span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Role</span>
                <span className="profile-value">{user?.role}</span>
              </div>

              <div className="profile-actions">
                <button className="btn btn-primary" onClick={handleEdit}>
                  Edit
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-row">
                <label className="profile-label">Name</label>
                <input
                  className="profile-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-row">
                <label className="profile-label">Email</label>
                <input
                  className="profile-input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="profile-error">{error}</p>}

              <div className="profile-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;