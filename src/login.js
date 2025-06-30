import React,{useState,useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, FormGroup, Card} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';



function Login() {
  const[formEmail,setFormEmail]=useState();
  const[password,setPassword]=useState();
  const[user,setUser]=useState();
  const navigate=useNavigate();  


const handleLogin = async (e) => {
  e.preventDefault();
  // localStorage.setItem("userId", data.user._id); 
  const res = await fetch('http://localhost:5000/User/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    
    body: JSON.stringify({ email: formEmail, password }),
    
  });

  const data = await res.json();
  if (res.ok) {
    alert(data.message);
    localStorage.setItem('user', JSON.stringify(data.user)); 
    navigate('/home');
  } else {
    alert(data.message);
  }
};
  return (
    <div class='container mt-5 d-flex justify-content-center align-items-center' style={{ minHeight: '80vh' }} >
      <Card style={{ width: '25rem' }} className='p-3 d-flex '>

    <h1 className='mb-3 text-primary text-center'>Login Page</h1>
    <Form onSubmit={handleLogin}>
    <Form.Group className='row mb-3 justify-content-center'>
        <Form.Label className='col-sm-3 col-form-label'>Email:</Form.Label>
        <div className='col-sm-9'>       
        <Form.Control type='email' value={formEmail} onChange={(e) => setFormEmail(e.target.value)}required/>
        </div>
    </Form.Group>
     <Form.Group className='row mb-3 justify-content-center'>
        <Form.Label className='col-sm-3 col-form-label'>Password:</Form.Label>
          <div className='col-sm-9'>
        <Form.Control type='password' value={password} onChange={(e) => setPassword(e.target.value)}required/>
          </div>  
      </Form.Group>
    <FormGroup className='text-center'>
        <Button type='submit' variant='primary'>Submit</Button>
    </FormGroup>
    <FormGroup className='text-center'>
      <p onClick={() => navigate('/regisform')}
      style={{ cursor: 'pointer' }}
      className='text-primary'>New User..Register Here?</p>
    </FormGroup>
        <FormGroup className='text-center'>
      <p onClick={() => navigate('/forgetpass')}
      style={{ cursor: 'pointer' }}
      className='text-primary'>Forget Password?</p>
    </FormGroup>
    </Form>
    </Card>
    </div>

  )
}
export default Login