import { useEffect, useState } from "react";
import api from "../lib/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const buildDocumentLinkProps = (url, filename = "document.pdf") => {
  if (!url) {
    return {};
  }

  if (url.startsWith("data:")) {
    return {
      href: url,
      download: filename
    };
  }

  return {
    href: url,
    target: "_blank",
    rel: "noreferrer"
  };
};

const getReportLinkProps = (item) =>
  buildDocumentLinkProps(item?.rawReport?.url, `${(item?.role || "internship-record").replace(/\s+/g, "-").toLowerCase()}-report.pdf`);

const getRoleVisibleStatus = (item, role) => {
  if (role === "company") {
    if (item.companyApproval?.approved === true) return "approved";
    if (item.companyApproval?.approved === false) return "rejected";
  }

  if (role === "college") {
    if (item.collegeApproval?.approved === true) return "approved";
    if (item.collegeApproval?.approved === false) return "rejected";
  }

  return item.status;
};

const isStudentEditable = (item) => item?.status !== "approved";
const getCompanyDisplayName = (item) =>
  item.company?.name || item.companyUser?.fullName || item.companyEmail || "Company pending";

const blankStatusForm = { approved: true, reason: "" };
const weeklyHourOptions = ["10", "20", "30", "40", "45", "50"];
const roleOptions = [
  "Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer",
  "UI/UX Designer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Intern",
  "Testing / QA",
  "Cyber Security Intern"
];
const durationOptions = ["30", "45", "60", "90", "120", "180"];
const stipendOptions = ["Unpaid", "5000", "10000", "15000", "20000", "25000", "50000", "100000"];
const projectDomainOptions = [
  "Web Development",
  "Mobile App Development",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Cyber Security",
  "Cloud Computing",
  "Embedded Systems",
  "UI/UX Design",
  "Testing / QA"
];
const blankSubmission = {
  draftId: "",
  companyId: "",
  role: "",
  duration: "",
  stipend: "",
  internshipMode: "",
  startDate: "",
  endDate: "",
  weeklyHours: "",
  workLocation: "",
  companyEmail: "",
  mentorName: "",
  mentorEmail: "",
  mentorPhone: "",
  projectTitle: "",
  projectDomain: "",
  responsibilities: "",
  learningGoals: "",
  techStack: "",
  report: null
};

const mapInternshipToSubmission = (internship) => ({
  draftId: internship?.status === "draft" ? internship._id || "" : "",
  companyId: internship?.company?._id || internship?.companyId || "",
  role: internship?.role || "",
  duration: internship?.duration || "",
  stipend: internship?.stipend || "",
  internshipMode: internship?.internshipMode || "",
  startDate: internship?.startDate || "",
  endDate: internship?.endDate || "",
  weeklyHours: internship?.weeklyHours || "",
  workLocation: internship?.workLocation || "",
  companyEmail: internship?.companyEmail || "",
  mentorName: internship?.mentorName || "",
  mentorEmail: internship?.mentorEmail || "",
  mentorPhone: internship?.mentorPhone || "",
  projectTitle: internship?.projectTitle || "",
  projectDomain: internship?.projectDomain || "",
  responsibilities: internship?.responsibilities || "",
  learningGoals: internship?.learningGoals || "",
  techStack: internship?.techStack || "",
  report: null
});

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateEndDate = (startDate, duration) => {
  const totalDays = Number(duration);

  if (!startDate || !Number.isFinite(totalDays) || totalDays <= 0) {
    return "";
  }

  const end = new Date(`${startDate}T00:00:00`);
  end.setDate(end.getDate() + totalDays - 1);
  return formatDateInput(end);
};

const formatValue = (value, fallback = "Not provided") => value || fallback;

