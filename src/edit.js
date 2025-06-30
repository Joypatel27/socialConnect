import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname:'',
    email: '',
    
  });
  const[user,setUser]=useState();
  
  const navigate=useNavigate();

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('http://localhost:5000/User/me', {
        credentials: 'include', // Important for session-based auth
      });
      const data = await res.json();
      setFormData({ firstname: data.firstname,lastname: data.lastname, email: data.email });
    };
    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/User/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    alert(result.message);
    navigate(`/Viewdetail/edit/${result.user._id}`)
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>

      <div>
        <label>FirstName:</label>
        <input name="firstname" value={formData.firstname} onChange={handleChange} />
      </div>
      <div>
        <label>LastName:</label>
        <input name="lastname" value={formData.lastname} onChange={handleChange} />
      </div>

      <div>
        <label>Email:</label>
        <input name="email" value={formData.email} onChange={handleChange} />
      </div>

      <button type="submit">Update Profile</button>
    </form>
  );
}

export default EditProfile;
