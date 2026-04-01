const styles = {
  approved: "bg-emerald-600/20 text-emerald-300 border-emerald-600/40",
  in_progress: "bg-slate-700/40 text-slate-200 border-slate-600",
  college_pending: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  resubmission_required: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  draft: "bg-slate-700/40 text-slate-200 border-slate-600",
  submitted: "bg-sky-500/15 text-sky-200 border-sky-500/30",
  mentor_pending: "bg-sky-500/15 text-sky-200 border-sky-500/30",
  mentor_verified: "bg-indigo-500/15 text-indigo-200 border-indigo-500/30",
  company_pending: "bg-indigo-500/15 text-indigo-200 border-indigo-500/30",
  company_verified: "bg-blue-500/15 text-blue-200 border-blue-500/30",
  admin_pending: "bg-violet-500/15 text-violet-200 border-violet-500/30",
  flagged: "bg-rose-500/15 text-rose-300 border-rose-500/30"
};

const labels = {
  approved: "Approved",
  in_progress: "In Progress",
  college_pending: "Pending College",
  rejected: "Rejected",
  resubmission_required: "Edit & Resubmit",
  draft: "Draft",
  submitted: "Pending",
  mentor_pending: "Pending",
  mentor_verified: "Pending Company",
  company_pending: "Pending Company",
  company_verified: "Company Verified",
  admin_pending: "Admin Pending",
  flagged: "Flagged"
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles[status] || styles.in_progress}`}>
    {labels[status] || status}
  </span>
);

export default StatusBadge;
