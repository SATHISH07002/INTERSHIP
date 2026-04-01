import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const KNOWN_ACCOUNTS_KEY = "certitrust-known-accounts";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const knownAccounts = useMemo(() => {
    try {
      const raw = localStorage.getItem(KNOWN_ACCOUNTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

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
        {knownAccounts.length ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Recent ids</p>
            <p className="mt-2 text-sm text-slate-400">Tap a saved account to fill the email instantly.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {knownAccounts.map((account) => (
                <button
                  key={account.email}
                  className={`rounded-2xl border px-3 py-2 text-left transition ${
                    form.email === account.email
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500"
                  }`}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, email: account.email }))}
                >
                  <span className="block text-sm font-medium">{account.fullName || account.email}</span>
                  <span className="block text-xs text-slate-400">{account.email}</span>
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.25em] text-slate-500">{account.role || "account"}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
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
