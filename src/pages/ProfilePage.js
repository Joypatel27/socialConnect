import React ,{useState}from 'react'
import { Form, Row, Col, Button, Card, Container ,Collapse} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MyPosts from '../MyPosts';

function ProfilePage() {
const [users, setUsers] = useState([])
const storedUser = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
   const [friends, setFriends] = useState([]);
     const navigate = useNavigate();

     const [storeduser, setStoredUser] = useState(JSON.parse(localStorage.getItem("user")));
     
       const loggedInUserId = storeduser?._id;     
  const fetchFriends = async () => {
    try {
      const res = await fetch("http://localhost:5000/friends/my-friends", {
        credentials: 'include', 
      });
      const data = await res.json();
      console.log("Friends response:", data); 
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };
       const toggleFriends = () => {
    setOpen(!open);
    if (!open) fetchFriends(); 
  };
  
  const handleUnfriend = async (friendId) => {
  try {
    const res = await fetch(`http://localhost:5000/friends/unfriend/${friendId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      alert("Unfriended successfully");
      fetchFriends(); 
    } else {
      const err = await res.json();
      alert(err.message);
    }
  } catch (error) {
    alert("Error unfriending user");
    console.error(error);
  }
};
  return (
    <>
    <Container className='mt-5'>
    {storeduser && (
    <Card className="mb-4">
    <Card.Body>
      <h5>My Profile</h5>
      <p><strong>First Name:</strong> {storeduser.firstname}</p>
      <p><strong>Last Name:</strong> {storeduser.lastname}</p>
      <p><strong>Email:</strong> {storeduser.email}</p>
      <p><strong>Phone Number:</strong> {storeduser.number}</p>
      <div className='d-flex gap-2'>
      <Button variant="primary" onClick={(e) => { e.stopPropagation();  navigate(`/form/${storeduser._id}`);}}>Edit</Button>
      <Button variant="success" onClick={toggleFriends} aria-controls='example-fade-text' aria-expanded={open}>Friends List</Button>
      <Button variant="info"onClick={()=> navigate('/postform')}>+ Add Post</Button>
      <Button variant="info"onClick={()=> navigate('/posts')}>Feed</Button>
      <Button variant="info"onClick={()=> navigate('/my-posts')}>My Post</Button>
      </div>
        <div style={{ minHeight: '0px' }}>
            <Collapse in={open} dimension="width">
              <div id="example-collapse-text" className='mt-3'>
                <Card body style={{ width: '400px' }}>
                  <h6>My Friends:</h6>
                  <ul>
                    {friends.length > 0 ? (
                      friends.map(friend => (
                        <li key={friend._id}>
                          {friend.firstname} {friend.lastname} ({friend.email}) <Button variant="danger" onClick={() => handleUnfriend(friend._id)}>Unfriend</Button>
                        </li>
                      ))
                    ) : (
                      <li>No friends found.</li>
                    )}
                  </ul>
                </Card>
              </div>
            </Collapse>
          </div>
    </Card.Body>
    </Card>
  )}
  </Container>
  <MyPosts/>
  </>
  
  )
}

export default ProfilePage