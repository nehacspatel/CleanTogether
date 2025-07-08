import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../Styles/ManageAttendance.css";

const ManageAttendance = () => {
  const { eventId } = useParams();
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/events/${eventId}/attendance`);
      setVolunteers(res.data);
    } catch (err) {
      console.error("❌ Error fetching volunteers", err);
    }
  };

  const updateAttendance = async (userId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/events/${eventId}/attendance/${userId}`, {
        status,
      });
      fetchVolunteers(); // refresh
    } catch (err) {
      console.error("❌ Error updating attendance", err);
    }
  };

  return (
    <div className="manage-attendance">
      <h2>Manage Attendance for Event #{eventId}</h2>
      <table>
        <thead>
          <tr>
            <th>Volunteer</th>
            <th>Email</th>
            <th>Status</th>
            <th>Mark As</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((vol) => (
            <tr key={vol.user_id}>
              <td>{vol.name}</td>
              <td>{vol.email}</td>
              <td>{vol.status}</td>
              <td>
                <button onClick={() => updateAttendance(vol.user_id, "present")}>Present</button>
                <button onClick={() => updateAttendance(vol.user_id, "absent")}>Absent</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageAttendance;
