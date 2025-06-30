import React, { useState } from 'react';
import axios from 'axios';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setResetLink('');

   try {
    const res = await axios.post('http://localhost:5000/User/forget-password', { email });

    setMessage(res.data.message);
    if (res.data.resetLink) {
      setResetLink(res.data.resetLink);
    }

    setEmail('');
  } catch (err) {
    setMessage(err.response?.data?.message || 'Error sending link');
  }

  setLoading(false);
};

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h3 className="mb-4">Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {message && (
        <div className="alert alert-info mt-3">{message}</div>
      )}
      {resetLink && (
  <div className="alert alert-success mt-3 text-break">
    Reset Link: <a href={resetLink} className='text-break'>{resetLink}</a>
  </div>
)}

    </div>
  );
};

export default Forgot;
