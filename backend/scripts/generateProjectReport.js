import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const outputPath = path.resolve(process.cwd(), "..", "CertiTrust_Project_Report.pdf");

const doc = new PDFDocument({
  size: "A4",
  margin: 50,
  info: {
    Title: "CertiTrust Project Report",
    Author: "OpenAI Codex",
    Subject: "Internship Management and Automated Certification System",
    Keywords: "MERN, internship, certificate, verification, project report"
  }
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const pageWidth = doc.page.width;
const left = doc.page.margins.left;
const right = doc.page.width - doc.page.margins.right;
const contentWidth = right - left;

const addFooter = () => {
  const pageNumber = doc.bufferedPageRange().count;
  doc.font("Helvetica").fontSize(9).fillColor("#64748b");
  doc.text(`CertiTrust Project Report | Page ${pageNumber}`, left, doc.page.height - 35, {
    width: contentWidth,
    align: "center"
  });
  doc.fillColor("black");
};

const ensureSpace = (height = 80) => {
  if (doc.y + height > doc.page.height - 60) {
    addFooter();
    doc.addPage();
  }
};

const title = (text) => {
  ensureSpace(60);
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(18).fillColor("#0f172a").text(text, { align: "left" });
  doc.moveDown(0.2);
  doc.strokeColor("#10b981").lineWidth(2).moveTo(left, doc.y).lineTo(left + 130, doc.y).stroke();
  doc.moveDown(0.7);
  doc.fillColor("black");
};

const paragraph = (text) => {
  ensureSpace(70);
  doc.font("Helvetica").fontSize(11).fillColor("#111827").text(text, {
    width: contentWidth,
    align: "justify",
    lineGap: 3
  });
  doc.moveDown(0.8);
};

const bulletList = (items) => {
  items.forEach((item) => {
    ensureSpace(28);
    const startY = doc.y;
    doc.font("Helvetica-Bold").fontSize(11).text("•", left, startY);
    doc.font("Helvetica").fontSize(11).text(item, left + 14, startY, {
      width: contentWidth - 14,
      align: "justify",
      lineGap: 3
    });
    doc.moveDown(0.45);
  });
  doc.moveDown(0.3);
};

const numberedList = (items) => {
  items.forEach((item, index) => {
    ensureSpace(28);
    const startY = doc.y;
    doc.font("Helvetica-Bold").fontSize(11).text(`${index + 1}.`, left, startY);
    doc.font("Helvetica").fontSize(11).text(item, left + 18, startY, {
      width: contentWidth - 18,
      align: "justify",
      lineGap: 3
    });
    doc.moveDown(0.45);
  });
  doc.moveDown(0.3);
};

const keyValue = (key, value) => {
  ensureSpace(26);
  doc.font("Helvetica-Bold").fontSize(11).text(`${key}:`, {
    continued: true
  });
  doc.font("Helvetica").text(` ${value}`);
  doc.moveDown(0.35);
};

doc.rect(0, 0, pageWidth, doc.page.height).fill("#f8fafc");
doc.fillColor("#0f172a");
doc.roundedRect(45, 45, pageWidth - 90, doc.page.height - 90, 18).fill("#ffffff");
doc.fillColor("#10b981").rect(65, 65, pageWidth - 130, 8).fill();
doc.fillColor("#0f172a");
doc.y = 120;
doc.font("Helvetica-Bold").fontSize(28).text("PROJECT REPORT", { align: "center" });
doc.moveDown(0.4);
doc.font("Helvetica-Bold").fontSize(24).fillColor("#111827").text("CertiTrust", { align: "center" });
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(15).fillColor("#334155").text(
  "Internship Management and Automated Certification System",
  { align: "center" }
);
doc.moveDown(1.2);
doc.font("Helvetica").fontSize(12).fillColor("#111827").text(
  "A web-based MERN application for student internship submission, multi-stage verification, automated certificate generation, public certificate validation, and company offer management.",
  {
    align: "center",
    width: 420,
    indent: 0
  }
);
doc.moveDown(2.2);
doc.font("Helvetica-Bold").fontSize(13).text("Submitted To", { align: "center" });
doc.font("Helvetica").fontSize(12).text("The Department", { align: "center" });
doc.moveDown(1.2);
doc.font("Helvetica-Bold").fontSize(13).text("Prepared By", { align: "center" });
doc.font("Helvetica").fontSize(12).text("Sathish", { align: "center" });
doc.moveDown(1.2);
doc.font("Helvetica-Bold").fontSize(13).text("Academic Use", { align: "center" });
doc.font("Helvetica").fontSize(12).text("Project documentation generated from the implemented source code", {
  align: "center"
});
doc.moveDown(4);
doc.font("Helvetica").fontSize(11).fillColor("#475569").text(`Date: 04 April 2026`, { align: "center" });
addFooter();

doc.addPage();

title("Abstract");
paragraph(
  "CertiTrust is a full-stack internship management and automated certification platform designed to digitize the student internship lifecycle from submission to final certificate verification. The system solves the manual problems commonly seen in internship administration, such as repeated paper-based approvals, lack of structured status tracking, certificate forgery risk, scattered communication between stakeholders, and poor visibility into industry opportunities. The application centralizes these activities in a single platform where students can maintain profiles, submit internship reports, track review status, maintain work logs, and apply for company offers."
);
paragraph(
  "The solution implements role-based access for students, college reviewers, company reviewers, mentors, and administrators. Internship records are verified through multiple checkpoints, including mentor OTP confirmation, company approval token validation, college and company review decisions, and final administrative review. Once the approval workflow is successfully completed, the system generates a PDF certificate with a unique certificate ID, a public verification ID, and a QR code linked to an online validation page. The project is developed using React for the frontend, Node.js with Express for the backend, MongoDB with Mongoose for the database layer, and Cloudinary for file storage. This design provides a practical, scalable, and secure digital workflow for internship management and certificate authenticity validation."
);

title("1. Introduction");
paragraph(
  "Internships are a critical component of professional education because they connect classroom learning with real industrial exposure. In many institutions, however, the process of approving internships, collecting supporting documents, communicating with companies, and issuing completion certificates is still handled manually or through disconnected tools. Such methods create delays, reduce transparency, make progress difficult to track, and increase the possibility of forged or unverifiable certificates. A digital system is therefore required to standardize the process, preserve records, and build trust among students, institutions, and companies."
);
paragraph(
  "CertiTrust was developed as a practical answer to this need. The project provides an integrated academic-industry workflow where students submit internship information, approvers review it within role-specific dashboards, companies publish opportunities, and certificates are automatically generated only after the necessary checks are completed. In addition to simplifying administration, the system emphasizes authenticity by creating publicly verifiable certificates with QR support and persistent verification identifiers."
);

title("2. Problem Statement");
paragraph(
  "The conventional internship approval process in many departments suffers from several issues: fragmented communication between students and approvers, unstructured document submission, repeated manual follow-ups, slow certificate issuance, and an absence of transparent verification for external stakeholders. Once certificates are issued manually, their authenticity can be difficult to establish. A secure and trackable digital platform is needed to reduce administrative effort, improve trust, and provide a standardized workflow from internship submission to certificate validation."
);

title("3. Objectives");
numberedList([
  "To build a centralized platform for student internship submission, review, approval, and certificate issuance.",
  "To implement secure role-based authentication for students, colleges, companies, mentors, and administrators.",
  "To reduce fraud by introducing duplicate submission detection, company email domain checks, mentor OTP verification, and public certificate validation.",
  "To automatically generate PDF internship certificates with a unique certificate ID, QR code, and verification URL.",
  "To provide students and companies with a digital offer and application management module in the same platform.",
  "To store internship reports, certificates, and supporting files in a structured online repository using Cloudinary-backed uploads."
]);

title("4. Scope of the Project");
bulletList([
  "Student registration, login, profile creation, and academic detail management.",
  "Submission of internship reports with company selection, mentor details, duration, project information, and uploaded report files.",
  "College-side and company-side approval queues with approval and rejection actions.",
  "Mentor and company verification flows using OTP and approval tokens respectively.",
  "Administrative review for flagged or pending cases before final completion.",
  "Automatic certificate generation and public verification through QR-enabled links.",
  "Publication of internship and job offers by companies and direct application by students.",
  "Work log maintenance and document upload to support internship activity tracking."
]);

title("5. Existing System and Its Limitations");
bulletList([
  "Manual documentation often causes record loss, duplication, and inconsistent data formats.",
  "Approvals are commonly dependent on physical signatures or isolated email chains, which slows down the process.",
  "Students usually have limited visibility into the real-time status of their submissions.",
  "Companies and colleges do not always share a unified verification workflow, creating ambiguity in approval responsibility.",
  "Manual certificate preparation is time-consuming and increases the risk of formatting errors and unauthorized duplication.",
  "There is often no public verification mechanism to prove that an internship certificate is genuine."
]);

title("6. Proposed System");
paragraph(
  "The proposed system is a modular web application that integrates user management, internship submission, verification, certificate generation, public validation, and offer management into a single workflow. Students create accounts, complete their profile, choose a company, and submit internship details along with report files. The platform then routes the record through structured verification stages. The system stores approvals, rejection reasons, timestamps, verification states, and fraud indicators inside persistent database records."
);
paragraph(
  "When both verification and approval conditions are met, the application generates a PDF certificate using PDFKit, assigns a certificate ID and verification ID, creates a QR code, uploads the certificate to cloud storage, and exposes a public verification page. This improves reliability, traceability, and transparency for internal academic management as well as external validation."
);

title("7. System Architecture");
keyValue("Architecture Style", "Three-tier MERN-style web architecture");
keyValue("Presentation Layer", "React 18, Vite, React Router DOM, Tailwind CSS");
keyValue("Application Layer", "Node.js, Express.js, JWT authentication, Multer middleware");
keyValue("Data Layer", "MongoDB with Mongoose schemas and document relations");
keyValue("Storage Layer", "Cloudinary for reports, images, and generated certificates");
keyValue("Supporting Services", "PDFKit for certificate generation, QRCode for QR images, Nodemailer-compatible email delivery");
paragraph(
  "The frontend interacts with backend REST APIs using Axios. The backend validates requests, applies role-based authorization, stores and retrieves data from MongoDB, uploads or fetches files from Cloudinary, and generates certificates dynamically when approval conditions are satisfied. The public verification page is separated from authenticated dashboards, allowing certificate validation without requiring login."
);

title("8. Technology Stack");
bulletList([
  "Frontend: React 18.3.1, React DOM 18.3.1, React Router DOM 6.28.0, Axios 1.7.7, Vite 5.x, Tailwind CSS 3.x.",
  "Backend: Node.js, Express 4.21.0, Mongoose 8.8.0, bcryptjs 2.4.3, jsonwebtoken 9.0.2, multer 1.4.5.",
  "Utilities: pdfkit 0.16.0 for certificate PDF generation, qrcode 1.5.4 for QR generation, nodemailer 6.9.15 for notifications.",
  "Database: MongoDB Atlas or MongoDB-compatible instance.",
  "Deployment Targets: Vercel-compatible frontend build, Express backend adapted for serverless deployment."
]);

title("9. Major Functional Modules");
paragraph("The implemented modules in the project are listed below.");
bulletList([
  "Authentication and Profile Module: Supports registration, login, JWT-based session handling, and role-specific profile updates for students, college users, companies, mentors, and administrators.",
  "Internship Submission Module: Allows students to submit internship details including role, duration, stipend, dates, mentor information, project details, and uploaded reports. Drafts and resubmission flows are supported.",
  "Approval Management Module: College and company reviewers view pending submissions and can approve or reject records with reasons. The system updates workflow state automatically.",
  "Verification Module: Mentor OTP verification and company approval token validation are used to strengthen trust and reduce false submissions.",
  "Certificate Generation Module: Generates a branded PDF certificate with student details, role, duration, certificate ID, issue date, QR code, and verification URL.",
  "Public Verification Module: External users can open a public route to verify certificate authenticity and inspect the approval trail.",
  "Offer Management Module: Companies can publish internship or job opportunities, students can apply within date windows, and companies can review applicants.",
  "Document and Work Log Module: Additional documents and daily or periodic work logs can be uploaded, tracked, and reviewed."
]);

title("10. User Roles and Responsibilities");
bulletList([
  "Student: registers, updates profile, submits internship reports, uploads files, maintains work logs, triggers mentor and company verification, views generated certificates, and applies to offers.",
  "College Reviewer: views submissions associated with the same college, approves or rejects records, and participates in the dual approval workflow.",
  "Company Reviewer: reviews internships linked to the company, validates or rejects submissions, posts offers, and reviews applicants.",
  "Mentor: participates in internship validation through the mentor verification workflow.",
  "Administrator: reviews admin-pending or flagged cases, manages company domain validation, and authorizes the final stage of selected workflows."
]);

title("11. Database Design");
paragraph(
  "The database layer is implemented using Mongoose schemas. Each schema represents a major business entity and stores both operational data and audit information. The main collections are described below."
);
bulletList([
  "User Collection: stores identity fields, email, hashed password, role, academic details, college details, contact data, portfolio links, and profile image information.",
  "Company Collection: stores company owner reference, name, logo, website, description, contact email, official email domains, and verification email.",
  "Internship Collection: stores student, college, company, internship metadata, report file details, workflow status, mentor verification, company verification, fraud flags, approval records, and certificate details.",
  "JobOffer Collection: stores company offers, offer type, location, stipend or CTC, application date range, description, close state, and applicant list.",
  "Document Collection: stores uploaded internship-related files with type, file metadata, uploader reference, and scan status.",
  "WorkLog Collection: stores date-wise work entries, hours worked, tasks completed, proof URL, and review remarks."
]);
paragraph(
  "This schema design supports both transactional operations and long-term traceability. References between users, companies, internships, offers, and documents preserve relational meaning while keeping the flexibility of MongoDB documents."
);

title("12. Workflow of the System");
numberedList([
  "A user creates an account and logs in using role-based authentication.",
  "A student completes profile details such as roll number, degree, branch, department, and college name.",
  "The student submits an internship entry with company, mentor, project, timeline, and report details. A draft can also be saved.",
  "The system checks for duplicate internship submissions and mismatched company email domains. Fraud flags are stored where applicable.",
  "Mentor verification may be initiated using an OTP. Company verification may be initiated using a generated approval token.",
  "College and company reviewers process the submission through their pending approval dashboards.",
  "If any reviewer rejects the record, the submission moves to resubmission mode and the student can edit and resend it.",
  "When approval conditions are met, the system generates a certificate ID, verification ID, QR code, and PDF certificate.",
  "The generated certificate is uploaded to cloud storage and becomes accessible from the student dashboard.",
  "An external user can open the public verification page and validate the certificate using the verification ID or QR-linked URL."
]);

title("13. Security and Validation Features");
bulletList([
  "Passwords are hashed using bcrypt before storage.",
  "JWT tokens are used for protected API access.",
  "Role-based middleware ensures that only authorized users can access restricted routes.",
  "Duplicate internship submissions are detected based on student, company, role, and date range.",
  "Company email domain validation flags suspicious verification email usage.",
  "Mentor OTP and company approval token workflows provide additional authenticity checks.",
  "Public certificate verification prevents blind trust in downloadable PDF files alone.",
  "Rejection reasons and action timestamps improve accountability and auditability."
]);

title("14. API Structure");
bulletList([
  "/api/auth: registration, login, profile retrieval, and profile update.",
  "/api/companies: company list retrieval.",
  "/api/internships: internship submission, resubmission, listing, status update, work logs, and document upload.",
  "/api/certificates/verify/:id: certificate verification by verification ID.",
  "/api/offers: offer creation, listing, closure, and student application.",
  "/api/verification: mentor OTP generation and validation, company link validation, public verification data, and verification inbox.",
  "/api/admin: admin internship review, user listing, and company domain update."
]);

title("15. Frontend Design Summary");
paragraph(
  "The frontend is built as a single-page application using React and React Router. It provides separate views for login, registration, dashboard, internship management, profile editing, verification inbox, offer management, administrator review, and public certificate verification. Axios is configured for API interaction and local session persistence is maintained through a centralized authentication context. Tailwind CSS is used for a modern and responsive interface."
);

title("16. Output and Result");
paragraph(
  "The implemented project successfully demonstrates a complete digital internship lifecycle. Students can submit reports, approvers can process them through defined states, companies can publish opportunities, and the system can generate verifiable certificates in PDF format. Public verification adds trust for external viewers, while the internal dashboards increase visibility into operational status. The result is a practical academic-industry workflow automation platform."
);

title("17. Testing Approach");
bulletList([
  "Form-level validation for required internship and registration fields.",
  "Role-based route testing for student, company, college, mentor, and admin access.",
  "Workflow testing for draft save, submission, approval, rejection, and resubmission.",
  "Certificate verification testing through verification ID and QR-linked public page.",
  "Offer publication and application window behavior testing.",
  "File upload testing for reports, documents, and certificate PDFs."
]);

title("18. Advantages of the Proposed System");
bulletList([
  "Reduces manual paperwork and repeated follow-up communication.",
  "Improves status transparency for students and approvers.",
  "Introduces structured verification and anti-fraud checks.",
  "Automates certificate generation and public validation.",
  "Combines internship workflow and company opportunity management in one platform.",
  "Provides a scalable digital foundation for academic administration."
]);

title("19. Limitations");
bulletList([
  "Email delivery behavior depends on correct SMTP or mail account configuration in deployment.",
  "Production performance and scalability depend on deployment configuration and cloud resource availability.",
  "Some verification flows currently rely on token or OTP handling rather than fully integrated third-party identity confirmation.",
  "The system can be extended with richer analytics, notifications, and institutional reporting dashboards."
]);

title("20. Future Enhancements");
bulletList([
  "Add analytics dashboards for departments, companies, and placement cells.",
  "Introduce downloadable reports and semester-wise filtering for academic audit purposes.",
  "Integrate stronger file scanning and anomaly detection for uploaded documents.",
  "Support multiple departments and colleges through a configurable multi-tenant model.",
  "Enable real email-based OTP and approval delivery with delivery status tracking.",
  "Add mobile-responsive enhancements and push notifications for workflow updates."
]);

title("21. Conclusion");
paragraph(
  "CertiTrust is a meaningful academic project that demonstrates how full-stack web development can be applied to solve a genuine institutional workflow problem. The system combines authentication, role-based access control, internship data management, approval workflows, fraud checks, certificate generation, cloud file storage, and public verification within one coherent solution. From an educational perspective, the project reflects practical use of modern web technologies and addresses real administrative pain points in internship handling. With further deployment hardening and institutional customization, it can evolve into a production-grade digital internship management platform."
);

title("22. References");
bulletList([
  "React Documentation - https://react.dev/",
  "Vite Documentation - https://vite.dev/",
  "Express.js Documentation - https://expressjs.com/",
  "MongoDB Documentation - https://www.mongodb.com/docs/",
  "Mongoose Documentation - https://mongoosejs.com/docs/",
  "PDFKit Documentation - https://pdfkit.org/",
  "Cloudinary Documentation - https://cloudinary.com/documentation",
  "Project source code in the current repository."
]);

addFooter();
doc.end();

stream.on("finish", () => {
  console.log(`Project report PDF generated at: ${outputPath}`);
});
