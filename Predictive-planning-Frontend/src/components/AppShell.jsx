import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="shell-vertical">
      <header className="top-header">
        <div className="header-left">
          <NavLink to="/ai-powered-demand-forecast" className="header-brand">
            <span>Predictive Planning</span>
          </NavLink>
          
          {user?.role === "admin" && (
            <nav className="header-nav">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `header-link ${isActive ? "is-active" : ""}`
                }
              >
                <span>Admin</span>
              </NavLink>
            </nav>
          )}
        </div>

        <div className="header-right">
          {user && (
            <span className="user-email text-xs text-slate-500 mr-2">
              {user.email || user.username}
            </span>
          )}
          <button
            type="button"
            className="header-logout"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}