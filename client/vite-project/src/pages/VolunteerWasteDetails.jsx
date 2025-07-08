import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VolunteerWasteDetails = () => {
  const [volunteerSummary, setVolunteerSummary] = useState([]);

  useEffect(() => {
    const fetchVolunteerWasteSummary = async () => {
      try {
        const organizerId = localStorage.getItem("user_id");
        const res = await axios.get("http://localhost:5000/api/waste-logs/summary", {
          params: { organizer_id: organizerId },
        });
        setVolunteerSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch volunteer waste summary", err);
      }
    };

    fetchVolunteerWasteSummary();
  }, []);

  const groupedByEvent = volunteerSummary.reduce((acc, item) => {
    if (!acc[item.event_id]) {
      acc[item.event_id] = { title: item.event_title, volunteers: [] };
    }
    acc[item.event_id].volunteers.push(item);
    return acc;
  }, {});

  return (
    <div className="volunteer-waste-summary">
      <h3>Volunteer Waste Collection Summary (Grouped by Event)</h3>
      {Object.entries(groupedByEvent).map(([eventId, { title, volunteers }]) => (
        <div key={eventId} className="event-summary-card">
          <h4>{title} (Event ID: {eventId})</h4>
          <table className="waste-log-table">
            <thead>
              <tr>
                <th>Volunteer ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Total Waste Collected (kg)</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.user_id}>
                  <td>{v.user_id}</td>
                  <td>{v.name}</td>
                  <td>{v.email}</td>
                  <td>{v.total_waste_kg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default VolunteerWasteDetails;
