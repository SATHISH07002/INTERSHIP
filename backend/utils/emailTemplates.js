export const approvalStatusTemplate = ({
  studentName,
  internshipRole,
  reviewerRole,
  approved,
  reason
}) => {
  const decision = approved ? "approved" : "rejected";
  const reasonBlock = approved || !reason ? "" : `<p><strong>Reason:</strong> ${reason}</p>`;

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2>CertiTrust Status Update</h2>
      <p>Hello ${studentName},</p>
      <p>Your internship submission for <strong>${internshipRole}</strong> was ${decision} by the ${reviewerRole} reviewer.</p>
      ${reasonBlock}
      <p>Please log in to CertiTrust to review the latest status.</p>
    </div>
  `;
};

export const companySubmissionTemplate = ({
  companyName,
  studentName,
  studentCollege,
  internshipRole,
  duration,
  startDate,
  endDate,
  mentorName,
  projectTitle,
  reportUrl
}) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>New Internship Submission Received</h2>
    <p>Hello ${companyName || "Company Team"},</p>
    <p>A student has submitted an internship report for company-side review in CertiTrust.</p>
    <p><strong>Student:</strong> ${studentName}</p>
    <p><strong>College:</strong> ${studentCollege || "N/A"}</p>
    <p><strong>Role:</strong> ${internshipRole}</p>
    <p><strong>Duration:</strong> ${duration || "N/A"}</p>
    <p><strong>Timeline:</strong> ${startDate || "N/A"} to ${endDate || "N/A"}</p>
    <p><strong>Mentor:</strong> ${mentorName || "N/A"}</p>
    <p><strong>Project:</strong> ${projectTitle || "N/A"}</p>
    ${reportUrl ? `<p><a href="${reportUrl}">Open submitted report</a></p>` : ""}
    <p>Please review the submission from your CertiTrust dashboard.</p>
  </div>
`;

export const offerPublishedTemplate = ({
  recipientName,
  companyName,
  title,
  type,
  location,
  stipend,
  description
}) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2>New ${type === "job" ? "Job" : "Internship"} Offer Published</h2>
    <p>Hello ${recipientName || "User"},</p>
    <p><strong>${companyName || "A company"}</strong> has published a new offer in CertiTrust.</p>
    <p><strong>Title:</strong> ${title}</p>
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>Location:</strong> ${location || "Not specified"}</p>
    <p><strong>Stipend / CTC:</strong> ${stipend || "Not specified"}</p>
    <p><strong>Description:</strong> ${description}</p>
    <p>Please log in to CertiTrust to view the offer.</p>
  </div>
`;
