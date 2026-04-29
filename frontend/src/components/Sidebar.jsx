import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaTachometerAlt, FaBox, FaSignOutAlt, FaChevronDown,
} from "react-icons/fa";

const NAV_ACCENT = "#573ff5";
export const SIDEBAR_WIDTH = 220; // ← exporté pour que les pages l'utilisent

const subItems = [
  { label: "Vue globale",   path: "/admin" },
  { label: "Utilisateurs",  path: "/dashboard/users" },
  { label: "Produits",      path: "/dashboard/products" },
  { label: "Commandes",     path: "/dashboard/orders" },
  { label: "Favoris",       path: "/dashboard/favoris" },
  { label: "Panier",        path: "/dashboard/panier" },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{
      position: "fixed",      // ← fixé en dehors du flux
      top: 0, left: 0,
      width: SIDEBAR_WIDTH,
      height: "100vh",
      zIndex: 100,
      background: "#1e1b3a",
      display: "flex", flexDirection: "column",
      padding: "20px 14px",
    }}>

      {/* Logo */}
      <div style={{ padding: "0 6px", marginBottom: 28 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>E</span>
        <span style={{ color: "#a89df5", fontWeight: 500, fontSize: 15 }}>shop </span>
        <span style={{ color: NAV_ACCENT, fontWeight: 700, fontSize: 16 }}>Admin</span>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>

        {/* Dashboard toggle */}
        <div
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", borderRadius: 8, cursor: "pointer",
            fontSize: 13,
            color: open ? "#fff" : "#a8a3c9",
            background: open ? "#2d2856" : "transparent",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <FaTachometerAlt style={{ fontSize: 13, flexShrink: 0 }} />
          Dashboard
          <FaChevronDown style={{
            marginLeft: "auto", fontSize: 11,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }} />
        </div>

        {/* Submenu */}
        {open && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, marginLeft: 24, marginTop: 2 }}>
            {subItems.map(({ label, path }) => (
              <div
                key={path}
                onClick={() => navigate(path)}
                style={{
                  padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  color: isActive(path) ? "#a89df5" : "#8b86b0",
                  background: isActive(path) ? "#2d2856" : "transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { if (!isActive(path)) { e.currentTarget.style.background = "#2d2856"; e.currentTarget.style.color = "#c4bfed"; }}}
                onMouseLeave={(e) => { if (!isActive(path)) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8b86b0"; }}}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Gestion produits */}
        <div
          onClick={() => navigate("/admin/products")}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", borderRadius: 8, cursor: "pointer",
            fontSize: 13, marginTop: 4,
            color: isActive("/admin/products") ? "#fff" : "#a8a3c9",
            background: isActive("/admin/products") ? NAV_ACCENT : "transparent",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { if (!isActive("/admin/products")) { e.currentTarget.style.background = "#2d2856"; e.currentTarget.style.color = "#fff"; }}}
          onMouseLeave={(e) => { if (!isActive("/admin/products")) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a8a3c9"; }}}
        >
          <FaBox style={{ fontSize: 13, flexShrink: 0 }} />
          Gestion des produits
        </div>

      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 10px", borderRadius: 8, border: "none",
          background: "#2d2856", color: "#a8a3c9",
          fontSize: 13, cursor: "pointer", width: "100%",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = NAV_ACCENT; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#2d2856"; e.currentTarget.style.color = "#a8a3c9"; }}
      >
        <FaSignOutAlt style={{ fontSize: 13 }} />
        Déconnexion
      </button>
    </div>
  );
}