import React from "react";

const CertificateDownloadButton = ({ certificate_id }) => {
  const handleDownload = () => {
    window.open(`http://localhost:5000/api/certificates/download/${certificate_id}`, "_blank");
  };

  return (
    <button onClick={handleDownload} className="download-btn">
      🎓 Download Certificate
    </button>
  );
};

export default CertificateDownloadButton;
