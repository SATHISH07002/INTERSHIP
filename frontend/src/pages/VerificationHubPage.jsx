import { useEffect, useState } from "react";
import api from "../lib/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const VerificationHubPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/verification/inbox").then((response) => setItems(response.data.data)).catch(() => setItems([]));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Verification inbox</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          {user?.role === "mentor" ? "Mentor dashboard" : "Company verification dashboard"}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Review internships waiting for your action, track flagged submissions, and inspect company and mentor data.
        </p>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-medium text-white">{item.student?.fullName}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.role} at {item.company?.name}</p>
                  <p className="mt-3 text-sm text-slate-400">
                    Mentor: {item.mentorName || "N/A"} | Mentor email: {item.mentorEmail || "N/A"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Verification ID: {item.verificationId || "Pending"} | Flags: {item.fraudFlags?.length ? item.fraudFlags.join(", ") : "None"}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
          {!items.length ? <p className="text-sm text-slate-400">No verification requests are waiting for this role.</p> : null}
        </div>
      </section>
    </div>
  );
};

export default VerificationHubPage;
