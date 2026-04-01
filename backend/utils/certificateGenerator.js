import PDFDocument from "pdfkit";

const drawWatermark = (doc, text) => {
  doc.save();
  doc.rotate(-25, { origin: [300, 300] });
  doc.fontSize(72).fillColor("#d1fae5").opacity(0.4).text(text, 80, 260, {
    align: "center",
    width: 450
  });
  doc.restore();
  doc.opacity(1);
};

const textOrFallback = (value, fallback = "N/A") => value || fallback;

const generateCertificatePdf = async ({ internship, verificationUrl, qrCodeDataUrl }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(20, 20, 555, 802).lineWidth(2).stroke("#0f172a");
    drawWatermark(doc, "VERIFIED");

    const pageWidth = doc.page.width;
    const contentLeft = 68;
    const contentRight = pageWidth - 68;
    const contentWidth = contentRight - contentLeft;
    const qrSize = 132;
    const qrX = (pageWidth - qrSize) / 2;

    doc.fillColor("#0f172a").fontSize(28).text("CertiTrust Internship Certificate", contentLeft, 150, {
      align: "center",
      width: contentWidth
    });
    doc.fontSize(14).fillColor("#475569").text("Automated Digital Verification Certificate", contentLeft, 205, {
      align: "center",
      width: contentWidth
    });

    if (internship.company?.logo?.url) {
      try {
        doc.image(internship.company.logo.url, 430, 48, { fit: [90, 90], align: "center" });
      } catch (_error) {
      }
    }

    doc.fillColor("#0f172a").fontSize(18).text(`Awarded to ${internship.student.fullName}`, contentLeft, 285, {
      align: "center",
      width: contentWidth
    });
    doc.fontSize(12).fillColor("#334155").text(
      `${internship.student.degree || ""} ${internship.student.branch || ""}`.trim() || "Student",
      contentLeft,
      330,
      {
        align: "center",
        width: contentWidth
      }
    );
    doc.fontSize(13).fillColor("#0f172a").text(
      `This certifies that ${internship.student.fullName} successfully completed the role of ${internship.role} at ${textOrFallback(internship.company?.name, "the company")} for ${textOrFallback(internship.duration)} days.`,
      contentLeft,
      380,
      {
        align: "center",
        width: contentWidth
      }
    );

    doc.fontSize(11).fillColor("#475569");
    doc.text(`Roll No: ${textOrFallback(internship.student.rollNo)}`, 82, 470, { width: 210 });
    doc.text(`Department: ${textOrFallback(internship.student.department)}`, 82, 492, { width: 210 });
    doc.text(
      `College: ${textOrFallback(internship.student.collegeName || internship.college?.fullName)}`,
      82,
      514,
      { width: 210 }
    );
    doc.text(`Certificate ID: ${internship.certificate.certificateId}`, 82, 536, { width: 210 });
    doc.text(
      `Issued On: ${new Date(internship.certificate.generatedAt).toLocaleDateString("en-IN")}`,
      82,
      558,
      { width: 210 }
    );

    doc.image(Buffer.from(qrCodeDataUrl.split(",")[1], "base64"), qrX, 470, { fit: [qrSize, qrSize] });

    doc.fillColor("#0f172a").fontSize(10).text(
      "Scan the QR code or visit the verification URL below:",
      contentLeft,
      620,
      {
        align: "center",
        width: contentWidth
      }
    );
    doc.fillColor("#334155").text(verificationUrl, contentLeft, 640, {
      align: "center",
      width: contentWidth,
      link: verificationUrl,
      underline: true
    });

    doc.fillColor("#0f172a").fontSize(12).text("Approved by College and Company", contentLeft, 720, {
      align: "center",
      width: contentWidth
    });
    doc.end();
  });

export default generateCertificatePdf;
