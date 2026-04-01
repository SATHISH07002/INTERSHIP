import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <Sidebar />
        </div>
        <main className="glass-panel min-w-0 overflow-hidden lg:h-[calc(100vh-2rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
