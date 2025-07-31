import React, { useContext } from "react";
import { Link, useLocation,useNavigate } from "react-router-dom";
import { Outlet } from 'react-router-dom';
import { AuthContext } from "../contexts/AuthContext";
import {
  Home,
  Calendar,
  Activity,
  Users,
  MapPin,
  Bell,
  Settings,
  Heart,
  Menu,
  X,
  LogOut
} from "lucide-react";
import "./Layout.css";

/*interface LayoutProps {
  children: React.ReactNode;
} */

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { logout } = useContext(AuthContext);
  const navigate  = useNavigate()

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/health", label: "Health Tracking", icon: Activity },
    // { path: "/care-circle", label: "Care Circle", icon: Heart },
    { path: "/forum", label: "Forum", icon: Users },
    { path: "/resourcesAlt", label: "Resources", icon: MapPin },
    { path: "/resources", label: "Locations", icon: X },
    // { path: "/alerts", label: "Alerts", icon: Bell },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
          <div className="logo">
            <Heart className="logo-icon" />
            <span className="logo-text">Nurtura</span>
          </div>
        </div>
      </header>

      <div className="layout-body">
        <nav className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="nav-items">
            <div className="logo">
              <Heart className="logo-icon" />
              <span className="logo-text">Nurtura</span>
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
            {/* ↓ LOGOUT BUTTON ↓ */}
            <button
              className="nav-item logout-button"
              onClick={handleLogout}
            >
              <LogOut className="nav-icon" />
              <span className="nav-label">Log Out</span>
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
