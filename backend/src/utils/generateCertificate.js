import PDFDocument from "pdfkit";

const generateCertificatePDF = (res, { studentName, eventTitle, eventDate, eventVenue }) => {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificate-${studentName.replace(/\s+/g, "-")}.pdf"`
  );

  doc.pipe(res);

  const W = 841.89;
  const H = 595.28;

  doc.rect(0, 0, W, H).fill("#0f0c29");
  doc.rect(0, 0, W, 8).fill("#6366F1");
  doc.rect(0, H - 8, W, 8).fill("#6366F1");
  doc.rect(0, 0, 8, H).fill("#6366F1");
  doc.rect(W - 8, 0, 8, H).fill("#6366F1");
  doc.rect(24, 24, W - 48, H - 48).lineWidth(1.5).strokeColor("#6366F1").stroke();

  doc.fontSize(13).fillColor("#a5b4fc").font("Helvetica")
    .text("NITTE MEENAKSHI INSTITUTE OF TECHNOLOGY", 0, 60, { align: "center", width: W });

  doc.moveTo(W / 2 - 160, 85).lineTo(W / 2 + 160, 85).lineWidth(0.8).strokeColor("#6366F1").stroke();

  doc.fontSize(42).fillColor("#ffffff").font("Helvetica-Bold")
    .text("Certificate of Participation", 0, 100, { align: "center", width: W });

  doc.fontSize(14).fillColor("#a5b4fc").font("Helvetica")
    .text("This is to certify that", 0, 175, { align: "center", width: W });

  doc.fontSize(34).fillColor("#6366F1").font("Helvetica-Bold")
    .text(studentName, 0, 205, { align: "center", width: W });

  doc.moveTo(W / 2 - 160, 250).lineTo(W / 2 + 160, 250).lineWidth(0.8).strokeColor("#6366F1").stroke();

  doc.fontSize(14).fillColor("#a5b4fc").font("Helvetica")
    .text("has successfully participated in", 0, 265, { align: "center", width: W });

  doc.fontSize(26).fillColor("#ffffff").font("Helvetica-Bold")
    .text(eventTitle, 0, 295, { align: "center", width: W });

  const formattedDate = new Date(eventDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  doc.fontSize(13).fillColor("#a5b4fc").font("Helvetica")
    .text(`${formattedDate}  ·  ${eventVenue}`, 0, 340, { align: "center", width: W });

  doc.moveTo(W / 2 - 160, 370).lineTo(W / 2 + 160, 370).lineWidth(0.8).strokeColor("#6366F1").stroke();

  doc.fontSize(11).fillColor("#64748b").font("Helvetica")
    .text("CampusBuzz — NMIT Event Management Platform", 0, H - 50, { align: "center", width: W });

  doc.end();
};

export { generateCertificatePDF };