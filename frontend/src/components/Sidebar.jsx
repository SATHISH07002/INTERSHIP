import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const getProfileImageUrl = (profileImage) =>
  typeof profileImage === "string" ? profileImage : profileImage?.url || "";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const profileImageUrl = getProfileImageUrl(user?.profileImage);
  const navItems = [
    { to: "/dashboard", label: "Overview" },
    ...(user?.role === "student" ? [{ to: "/profile", label: "Profile" }] : []),
    ...(user?.role === "mentor" ? [{ to: "/verification", label: "Verification" }] : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
    { to: "/internships", label: "Internships" },
    { to: "/offers", label: "Offers" }
  ];

  return (
    <aside className="glass-panel flex h-full flex-col justify-between p-6 lg:overflow-y-auto">
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">CertiTrust</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Internship Control Center</h1>
          <Link to="/profile" className="mt-4 flex items-center gap-3 rounded-2xl transition hover:bg-slate-800/60 p-1 -m-1">
            {profileImageUrl ? (
              <img
                className="h-12 w-12 rounded-2xl object-cover"
                src={profileImageUrl}
                alt={user.fullName || "User"}
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold text-white">
                {(user?.fullName || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-sm text-slate-300">{user?.fullName}</p>
          </Link>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <button type="button" onClick={logout} className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300 transition hover:border-rose-500 hover:text-rose-300">
        Log out
      </button>
    </aside>
  );
};

export default Sidebar;
