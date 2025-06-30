import { useState } from 'react';
import axios from 'axios';

function Password() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
    //   setMessage("New passwords don't match!");
    alert("New passwords don't match!");
      return;
    }
    try {
      await axios.post(
        'http://localhost:5000/User/change-password',
        { currentPassword, newPassword },
        { withCredentials: true }
      );
    //   setMessage('Password changed successfully!');
    alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
    //   setMessage(err.response?.data?.message || 'Error changing password');
    alert(err.response?.data?.message || 'Error changing password');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Current Password</label>
          <input
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit">Change Password</button>
      </form>
      {/* {message && <div className="alert alert-info mt-3">{message}</div>} */}
    </div>
  );
}

export default Password;
