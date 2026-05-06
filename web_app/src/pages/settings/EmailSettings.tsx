import React, { useState } from "react";
import { AuthService } from "../../services/AuthService";
import { UserService } from "../../services/UserService";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./EmailSettings.css";

const EmailSettings: React.FC = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email cannot be empty");
      return;
    }

    try {
      setLoading(true);

      await UserService.updateUser(user.id, { email });

      // update local storage user
      const updatedUser = { ...user, email };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Email updated successfully");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-settings-page">

      {/* Back */}
      <button className="back-btn" onClick={() => navigate("/settings")}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="email-settings-card">

        {/* Header */}
        <div className="email-settings-header">
          <Mail size={18} />
          <div>
            <h2>Email Settings</h2>
            <p>Update your account email address</p>
          </div>
        </div>

        {/* Input */}
        <div className="email-field">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Messages */}
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {/* Button */}
        <button
          className="save-btn"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="spin" />
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </button>

      </div>
    </div>
  );
};

export default EmailSettings;