import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import CreatePost from './CreatePost';
import PostDetail from './PostDetail';
import ManageCategories from './ManageCategories';
import UserPosts from './UserPosts';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      const userData = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(userData);
    }
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleSignup = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Blog
            </Link>
            <div className="nav-links">
              <Link to="/">Home</Link>
              {user ? (
                <>
                  <Link to="/create-post">Create Post</Link>
                  <Link to="/your-posts">Your Posts</Link>
                  {(user.role === 'admin' || user.role === 'Admin') && (
                    <>
                      <Link to="/manage-categories">Manage Categories</Link>
                    </>
                  )}
                  <span className="user-greeting">Hello, {user.firstName}!</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/signup" 
              element={
                user ? <Navigate to="/" /> : <Signup onSignup={handleSignup} />
              } 
            />
            <Route 
              path="/create-post" 
              element={
                user ? <CreatePost user={user} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/your-posts" 
              element={
                user ? <UserPosts user={user} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/post/:slug" 
              element={<PostDetail user={user} />} 
            />
            <Route 
              path="/manage-categories" 
              element={
                user && (user.role === 'admin' || user.role === 'Admin') ? <ManageCategories user={user} /> : <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
