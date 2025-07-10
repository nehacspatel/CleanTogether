// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About.jsx";
import Events from "./pages/Events";
import Volunteer from "./pages/Volunteer";
import Donate from "./pages/Donate";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import WasteLogger from "./pages/WasteLogger";
import Profile from "./pages/Profile";
import ViewVolunteers from "./pages/ViewVolunteers";
import ManageAttendance from "./pages/ManageAttendance";
import ImageApproval from "./pages/ImageApproval";
import VolunteerWasteDetails from "./pages/VolunteerWasteDetails";
import Chatbot from "./components/Chatbot"; // ✅ Chatbot widget
import FeedbackForm from "./pages/FeedbackForm.jsx";
import AdminFeedbackView from "./pages/AdminFeedbackView.jsx";
import UserNotifications from "./pages/UserNotifications.jsx"; // ✅ New
import Leaderboard from "./pages/LeaderBoard.jsx"; // ✅ New leaderboard page
import { UserContext } from "./contexts/UserContext";
import ErrorBoundary from "./components/ErrorBoundary";
import MyCertificates from "./components/MyCertificates.jsx";
import CertificateDownloadButton from "./components/CertificateDownloadButton.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser) {
      setUser(localUser);

      // ✅ Setup socket connection if user exists
      const socket = io("http://localhost:5000");
      socket.emit("register", localUser.user_id || localUser.id);

      socket.on("notification", (data) => {
        toast.info(`${data.title}: ${data.message}`);
      });

      return () => socket.disconnect(); // cleanup on unmount
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
              <Route path="/admin/waste-details" element={<VolunteerWasteDetails />} />
              <Route path="/waste-logger" element={<WasteLogger />} />
              <Route path="/volunteers/:eventId" element={<ViewVolunteers />} />
              <Route path="/admin/image-approval" element={<ImageApproval />} />
              <Route path="/events/:eventId/attendance" element={<ManageAttendance />} />
              <Route path="/feedback/:eventId" element={<FeedbackForm />} />
              <Route path="/admin/feedback/:eventId" element={<AdminFeedbackView />} />
              <Route path="/usernotifications" element={<UserNotifications />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/my-certificates" element={<MyCertificates />} />

              <Route
                path="/profile"
                element={
                  <ErrorBoundary>
                    <Profile />
                  </ErrorBoundary>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          <Chatbot /> {/* ✅ Global floating widget */}

          <ToastContainer position="top-center" autoClose={2000} />
          <Footer />
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;