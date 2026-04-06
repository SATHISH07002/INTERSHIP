import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Access student, college, and company workflows from one workspace.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        <input className="input-field" placeholder="Password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button className="primary-button w-full" type="submit">Sign in</button>
      </form>
      <p className="mt-6 text-sm text-slate-400">
        Need an account? <Link to="/register" className="text-emerald-400">Register</Link>
      </p>
    </AuthShell>
  );
};

export default LoginPage;
