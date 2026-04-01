import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios.js";
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

const VerifyCertificatePage = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/certificates/verify/${id}`)
      .then((response) => setCertificate(response.data.data))
      .catch((err) => setError(err.response?.data?.message || "Certificate not found"));
  }, [id]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-4xl p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Public verification</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Certificate authenticity check</h1>
        {error ? <p className="mt-8 text-rose-400">{error}</p> : null}
        {certificate ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <p className="text-sm text-slate-400">Student</p>
              <p className="mt-2 text-2xl font-semibold text-white">{certificate.student.fullName}</p>
              <p className="mt-4 text-sm text-slate-400">Roll No</p>
              <p className="text-slate-200">{certificate.student.rollNo || "N/A"}</p>
              <p className="mt-4 text-sm text-slate-400">Department</p>
              <p className="text-slate-200">{certificate.student.department || "N/A"}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <p className="text-sm text-slate-400">Internship</p>
              <p className="mt-2 text-2xl font-semibold text-white">{certificate.role}</p>
              <p className="mt-4 text-sm text-slate-400">Company</p>
              <p className="text-slate-200">{certificate.company.name}</p>
              <p className="mt-4 text-sm text-slate-400">Duration</p>
              <p className="text-slate-200">{certificate.duration}</p>
              <p className="mt-4 text-sm text-slate-400">Project title</p>
              <p className="text-slate-200">{certificate.projectTitle || "N/A"}</p>
              <div className="mt-5">
                <StatusBadge status={certificate.status} />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 md:col-span-2">
              <p className="text-sm text-slate-400">Certificate ID</p>
              <p className="mt-2 text-xl font-semibold text-white">{certificate.certificate?.certificateId}</p>
              <p className="mt-4 text-sm text-slate-400">Public verification ID</p>
              <p className="text-slate-200">{certificate.verificationId || certificate.certificate?.verificationId || "Pending"}</p>
              <p className="mt-4 text-sm text-slate-400">Issued</p>
              <p className="text-slate-200">
                {certificate.certificate?.generatedAt ? new Date(certificate.certificate.generatedAt).toLocaleString() : "Pending"}
              </p>
              <p className="mt-4 text-sm text-slate-400">Verification trail</p>
              <p className="text-slate-200">
                Mentor: {certificate.mentorVerification?.status || "Pending"} | Company: {certificate.companyVerification?.status || "Pending"} | Admin: {certificate.adminReview?.status || "Pending"}
              </p>
              {certificate.fraudFlags?.length ? (
                <p className="mt-4 text-sm text-rose-300">Fraud checks raised: {certificate.fraudFlags.join(", ")}</p>
              ) : null}
              {certificate.certificate?.url ? (
                <a className="mt-5 inline-block text-emerald-400" {...buildDocumentLinkProps(certificate.certificate.url)}>
                  Open certificate PDF
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VerifyCertificatePage;
