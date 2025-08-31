import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const MainLayout = () => {
  const location = useLocation();

  // Show sidebar only on "/problems"
  const showSidebar = location.pathname === "/problems";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar (only for /problems) */}
        {showSidebar && (
          <div className="w-60">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 transition-colors duration-300 ${showSidebar ? "" : "w-full"} bg-gray-50 dark:bg-[#121212]`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