const InternshipPage = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [studentRecords, setStudentRecords] = useState([]);
  const [currentInternship, setCurrentInternship] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalForm, setApprovalForm] = useState(blankStatusForm);
  const [submission, setSubmission] = useState(blankSubmission);
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");

  const loadData = async () => {
    const requests = [
      api.get("/internships"),
      api.get("/companies")
    ];

    if (user?.role !== "student") {
      requests.push(api.get("/internships/pending"));
    }

    const [internshipResponse, companyResponse, pendingResponse] = await Promise.all(requests);
    const records = internshipResponse.data.data;

    if (user?.role === "student") {
      setStudentRecords(records);
      const latestDraft = records.find((item) => item.status === "draft");
      const latestEditable = records.find((item) => isStudentEditable(item) && item.status !== "draft");
      const latestRecord = latestDraft || latestEditable || null;

      setCurrentInternship(latestRecord);

      if (latestRecord) {
        setSubmission(mapInternshipToSubmission(latestRecord));
      } else {
        setSubmission(blankSubmission);
      }
    } else {
      setPendingApprovals(pendingResponse?.data?.data || []);
    }

    setCompanies(companyResponse.data.data);
  };

  useEffect(() => {
    loadData();
  }, [user?.role]);

  useEffect(() => {
    setSubmission((current) => {
      const nextEndDate = calculateEndDate(current.startDate, current.duration);

      if (current.endDate === nextEndDate) {
        return current;
      }

      return {
        ...current,
        endDate: nextEndDate
      };
    });
  }, [submission.startDate, submission.duration]);

  const handleCompanyChange = (companyId) => {
    const selectedCompany = companies.find((company) => company._id === companyId);

    setSubmission((current) => ({
      ...current,
      companyId,
      companyEmail:
        selectedCompany?.verificationEmail ||
        selectedCompany?.contactEmail ||
        current.companyEmail
    }));
  };

  const submitInternship = async (saveAsDraft = false) => {
    setSubmitError("");
    setFeedback("");

    if (!saveAsDraft && !submission.report && !submission.draftId && !currentInternship?.rawReport?.url) {
      setSubmitError("Internship report file is required.");
      return;
    }

    if (saveAsDraft && currentInternship && currentInternship.status !== "draft") {
      setSubmitError("Submitted internship records cannot be saved as draft. Create a new internship record instead.");
      return;
    }

    if (
      !saveAsDraft &&
      submission.startDate &&
      submission.endDate &&
      new Date(`${submission.endDate}T00:00:00`) < new Date(`${submission.startDate}T00:00:00`)
    ) {
      setSubmitError("End date must be after or equal to start date.");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(submission).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      let response;

      if (!saveAsDraft && currentInternship && currentInternship.status !== "draft") {
        response = await api.put(`/internships/${currentInternship._id}/resubmit`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        formData.append("saveAsDraft", String(saveAsDraft));
        response = await api.post("/internships", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      const savedInternship = response.data.data;
      setCurrentInternship(savedInternship);

      setSubmission(mapInternshipToSubmission(savedInternship));

      setFeedback(
        saveAsDraft
          ? "Internship saved in the form as draft."
          : currentInternship && currentInternship.status !== "draft"
            ? "Internship record updated and resubmitted successfully."
            : "Internship submitted successfully."
      );
      await loadData();
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Internship submission failed.");
    }
  };

  const handleStatus = async (internshipId) => {
    setSubmitError("");
    setFeedback("");

    try {
      await api.put(`/internships/${internshipId}/status`, approvalForm);
      setApprovalForm(blankStatusForm);
      setFeedback("Approval status updated.");
      await loadData();
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Status update failed.");
    }
  };

  const handleResubmit = async (internshipId) => {
    const formData = new FormData();
    Object.entries(submission).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    await api.put(`/internships/${internshipId}/resubmit`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    loadData();
  };

  const loadRecordForEdit = (internship) => {
    setViewRecord(null);
    setCurrentInternship(internship);
    setSubmission(mapInternshipToSubmission(internship));
    setSubmitError("");
    setFeedback("");
  };

  const openRecordView = (internship) => {
    setCurrentInternship(null);
    setViewRecord(internship);
    setSubmission(blankSubmission);
    setSubmitError("");
    setFeedback("");
  };

  const createNewRecord = () => {
    setCurrentInternship(null);
    setViewRecord(null);
    setSubmission(blankSubmission);
    setSubmitError("");
    setFeedback("");
  };

  const clearDraft = () => {
    createNewRecord();
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        {user?.role === "student" ? (
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Previous internship records</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Review your earlier submissions and reopen editable records before final approval.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300">
                  {studentRecords.length} records
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {studentRecords.length ? studentRecords.map((item) => (
                  <div key={item._id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium text-white">{item.role || "Role pending"}</p>
                        <p className="mt-1 text-sm text-slate-400">{getCompanyDisplayName(item)}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {item.startDate || "N/A"} to {item.endDate || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={item.status} />
                        {isStudentEditable(item) ? (
                          <button
                            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                            type="button"
                            onClick={() => loadRecordForEdit(item)}
                          >
                            Edit
                          </button>
                        ) : item.rawReport?.url ? (
                          <button
                            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                            type="button"
                            onClick={() => openRecordView(item)}
                          >
                            View
                          </button>
                        ) : (
                          <button
                            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                            type="button"
                            onClick={() => openRecordView(item)}
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400">No internship records created yet.</p>}
              </div>
              <button className="mt-6 rounded-2xl border border-emerald-500/40 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400 hover:text-white" type="button" onClick={createNewRecord}>
                Create internship record
              </button>
            </section>

            {viewRecord ? (
              <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Internship record details</h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Read-only view of your submitted internship record.
                    </p>
                  </div>
                    <div className="flex flex-wrap gap-3">
                      <StatusBadge status={viewRecord.status} />
                      {viewRecord.rawReport?.url ? (
                        <a
                          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                          {...getReportLinkProps(viewRecord)}
                        >
                          View report
                        </a>
                      ) : null}
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-[180px_minmax(0,1fr)] divide-y divide-slate-800 text-sm">
                    {[
                      ["Student", viewRecord.student?.fullName || "Student"],
                      ["Company", getCompanyDisplayName(viewRecord)],
                      ["Role", viewRecord.role || "N/A"],
                      ["Duration", viewRecord.duration ? `${viewRecord.duration} days` : "N/A"],
                      ["Stipend", viewRecord.stipend || "N/A"],
                      ["Mode", viewRecord.internshipMode || "N/A"],
                      ["From Date", viewRecord.startDate || "N/A"],
                      ["To Date", viewRecord.endDate || "N/A"],
                      ["Weekly Hours", viewRecord.weeklyHours || "N/A"],
                      ["Work Location", viewRecord.workLocation || "N/A"],
                      ["Company Email", viewRecord.companyEmail || "N/A"],
                      ["Mentor Name", viewRecord.mentorName || "N/A"],
                      ["Mentor Email", viewRecord.mentorEmail || "N/A"],
                      ["Mentor Phone", viewRecord.mentorPhone || "N/A"],
                      ["Project Title", viewRecord.projectTitle || "N/A"],
                      ["Project Domain", viewRecord.projectDomain || "N/A"],
                      ["Responsibilities", viewRecord.responsibilities || "N/A"],
                      ["Learning Goals", viewRecord.learningGoals || "N/A"],
                      ["Tech Stack", viewRecord.techStack || "N/A"],
                      ["College Approval", viewRecord.collegeApproval?.approved === true ? "Approved" : viewRecord.collegeApproval?.approved === false ? "Rejected" : "Pending"],
                      ["Company Approval", viewRecord.companyApproval?.approved === true ? "Approved" : viewRecord.companyApproval?.approved === false ? "Rejected" : "Pending"]
                    ].map(([label, value]) => (
                      <>
                        <div key={`${label}-label`} className="bg-slate-900/80 px-5 py-4 text-slate-400">{label}</div>
                        <div key={`${label}-value`} className="bg-slate-900/30 px-5 py-4 text-slate-200">{value}</div>
                      </>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {!viewRecord ? (
              <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {currentInternship ? "Edit internship record" : "Submit internship"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Add the full internship context reviewers usually ask for, then upload your supporting report.
                  </p>
                </div>
                {currentInternship ? <StatusBadge status={currentInternship.status} /> : null}
              </div>
              {submission.draftId ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  <span>Draft is loaded in this form.</span>
                  <button
                    className="rounded-xl border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-100"
                    type="button"
                    onClick={clearDraft}
                  >
                    Clear form
                  </button>
                </div>
              ) : null}
              {currentInternship && currentInternship.status !== "draft" && currentInternship.status !== "approved" ? (
                <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Editing this record will reset previous college and company approval decisions and send the updated details back for review.
                </div>
              ) : null}
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitInternship(false);
                }}
              >
                <select className="input-field" value={submission.companyId} onChange={(event) => handleCompanyChange(event.target.value)}>
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>{company.name}</option>
                  ))}
                </select>
                <select className="input-field" value={submission.role} onChange={(event) => setSubmission((current) => ({ ...current, role: event.target.value }))}>
                  <option value="">Select role</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <select className="input-field" value={submission.duration} onChange={(event) => setSubmission((current) => ({ ...current, duration: event.target.value }))}>
                  <option value="">Select duration in days</option>
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>{duration} days</option>
                  ))}
                </select>
                <select className="input-field" value={submission.stipend} onChange={(event) => setSubmission((current) => ({ ...current, stipend: event.target.value }))}>
                  <option value="">Select stipend</option>
                  {stipendOptions.map((stipend) => (
                    <option key={stipend} value={stipend}>{stipend === "Unpaid" ? stipend : `Rs. ${stipend}`}</option>
                  ))}
                </select>
                <select className="input-field" value={submission.internshipMode} onChange={(event) => setSubmission((current) => ({ ...current, internshipMode: event.target.value }))}>
                  <option value="">Internship mode</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="input-field" type="date" value={submission.startDate} onChange={(event) => setSubmission((current) => ({ ...current, startDate: event.target.value }))} />
                  <input className="input-field" type="date" value={submission.endDate} readOnly />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <select className="input-field" value={submission.weeklyHours} onChange={(event) => setSubmission((current) => ({ ...current, weeklyHours: event.target.value }))}>
                    <option value="">Weekly hours</option>
                    {weeklyHourOptions.map((hours) => (
                      <option key={hours} value={hours}>{hours} hours/week</option>
                    ))}
                  </select>
                  <input className="input-field" placeholder="Work location" value={submission.workLocation} onChange={(event) => setSubmission((current) => ({ ...current, workLocation: event.target.value }))} />
                </div>
                <input className="input-field" type="email" placeholder="Company email" value={submission.companyEmail} onChange={(event) => setSubmission((current) => ({ ...current, companyEmail: event.target.value }))} />
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="input-field" placeholder="Mentor name" value={submission.mentorName} onChange={(event) => setSubmission((current) => ({ ...current, mentorName: event.target.value }))} />
                  <input className="input-field" type="email" placeholder="Mentor email" value={submission.mentorEmail} onChange={(event) => setSubmission((current) => ({ ...current, mentorEmail: event.target.value }))} />
                </div>
                <input className="input-field" placeholder="Mentor phone" value={submission.mentorPhone} onChange={(event) => setSubmission((current) => ({ ...current, mentorPhone: event.target.value }))} />
                <input className="input-field" placeholder="Project title" value={submission.projectTitle} onChange={(event) => setSubmission((current) => ({ ...current, projectTitle: event.target.value }))} />
                <select className="input-field" value={submission.projectDomain} onChange={(event) => setSubmission((current) => ({ ...current, projectDomain: event.target.value }))}>
                  <option value="">Project domain</option>
                  {projectDomainOptions.map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
                <textarea className="input-field min-h-28" placeholder="Responsibilities handled" value={submission.responsibilities} onChange={(event) => setSubmission((current) => ({ ...current, responsibilities: event.target.value }))} />
                <textarea className="input-field min-h-28" placeholder="Learning goals and outcomes" value={submission.learningGoals} onChange={(event) => setSubmission((current) => ({ ...current, learningGoals: event.target.value }))} />
                <textarea className="input-field min-h-28" placeholder="Tech stack or tools used" value={submission.techStack} onChange={(event) => setSubmission((current) => ({ ...current, techStack: event.target.value }))} />
                <input className="input-field" type="file" onChange={(event) => setSubmission((current) => ({ ...current, report: event.target.files?.[0] || null }))} />
                <p className="text-xs text-slate-500">Internship report file is mandatory for final submission.</p>
                {(submission.draftId || currentInternship?.rawReport?.url) && !submission.report ? (
                  <p className="text-xs text-slate-500">Current saved report will be kept unless you choose a new file.</p>
                ) : null}
                {submitError ? <p className="text-sm text-rose-400">{submitError}</p> : null}
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => submitInternship(true)}
                    disabled={Boolean(currentInternship && currentInternship.status !== "draft")}
                  >
                    Save as draft
                  </button>
                  <button className="primary-button w-full" type="submit">
                    {currentInternship && currentInternship.status !== "draft" ? "Update & Submit" : "Submit for approval"}
                  </button>
                </div>
              </form>
              {feedback ? <p className="mt-4 text-sm text-emerald-400">{feedback}</p> : null}
              </section>
            ) : null}
          </div>
        ) : (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Approve Student Report</h2>
            <p className="mt-2 text-sm text-slate-400">Review the student's internship report and approve or reject it from your side.</p>
            <div className="mt-6 space-y-4">
              <select className="input-field" value={String(approvalForm.approved)} onChange={(event) => setApprovalForm((current) => ({ ...current, approved: event.target.value === "true" }))}>
                <option value="true">Approve</option>
                <option value="false">Reject</option>
              </select>
              <textarea className="input-field min-h-28" placeholder="Reason when rejecting" value={approvalForm.reason} onChange={(event) => setApprovalForm((current) => ({ ...current, reason: event.target.value }))} />
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Student Reports Waiting For Approval</h3>
                <span className="text-sm text-slate-400">{pendingApprovals.length} items</span>
              </div>
              {pendingApprovals.length ? pendingApprovals.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-white">{item.student?.fullName || "Student"}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.role || "Role pending"} - {item.company?.name || "Company pending"}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {item.startDate || "N/A"} to {item.endDate || "N/A"}
                      </p>
                      <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                        <p>Project: {formatValue(item.projectTitle)}</p>
                        <p>Domain: {formatValue(item.projectDomain)}</p>
                        <p>Duration: {formatValue(item.duration, "N/A")} days</p>
                        <p>Mode: {formatValue(item.internshipMode)}</p>
                        <p>Weekly hours: {formatValue(item.weeklyHours, "N/A")}</p>
                        <p>Stipend: {formatValue(item.stipend)}</p>
                        <p>Mentor: {formatValue(item.mentorName)}</p>
                        <p>Mentor email: {formatValue(item.mentorEmail)}</p>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-slate-400">
                        <p>Responsibilities: {formatValue(item.responsibilities)}</p>
                        <p>Learning goals: {formatValue(item.learningGoals)}</p>
                        <p>Tech stack: {formatValue(item.techStack)}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {item.rawReport?.url ? (
                          <a
                            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                            {...buildDocumentLinkProps(item.rawReport.url, "submitted-report.pdf")}
                          >
                            View Submitted Report
                          </a>
                        ) : (
                          <span className="rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300">
                            Report Missing
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={getRoleVisibleStatus(item, user?.role)} />
                      <button className="primary-button" type="button" onClick={() => handleStatus(item._id)}>
                        Update status
                      </button>
                    </div>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-400">No pending approvals.</p>}
            </div>
            {submitError ? <p className="mt-4 text-sm text-rose-400">{submitError}</p> : null}
            {feedback ? <p className="mt-4 text-sm text-emerald-400">{feedback}</p> : null}
          </section>
        )}
      </div>
    </div>
  );
};

export default InternshipPage;
