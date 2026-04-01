import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const buildDocumentLinkProps = (url) => {
  if (!url) {
    return {};
  }

  if (url.startsWith("data:")) {
    return {
      href: url,
      download: "certificate.pdf"
    };
  }

  return {
    href: url,
    target: "_blank",
    rel: "noreferrer"
  };
};

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

const getCompanyDisplayName = (item) =>
  item.company?.name ||
  item.companyUser?.fullName ||
  item.companyEmail ||
  "Company pending";

const StatCard = ({ label, value, tone = "default" }) => {
  const accents = {
    default: "text-slate-100",
    approved: "text-emerald-400",
    rejected: "text-rose-400"
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/65 p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className={`mt-4 text-3xl font-semibold ${accents[tone]}`}>{value}</p>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [pending, setPending] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    api.get("/internships").then((response) => setInternships(response.data.data));
    api.get("/offers").then((response) => setOffers(response.data.data));

    if (user?.role !== "student") {
      api.get("/internships/pending").then((response) => setPending(response.data.data));
    }
  }, [user?.role]);

  const approvedCount = internships.filter((item) => {
    if (user?.role === "company") {
      return item.companyApproval?.approved === true;
    }

    if (user?.role === "college") {
      return item.collegeApproval?.approved === true;
    }

    return item.status === "approved";
  }).length;
  const rejectedCount = internships.filter((item) => {
    if (user?.role === "company") {
      return item.companyApproval?.approved === false;
    }

    if (user?.role === "college") {
      return item.collegeApproval?.approved === false;
    }

    return item.status === "resubmission_required";
  }).length;
  const visiblePending =
    user?.role === "college"
      ? internships.filter(
          (item) =>
            item.collegeApproval?.approved === null &&
            ["submitted", "college_pending", "company_pending", "resubmission_required"].includes(item.status)
        )
      : user?.role === "company"
        ? internships.filter(
            (item) =>
              item.companyApproval?.approved === null &&
              ["submitted", "college_pending", "company_pending", "resubmission_required"].includes(item.status)
          )
        : pending;
  const profileCompletion = [
    user?.rollNo,
    user?.registerNo,
    user?.department,
    user?.collegeName,
    user?.phone,
    user?.skills
  ].filter(Boolean).length;

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.36em] text-emerald-400">Role dashboard</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Operational overview</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Review approvals, certificate readiness, and active recruitment notices in one place.
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Total internships" value={internships.length} />
        <StatCard label="Approved" value={approvedCount} tone="approved" />
        <StatCard label="Needs resubmission" value={rejectedCount} tone="rejected" />
      </section>

      {user?.role === "student" ? (
        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Student profile readiness</h3>
              <p className="mt-2 text-sm text-slate-400">
                Complete your academic and contact details before sending internship records for approval.
              </p>
            </div>
            <Link className="primary-button inline-flex items-center justify-center px-5 py-3" to="/profile">
              {profileCompletion >= 6 ? "Review profile" : "Complete profile"}
            </Link>
          </div>
        </section>
      ) : null}

      {user?.role !== "student" ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Student Reports Waiting For Approval</h3>
              <span className="text-sm text-slate-400">{visiblePending.length} items</span>
            </div>
            <div className="mt-5 space-y-3">
              {visiblePending.length ? visiblePending.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{item.student?.fullName || "Student"}</p>
                      <p className="text-sm text-slate-400">
                        {item.role || "Role pending"} - {getCompanyDisplayName(item)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={getRoleVisibleStatus(item, user?.role)} />
                      <Link className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white" to="/internships">
                        Review
                      </Link>
                    </div>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-400">No pending approvals.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <h3 className="text-lg font-semibold text-white">Offer volume</h3>
            <p className="mt-2 text-sm text-slate-400">Published job and internship notices.</p>
            <p className="mt-6 text-5xl font-semibold text-white">{offers.length}</p>
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent internships</h3>
          <span className="text-sm text-slate-400">{internships.length} records</span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-4 font-medium">Student</th>
                <th className="pb-4 font-medium">Company</th>
                <th className="pb-4 font-medium">Role</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {internships.map((item) => (
                <tr key={item._id}>
                  <td className="py-4 text-slate-200">{item.student?.fullName || "Student"}</td>
                  <td className="py-4 text-slate-400">{getCompanyDisplayName(item)}</td>
                  <td className="py-4 text-slate-400">{item.role || "Draft"}</td>
                  <td className="py-4"><StatusBadge status={getRoleVisibleStatus(item, user?.role)} /></td>
                  <td className="py-4 text-slate-400">
                    {item.certificate?.url ? <a className="text-emerald-400" {...buildDocumentLinkProps(item.certificate.url)}>View PDF</a> : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
