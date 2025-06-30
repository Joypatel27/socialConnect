import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {Button, Card, Container} from 'react-bootstrap';

const UserDetail = () => {
  const { id } = useParams(); // get ID from URL
  const [user, setUser] = useState(null);
  const navigate=useNavigate();

const URL = 'http://localhost:5000/User';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${URL}/${id}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <Container className='d-flex mt-5'>
     <Card> 
      <h3 className='card-header' >User Details</h3>
      <div className='card-body'>  
      <p><strong>First Name:</strong> {user.firstname} </p>
      <p><strong>Last Name: </strong>{user.lastname}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Password:</strong> {user.password}</p>
      <p><strong>Image: <img src={user.image} alt="User" style={{ width: '100px', height: '100px' }}/></strong></p>
      <Button variant='info' onClick={(e)=>navigate(`/Editprofile/${user._id}`)} >Edit</Button>
    </div>
    </Card>
    </Container>
  );
};

export default UserDetail;
