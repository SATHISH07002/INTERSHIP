import { useEffect, useState } from "react";
import api from "../lib/axios.js";
import StatusBadge from "../components/StatusBadge.jsx";

const AdminReviewPage = () => {
  const [internships, setInternships] = useState([]);
  const [decision, setDecision] = useState({ approved: true, reason: "" });

  const loadData = () => {
    api.get("/admin/internships").then((response) => setInternships(response.data.data)).catch(() => setInternships([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitDecision = async (id) => {
    await api.post(`/admin/internships/${id}/decision`, decision);
    setDecision({ approved: true, reason: "" });
    loadData();
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Admin control</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Admin dashboard</h2>
        <p className="mt-2 text-sm text-slate-400">
          Review flagged internships, check fraud signals, and take the final approval decision.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <select className="input-field" value={String(decision.approved)} onChange={(event) => setDecision((current) => ({ ...current, approved: event.target.value === "true" }))}>
            <option value="true">Approve</option>
            <option value="false">Reject</option>
          </select>
          <input className="input-field" placeholder="Reason or admin remarks" value={decision.reason} onChange={(event) => setDecision((current) => ({ ...current, reason: event.target.value }))} />
        </div>
        <div className="mt-6 space-y-4">
          {internships.map((item) => (
            <div key={item._id} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-medium text-white">{item.student?.fullName}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.role} at {item.company?.name}</p>
                  <p className="mt-3 text-sm text-slate-400">
                    Public verification ID: {item.verificationId || "Pending"} | Duplicate detected: {item.duplicateDetected ? "Yes" : "No"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Company domain valid: {item.companyDomainValid ? "Yes" : "No"} | Flags: {item.fraudFlags?.length ? item.fraudFlags.join(", ") : "None"}
                  </p>
                </div>
                <div className="space-y-3 text-right">
                  <StatusBadge status={item.status} />
                  <button className="primary-button" type="button" onClick={() => submitDecision(item._id)}>
                    Save admin decision
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!internships.length ? <p className="text-sm text-slate-400">No internships available for admin review.</p> : null}
        </div>
      </section>
    </div>
  );
};

export default AdminReviewPage;
