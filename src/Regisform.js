import React, { useState ,useEffect } from 'react';
import { Form, Button, Container, FormGroup, FormLabel} from 'react-bootstrap';
import { useNavigate , useParams} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const URL = 'http://localhost:5000/User';

function FormPage() {
  const [firstname, setFirstName] = useState('');
  const[lastname,setLastName]=useState('');
  const[number,setNumber]=useState('');
  const [formEmail, setFormEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const[UpdateId,setUpdateId]=useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };
 
  
 const { id } = useParams(); 
 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const method= id? 'PATCH':'POST';
    const endpoint = id ? `${URL}/${id}` : `${URL}`;
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstname,lastname,number, email: formEmail, password ,image: imageBase64}),
    });
    if (!response.ok) {
           const text = await response.text();
           throw new Error(`Server error : ${response.status} ${text}`);
                    }
    const result = await response.json();
    alert(result.message);              
    setFirstName('');
    setLastName('');
    setNumber('');                                          //clean the form filed after submiting form
    setFormEmail('');
    setPassword('');
    setUpdateId(null);            
    setImageBase64('');
    navigate('/')
    // fetchData(page,sort);
  } catch (error) {
    console.error('Fetch error:', error); 
    alert('Error\n' + error.message);
  }
};

 


  return (
    <Container className="mt-5">
      <Form className="p-4" onSubmit={handleSubmit}>
        {/* <h2 className="mb-3 text-primary text-center">{id? 'Update user':'Add Entry'}</h2> */}

        <Form.Group className="row mb-3 justify-content-center">
          <Form.Label className="col-sm-1 col-form-label">First Name:</Form.Label>
          <div className="col-sm-6">
            <Form.Control type="text" value={firstname} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
        </Form.Group>
        
        <Form.Group className="row mb-3 justify-content-center">
          <Form.Label className="col-sm-1 col-form-label">Last Name:</Form.Label>
          <div className="col-sm-6">
            <Form.Control type="text" value={lastname} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </Form.Group>

        
        <Form.Group className="row mb-3 justify-content-center">
          <Form.Label className="col-sm-1 col-form-label">Phone Number:</Form.Label>
          <div className="col-sm-6">
            <Form.Control type="tel" minLength="10" maxLength="10" value={number} pattern='[0-9]*' onChange={(e) => setNumber(e.target.value)} required />
          </div>
        </Form.Group>

        <Form.Group className="row mb-3 justify-content-center">
          <Form.Label className="col-sm-1 col-form-label">Email: </Form.Label>
          <div className="col-sm-6">
            <Form.Control type="email"  value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
          </div>
        </Form.Group>

        <FormGroup className="row mb-3 justify-content-center">
          <FormLabel className="col-sm-1 col-form-label">Password:</FormLabel>
          <div className="col-sm-6">
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </FormGroup>

        <Form.Group controlId="formFile" className="row mb-3 justify-content-center">
          <FormLabel className="col-sm-1 col-form-label">Image: </FormLabel>
          <div className="col-sm-6">
            <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
            {imageBase64 && (
              <div className="text-center mt-2">
              <img src={imageBase64} alt="Selected" style={{ cursor:'pointer', maxHeight: '150px', borderRadius: '8px' }} />
              </div>
            )}
          </div>
        </Form.Group>

        <Form.Group className="d-flex justify-content-center gap-2">
          <Button type="submit" variant="primary">Submit</Button>      
        </Form.Group>
      </Form>
    </Container>
  );
}

export default FormPage;