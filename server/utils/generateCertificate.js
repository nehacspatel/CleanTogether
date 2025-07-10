const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateCertificate = ({ userName, eventName, certificateId }) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("📄 Starting certificate generation for:", userName, eventName, certificateId);

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 50, bottom: 50, left: 72, right: 72 },
      });

      const certDir = path.resolve(__dirname, "../uploads"); // Use absolute path
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true }); // Ensure nested folders are also created
        console.log("📁 Created uploads directory at:", certDir);
      }

      const fileName = `certificate_${certificateId}.pdf`;
      const filePath = path.join(certDir, fileName);
      const stream = fs.createWriteStream(filePath);

      // Log path being written to
      console.log("📝 Writing to:", filePath);

      doc.pipe(stream);

      // PDF Content
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f2f2f2");
      doc.lineWidth(4).strokeColor("#333").rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke();

      doc
        .fillColor("#2c3e50")
        .fontSize(32)
        .font("Helvetica-Bold")
        .text("Certificate of Participation", {
          align: "center",
          valign: "top",
          lineGap: 10,
        });

      doc
        .fontSize(18)
        .font("Helvetica")
        .text("This is awarded to", {
          align: "center",
          lineGap: 20,
        });

      doc
        .fontSize(28)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text(userName, {
          align: "center",
        });

      doc
        .moveDown()
        .fontSize(18)
        .font("Helvetica")
        .text(`For their participation in "${eventName}"`, {
          align: "center",
          lineGap: 10,
        });

      const issuedDate = new Date().toLocaleDateString();
      doc
        .moveDown(2)
        .fontSize(14)
        .text(`Issued on: ${issuedDate}`, {
          align: "center",
        });

      doc
        .moveDown(4)
        .fontSize(16)
        .text("CleanTogether Initiative", {
          align: "center",
        });

      doc.end();

      stream.on("finish", () => {
        console.log("✅ PDF successfully generated:", fileName);
        resolve(fileName);
      });

      stream.on("error", (err) => {
        console.error("❌ PDF stream error:", err);
        reject(err);
      });
    } catch (err) {
      console.error("❌ Certificate generation failed:", err);
      reject(err);
    }
  });
};

module.exports = generateCertificate;