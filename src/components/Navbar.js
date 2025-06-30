import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navbarr() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // 🟡 Track login status

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/User/logout", {}, { withCredentials: true });
      localStorage.removeItem("user");
      setUser(null); // 🔴 Update UI after logout
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="/" className="fw-bold">MySocialApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/home" className="mx-2">Home</Nav.Link>
            <Nav.Link href="/userlist" className="mx-2">Search</Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            {user ? (
              // ✅ Show Profile Dropdown if logged in
              <NavDropdown
                align="end"
                title={<i className="bi bi-person-circle" style={{ fontSize: '1.4rem' }} />}
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item href="/profile">My Profile</NavDropdown.Item>
                <NavDropdown.Item href="/changepassword">Change Password</NavDropdown.Item>
                <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>

                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              // ❌ Show Login and Sign Up if logged out
              <>
               
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navbarr;
