import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormPage from './form';
import UserList from './Addentry.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewDetail from './ViewDetail.js';
import Login from './login.js';
import Register from './Regisform.js';
import PostForm from './Postform.js';
import AllPosts from './AllPosts.js';
import MyPosts from './MyPosts.js';
import 'bootstrap-icons/font/bootstrap-icons.css';



// import MyPosts from './MyPosts.js';
import Navbarr from './components/Navbar.js';
import ProfilePage from './pages/ProfilePage.js';
import HomePage from './pages/HomePage.js';
import Password from './Password.js';
import Forgot from './Forget.js';
import ResetPasswordPage from './pages/resetpass.js';
// GIT ADD . 
//GIT TEST

function App() {
  return (
    <>

    <Router>
      <Navbarr/>
      <Routes>    
        <Route path="/" element={<Login />} />
        <Route path="/regisform" element={<Register />} />
        {/* <Route path="/homepage" element={<Register />} /> */}
        <Route path="/form" element={<FormPage />} />
        <Route path="/form/:id" element={<FormPage />} />
        <Route path="/Viewdetail/:id" element={<ViewDetail />} />

        <Route path="/userlist" element={<UserList/>} />
        <Route path="/postform" element={<PostForm />} />
        <Route path="/posts" element={<AllPosts />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element={<HomePage />} />
        {/* <Route path="/Editprofile/:id" element={<EditProfile/>} /> */}


         <Route path="/changepassword" element={<Password />} />
         <Route path="/forgetpass" element={<Forgot />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>

    </Router>
    </>
  )
}


export default App;

