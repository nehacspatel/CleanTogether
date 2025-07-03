import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ViewVolunteers.css';

function ViewVolunteers() {
  const { eventId } = useParams();
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${eventId}/volunteers`);
        setVolunteers(response.data || []);
      } catch (err) {
        console.error("Failed to load volunteers", err);
      }
    };
    fetchVolunteers();
  }, [eventId]);

  return (
    <div className="volunteers-page">
      <h2>Volunteers for Event ID: {eventId}</h2>
      {volunteers.length === 0 ? (
        <p>No volunteers registered yet.</p>
      ) : (
        <table className="volunteer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Rewards</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((v, index) => (
              <tr key={index}>
                <td>{v.name}</td>
                <td>{v.email}</td>
                <td>{v.address}</td>
                <td>{v.reward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewVolunteers;
