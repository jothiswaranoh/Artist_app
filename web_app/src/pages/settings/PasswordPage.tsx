import React, { useState } from 'react';
import { AuthService } from '../../services/AuthService';
import './PasswordPage.css';

const PasswordPage: React.FC = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!formData.current_password) {
      return 'Current password is required';
    }

    if (!formData.new_password) {
      return 'New password is required';
    }

    if (formData.new_password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (formData.new_password !== formData.confirm_password) {
      return 'Passwords do not match';
    }

    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await AuthService.updatePassword(formData);

      setSuccess('Password updated successfully');

      // reset form
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to update password'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="password-page">
      <div className="password-wrapper">
        <h1 className="password-title">Change Password</h1>

        <div className="password-card">
          <div className="password-row">
            <label className="password-label">Current Password</label>
            <input
              type="password"
              name="current_password"
              className="password-input"
              placeholder="Enter current password"
              value={formData.current_password}
              onChange={handleChange}
            />
          </div>

          <div className="password-row">
            <label className="password-label">New Password</label>
            <input
              type="password"
              name="new_password"
              placeholder="Enter new password"
              className="password-input"
              value={formData.new_password}
              onChange={handleChange}
            />
          </div>

          <div className="password-row">
            <label className="password-label">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              className="password-input"
              placeholder="Confirm new password"
              value={formData.confirm_password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="password-error">{error}</p>}
          {success && <p className="password-success">{success}</p>}

          <div className="password-actions">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordPage;