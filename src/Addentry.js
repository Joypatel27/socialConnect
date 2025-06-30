import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import { Form, Row, Col, Button, Card, Container ,Collapse} from 'react-bootstrap';
import { useNavigate, useParams ,useLocation } from 'react-router-dom';



const URL = 'http://localhost:5000/User';

function UserList() {
  const [data, setData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('');
  const[user,setUser]=useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const{id}=useParams();
  const location=useLocation();
   const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [sentRequests, setSentRequests] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  // const [open, setOpen] = useState(false);
  // const [friends, setFriends] = useState([]);


  // const storeduser = JSON.parse(localStorage.getItem("user"));        // fetechig user login-in data from local storage
  const [storeduser, setStoredUser] = useState(JSON.parse(localStorage.getItem("user")));

  const loggedInUserId = storeduser?._id;                             // extract user id from local storage 


  const navigate = useNavigate();

  const handleCheckboxChange = (id, isChecked) => {
  setSelectedUsers(prev => isChecked ? [...prev, id] : prev.filter(uid => uid !== id));
  };
const updateStatuses = (users) => {
  const newStatuses = {};

  users.forEach(user => {
    // if your backend sends friendStatus per user, use it:
    newStatuses[user._id] = user.friendStatus || 'none';
    
    // if you calculate it in frontend (less preferred), do it here instead
  });

  setStatuses(newStatuses);
};


  const fetchData = async (page = 1, sortOrder = '') => {    
    try {
      const response = await fetch(`${URL}?page=${page}&limit=10&sort=${sortOrder}&userId=${storeduser._id}`);
      console.log(storeduser)
      const jsonData = await response.json();
      // const res = await fetch('http://localhost:5000/User'); 
      const filtered = jsonData.users.filter(user => user._id !== loggedInUserId);  //filter before  for not show user own data
      
      setData(filtered);
      // setData(jsonData.users);
      setFilteredUsers(filtered);
      updateStatuses(filtered); // this sets the `statuses` object based on users

      // setFilteredUsers(jsonData.users);
      setPage(jsonData.currentPage);
      setTotalPages(jsonData.totalPages);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

 useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  setStoredUser(user);
}, []);

useEffect(() => {
  if (!storeduser?._id) return;
  fetchData(page, sort);
  if (location.state?.updated) {
    window.history.replaceState({}, document.title); // Clear state
  }
}, [storeduser, page, sort, location.state]);




  

  
  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      fetchData(page);
      setError('');
      return;
    }

    try {
      const response = await axios.get(`${URL}/search/email?email=${searchEmail}`);
      setFilteredUsers(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setFilteredUsers([]);
        setError('User not found');
      } else {
        setError('Something went wrong');
      }
    }
  };

  const handleSort = (field) => {
    let newSortOrder = 'asc';                                         //first click ascending
    if (sort.startsWith(field) && sort.endsWith('_asc')) {            //after that chechk filed and sort if asc then it will desc
      newSortOrder = 'desc';
    }else if (sort.startsWith(field) && sort.endsWith('_desc')) {                              //Third
     setSort('');                                                                             
    fetchData(1, '');                                                                         
    return;
  }
    
    const newSort = `${field}_${newSortOrder}`;
    setSort(newSort);
    fetchData(1, newSort);
  };
  

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${URL}/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      alert(result.message);
      setData(prev => prev.filter(user => user._id !== id));
      setFilteredUsers(prev => prev.filter(user => user._id !== id));
    } catch (error) {
      alert('Failed to delete user');
    }
  };
  
  
  //multi delete logic
  const handleMultiDelete = async () => {
  try {
    await Promise.all(
      selectedUsers.map(id =>
        fetch(`${URL}/${id}`, { method: 'DELETE' })
      )
    );
    alert('Selected user delete');
    // update state to remove deleted users
    setData(prev => prev.filter(user => !selectedUsers.includes(user._id)));
    fetchData(1);
    setSelectedUsers([]);
  } catch (err) {
    alert('Error');
  }
};

const sendRequest = async (id) => {
  await axios.post(`http://localhost:5000/friends/send/${id}`, {}, { withCredentials: true });
  setStatuses(prev => ({ ...prev, [id]: 'sent' }));
};

const acceptRequest = async (id) => {
  await axios.post(`http://localhost:5000/friends/accept/${id}`, {}, { withCredentials: true });
  setStatuses(prev => ({ ...prev, [id]: 'friends' }));
  alert("Friend Request Accepted");
};

const rejectRequest = async (id) => {
  await axios.post(`http://localhost:5000/friends/reject/${id}`, {}, { withCredentials: true });
  setStatuses(prev => ({ ...prev, [id]: 'none' }));
   alert("Friend Request Rejected");
};


 useEffect(() => {
    axios.get("http://localhost:5000/User")  
      .then(res => {
        const filtered = res.data.users.filter(u => u._id !== storedUser._id);

        setUsers(filtered);
        filtered.forEach(user => {
          axios.get(`http://localhost:5000/friends/status/${user._id}`, { withCredentials: true })
            .then(res => {
              setStatuses(prev => ({ ...prev, [user._id]: res.data.status }));
            });
        });
      });
  }, []);

//  const fetchFriends = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/friends/my-friends", {
//         credentials: 'include', 
//       });
//       const data = await res.json();
//       console.log("Friends response:", data); 
//       setFriends(data);
//     } catch (error) {
//       console.error("Error fetching friends:", error);
//     }
//   };

  // // const toggleFriends = () => {
  //   setOpen(!open);
  //   if (!open) fetchFriends(); 
  // // };
  
//   const handleUnfriend = async (friendId) => {
//   try {
//     const res = await fetch(`http://localhost:5000/friends/unfriend/${friendId}`, {
//       method: 'DELETE',
//       credentials: 'include'
//     });

//     if (res.ok) {
//       alert("Unfriended successfully");
//       fetchFriends(); 
//     } else {
//       const err = await res.json();
//       alert(err.message);
//     }
//   } catch (error) {
//     alert("Error unfriending user");
//     console.error(error);
//   }
// };

  return (
    <Container className="mt-5">
      <Card className="mb-4">
        <h2 className="card-header">Total Entries</h2>
        <div className="card-body">
          <h5 className="card-subtitle mb-2 text-muted"><FaSearch /> Search User By Email</h5>
          <Row className="align-items-center">
            <Col md={4} >
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <div className="d-flex gap-3">
                <Button variant="info" onClick={handleSearch}><FaSearch /> Search</Button>
                <Button variant="warning" onClick={() => navigate('/form')}>Add Entries</Button>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
      <div className="container mt-4">
    <div className="d-flex align-items-center mb-3 gap-2">
    <Button variant="danger" onClick={handleMultiDelete} disabled={selectedUsers.length === 0 || user._id !== loggedInUserId} >
      Delete Selected
    </Button>
    
    </div>
    </div>
    
    {/* {storeduser && (
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
     )} */}

      <table className="table table-bordered table-striped text-center">  
        <thead>
          <tr>
            <th>Select</th>
            <th onClick={() => handleSort('firstname')} style={{ cursor: 'pointer' }}>FirstName</th>
            <th onClick={() => handleSort('lastname')} style={{ cursor: 'pointer' }}>LastName</th>
            <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
            <th>Phone Number</th>
            <th>Password</th>
            <th>Update</th>
            <th>Delete</th>
            <th>Image</th>
            <th>Add Friend</th>
          </tr>
        </thead>
       
        <tbody>
  {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
    filteredUsers
    .filter(user=> user._id !== loggedInUserId)
    .map(user =>  (
      <tr key={user._id}>
        <td>
          <input
            type='checkbox'
            disabled={user._id !== loggedInUserId}
            checked={selectedUsers.includes(user._id)}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              handleCheckboxChange(user._id, e.target.checked);
            }}
          />
        </td>
        <td onClick={() => navigate(`/Viewdetail/${user._id}`)} style={{ cursor: 'pointer' }}>
          {user.firstname}
        </td>
        <td>{user.lastname}</td>
        <td>{user.email}</td>
        <td>{user.number}</td>
        <td>{user.password}</td>
        <td>
          <Button
            variant="success"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/form/${user._id}`);
            }}
            disabled={user._id !== loggedInUserId}
          >
            Update
          </Button>
        </td>
        <td>
          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user._id);
            }}
            disabled={user._id !== loggedInUserId}
          >
            Delete
          </Button>
        </td>
        <td>
          {user.image ? <img src={user.image} alt="User" width="50" /> : 'No Image'}
        </td>
        <td>
          {statuses[user._id] === 'none' && (
        <button onClick={() => sendRequest(user._id)}>Add Friend</button>
      )}
      {statuses[user._id] === 'sent' && (
        <span>Request Sent</span>
      )}
      {statuses[user._id] === 'received' && (
        <>
          <button onClick={() => acceptRequest(user._id)}>Accept</button>
          <button onClick={() => rejectRequest(user._id)}>Reject</button>
        </>
      )}
      {statuses[user._id] === 'friends' && (
        <span>Friends</span>
      )}
        </td>
      </tr>
    ))
  ) : (
    <tr><td colSpan={10}>No users found</td></tr>
  )}
</tbody>

      </table>
      
{/* //pagination  */}
      <div className="d-flex justify-content-between align-items-center">
        <Button disabled={page <= 1} onClick={() => fetchData(page - 1, sort)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button disabled={page >= totalPages} onClick={() => fetchData(page + 1, sort)}>Next</Button>
      </div>
    </Container>
  );
}

export default UserList;