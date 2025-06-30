// React Post Upload
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Container ,Form, FormGroup, FormLabel ,Card} from "react-bootstrap";


function CreatePost() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("image", image); // file input
  formData.append("caption", caption); // text input

  try {
    const res = await axios.post("http://localhost:5000/api/posts/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    });
    alert("Post uploaded!");
  } catch (err) {
    console.error(err);
  }
  navigate('/posts')
};


  return (
  
  
  <Container className="d-flex justify-content-center"> 
    <div className="card mt-5 p-3 d-flex justify-content-center " style={{width:'40rem'}}>
    <Form onSubmit={handleSubmit} encType="multipart/form-data">
    <h1 className="text-center">Posts</h1>
    <FormGroup className="row mt-4">
    <FormLabel className="col-sm-2">Image:</FormLabel>
      <div className="col">
      <Form.Control type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
      </div>
      </FormGroup>

      <FormGroup className="row mt-3">
        <FormLabel className="col-sm-2">Caption:</FormLabel>
        <div className="col">
      <Form.Control type="text" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
      </div>
      </FormGroup>
      <FormGroup className="text-center">
        <Button className="mt-2 col-5" 
        type="submit">
          Upload
          </Button>
      </FormGroup>
    </Form>
    </div>
    </Container>
    
  );
}

export default CreatePost;
