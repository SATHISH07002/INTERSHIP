import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const baseForm = {
  fullName: "",
  email: "",
  password: "",
  role: "student",
  rollNo: "",
  degree: "",
  branch: "",
  department: "",
  collegeName: "",
  companyName: "",
  phone: ""
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(baseForm);
  const [error, setError] = useState("");

  const title = useMemo(() => {
    if (form.role === "student") return "Student profile";
    if (form.role === "college") return "College approver";
    return "Company account";
  }, [form.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Configure the role-specific profile required by the approval engine.">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <select className="input-field md:col-span-2" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
          <option value="student">Student</option>
          <option value="college">College</option>
          <option value="company">Company</option>
        </select>
        <input className="input-field md:col-span-2" placeholder="Full name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
        <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        <input className="input-field md:col-span-2" placeholder={form.role === "company" ? "Company name" : "College name"} value={form.role === "company" ? form.companyName : form.collegeName} onChange={(event) => setForm((current) => form.role === "company" ? { ...current, companyName: event.target.value } : { ...current, collegeName: event.target.value })} />
        {form.role === "student" ? (
          <>
            <input className="input-field" placeholder="Roll No" value={form.rollNo} onChange={(event) => setForm((current) => ({ ...current, rollNo: event.target.value }))} />
            <input className="input-field" placeholder="Degree" value={form.degree} onChange={(event) => setForm((current) => ({ ...current, degree: event.target.value }))} />
            <input className="input-field" placeholder="Branch" value={form.branch} onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))} />
            <input className="input-field" placeholder="Department" value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} />
          </>
        ) : null}
        {form.role === "company" ? (
          <input className="input-field md:col-span-2" placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
        ) : null}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
          Workflow: {title}
        </div>
        {error ? <p className="md:col-span-2 text-sm text-rose-400">{error}</p> : null}
        <button className="primary-button md:col-span-2" type="submit">Create account</button>
      </form>
      <p className="mt-6 text-sm text-slate-400">
        Already registered? <Link to="/login" className="text-emerald-400">Sign in</Link>
      </p>
    </AuthShell>
  );
};

export default RegisterPage;
