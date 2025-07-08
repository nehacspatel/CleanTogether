import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../Styles/ImageApproval.css";

const ImageApproval = () => {
  const [logs, setLogs] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [organizerEvents, setOrganizerEvents] = useState([]);

  const organizerId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const fetchOrganizerEvents = async () => {
    try {
      const eventRes = await axios.get("http://localhost:5000/api/events");
      const myEvents = eventRes.data.filter(
        (event) => event.organizer_id === parseInt(organizerId)
      );
      setOrganizerEvents(myEvents);
      fetchLogs(myEvents.map((ev) => ev.event_id));
    } catch (err) {
      console.error("Error fetching events/logs", err);
      toast.error("Failed to load data");
    }
  };

  const fetchLogs = async (myEventIds) => {
    try {
      const logRes = await axios.get("http://localhost:5000/api/waste-logs");
      const filteredLogs = logRes.data.filter((log) =>
        myEventIds.includes(log.event_id)
      );
      setLogs(filteredLogs);
    } catch (err) {
      console.error("Failed to fetch waste logs", err);
      toast.error("Error fetching waste logs");
    }
  };

  const handleAction = async (log_id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/waste-logs/${log_id}/status`, { status });
      toast.success(`Log marked as ${status}`);
      fetchOrganizerEvents(); // Refresh logs after action
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update log status");
    }
  };

  const filteredLogs = logs
    .filter((log) => {
      if (filterStatus === "all") return true;
      return log.status === filterStatus;
    })
    .filter((log) =>
      log.user_id.toString().includes(searchTerm) ||
      log.event_id.toString().includes(searchTerm)
    );

  return (
    <div className="image-approval">
      <h2>Image Approval - My Event Logs</h2>

      <div className="filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Search by Volunteer ID or Event ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredLogs.length === 0 ? (
        <p>No logs match the criteria.</p>
      ) : (
        <table className="approval-table">
          <thead>
            <tr>
              <th>Volunteer ID</th>
              <th>Event ID</th>
              <th>Waste Type</th>
              <th>Quantity</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.log_id}>
                <td>{log.user_id}</td>
                <td>{log.event_id}</td>
                <td>{log.waste_type}</td>
                <td>{log.quantity}</td>
                <td>{new Date(log.logged_at).toLocaleString()}</td>
                <td>{log.status}</td>
                <td>
                  {log.proof_image ? (
                    <img
                      src={`http://localhost:5000/uploads/${log.proof_image}`}
                      alt="proof"
                      width="80"
                      onClick={() =>
                        setModalImage(`http://localhost:5000/uploads/${log.proof_image}`)
                      }
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>
                  {log.status === "pending" && (
                    <>
                      <button onClick={() => handleAction(log.log_id, "approved")}>Approve</button>
                      <button onClick={() => handleAction(log.log_id, "rejected")}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Image Modal */}
      {modalImage && (
        <div className="modal" onClick={() => setModalImage(null)}>
          <div className="modal-content">
            <img src={modalImage} alt="Full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageApproval;
