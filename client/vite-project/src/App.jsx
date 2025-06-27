import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About.jsx';
import Events from './pages/Events';
import Volunteer from './pages/Volunteer';
import Donate from './pages/Donate';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import VolunteerDashboard from './pages/VolunteerDashboard';
import WasteLogger from './pages/WasteLogger';
import Profile from './pages/Profile';
import { UserContext } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (localUser) {
      setUser(localUser);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="app-container">
          <Navbar />

          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
              <Route path="/waste-logger" element={<WasteLogger />} />
              <Route path="/profile" element={
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          <ToastContainer position="top-center" autoClose={2000} />
          <Footer />
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
