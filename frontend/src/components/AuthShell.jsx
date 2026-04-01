const AuthShell = ({ title, subtitle, children }) => (
  <div className="flex min-h-screen items-center justify-center px-4 py-10">
    <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/70 shadow-panel backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-slate-800 p-10 lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),transparent_55%,rgba(148,163,184,0.08))]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">CertiTrust</p>
          <h1 className="mt-6 max-w-md text-5xl font-semibold leading-tight text-white">
            Dual approval and instant certificate issuance for internships.
          </h1>
          <div className="mt-10 grid gap-4 text-sm text-slate-300">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              Company and college approval queues stay independent.
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              Verified certificates are generated only after both approvals are complete.
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              Public QR verification keeps external validation simple.
            </div>
          </div>
        </div>
      </section>
      <section className="p-6 md:p-10">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-3 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  </div>
);

export default AuthShell;
