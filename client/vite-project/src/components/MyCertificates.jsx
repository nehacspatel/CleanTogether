import React, { useEffect, useState } from "react";
import axios from "axios";

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/certificates/user/${userId}`);
        setCertificates(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch certificates", err);
      }
    };

    fetchCertificates();
  }, [userId]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">🎓 My Certificates</h2>
      {certificates.length === 0 ? (
        <p>No certificates found.</p>
      ) : (
        <ul className="space-y-4">
          {certificates.map((cert) => (
            <li key={cert.certificate_id} className="border rounded p-4">
              <p>
                <strong>Event:</strong> {cert.event_name}
              </p>
              <p>
                <strong>Issued:</strong>{" "}
                {new Date(cert.issued_at).toLocaleDateString()}
              </p>
              <a
                href={`http://localhost:5000/uploads/${cert.certificate_url}`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="text-blue-600 underline mt-2 inline-block"
              >
                📄 Download Certificate
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyCertificates;
