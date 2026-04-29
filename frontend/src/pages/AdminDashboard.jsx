import { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";

const API = "http://127.0.0.1:5000";

const C = {
  pageBg:      "#f4f5f7",
  cardBg:      "#ffffff",
  topbarBg:    "#ffffff",
  border:      "#e8e8ed",
  textPrimary: "#1a1a2e",
  textMuted:   "#6b7280",
  textHint:    "#9ca3af",
};

// ── Couleurs par type d'activité ────────────────────────────────
const ACTIVITY_COLOR = {
  commande: "#059669",
  user:     "#573ff5",
  product:  "#D97706",
};

const ACTIVITY_ICON = {
  commande: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 2h2l2.4 7h6l2-5H6"/>
      <circle cx="9" cy="13" r="1"/><circle cx="13" cy="13" r="1"/>
    </svg>
  ),
  user: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="5" r="3"/>
      <path d="M2 14a6 6 0 0 1 12 0"/>
    </svg>
  ),
  product: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 11V5a1 1 0 0 0-.5-.87L8.5 1.13a1 1 0 0 0-1 0L3.5 4.13A1 1 0 0 0 3 5v6a1 1 0 0 0 .5.87l4 2.27a1 1 0 0 0 1 0l4-2.27A1 1 0 0 0 14 11z"/>
    </svg>
  ),
};

const KPI_CONFIG = [
  {
    key:    "users",
    label:  "UTILISATEURS",
    metric: (d) => Number(d.users?.total_users ?? 0).toLocaleString("fr-FR"),
    sub:    (d) => `+${d.users?.new_30d ?? 0} ce mois`,
    accent: "#573ff5", iconBg: "#EEEDFE", iconColor: "#534AB7",
    icon: (c) => (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6">
        <path d="M11 14v-1.5a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3V14"/>
        <circle cx="6" cy="5" r="3"/>
        <path d="M15 14v-1.5a3 3 0 0 0-2-2.83"/>
        <path d="M11 2.17a3 3 0 0 1 0 5.66"/>
      </svg>
    ),
  },
  {
    key:    "commandes",
    label:  "CHIFFRE D'AFFAIRES",
    metric: (d) => d.commandes?.revenue != null
      ? Number(d.commandes.revenue).toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DT"
      : "—",
    sub:    (d) => `${d.commandes?.total_orders ?? 0} commandes`,
    accent: "#059669", iconBg: "#ECFDF5", iconColor: "#065F46",
    icon: (c) => (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6">
        <line x1="8" y1="1" x2="8" y2="15"/>
        <path d="M11 4H6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H4"/>
      </svg>
    ),
  },
  {
    key:    "products",
    label:  "PRODUITS",
    metric: (d) => Number(d.products?.total_products ?? 0).toLocaleString("fr-FR"),
    sub:    (d) => `${d.products?.out_of_stock ?? 0} ruptures`,
    accent: "#D97706", iconBg: "#FFFBEB", iconColor: "#92400E",
    icon: (c) => (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6">
        <path d="M14 11V5a1 1 0 0 0-.5-.87L8.5 1.13a1 1 0 0 0-1 0L3.5 4.13A1 1 0 0 0 3 5v6a1 1 0 0 0 .5.87l4 2.27a1 1 0 0 0 1 0l4-2.27A1 1 0 0 0 14 11z"/>
      </svg>
    ),
  },
];

// ── Utilitaire : temps relatif ───────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "";
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60)   return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  } catch { return ""; }
}

// ── Composant KpiCard ────────────────────────────────────────────
function KpiCard({ cfg, data, skeleton }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "14px 16px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: 3, height: "100%", background: cfg.accent,
        borderRadius: "10px 0 0 10px",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em" }}>
          {cfg.label}
        </span>
        <div style={{
          width: 30, height: 30, borderRadius: 7, background: cfg.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {cfg.icon(cfg.iconColor)}
        </div>
      </div>
      {skeleton ? (
        <div style={{ height: 26, width: 90, borderRadius: 6, background: "#e9eaec", animation: "kpi-pulse 1.4s ease-in-out infinite" }} />
      ) : (
        <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>
          {data ? cfg.metric(data) : "—"}
        </div>
      )}
      <div style={{ fontSize: 11, color: C.textHint, marginTop: 5 }}>
        {data ? cfg.sub(data) : ""}
      </div>
    </div>
  );
}

// ── Composant BarChart catégories ────────────────────────────────
function CategoryBars({ items }) {
  if (!items?.length) return <div style={{ fontSize: 12, color: C.textHint, padding: "8px 0" }}>Aucune donnée</div>;

  const max = Math.max(...items.map((r) => r.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.slice(0, 6).map((r) => {
        const pct = max > 0 ? Math.round((r.count / max) * 100) : 0;
        return (
          <div key={r.category} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: C.textMuted, width: 90, flexShrink: 0, textAlign: "right", textTransform: "capitalize" }}>
              {r.category}
            </span>
            <div style={{ flex: 1, height: 7, background: "#f0f0f3", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "#573ff5", borderRadius: 4, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600, width: 32, textAlign: "right" }}>
              {r.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Composant Activité récente ───────────────────────────────────
function ActivityFeed({ events, loading }) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e9eaec", flexShrink: 0, animation: "kpi-pulse 1.4s ease-in-out infinite" }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 10, width: "60%", background: "#e9eaec", borderRadius: 4, marginBottom: 4, animation: "kpi-pulse 1.4s ease-in-out infinite" }} />
              <div style={{ height: 9, width: "40%", background: "#f0f0f3", borderRadius: 4, animation: "kpi-pulse 1.4s ease-in-out infinite" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return <div style={{ fontSize: 12, color: C.textHint, padding: "8px 0" }}>Aucune activité récente</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {events.map((e, i) => {
        const color = ACTIVITY_COLOR[e.type] ?? "#888";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: color + "18", color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {ACTIVITY_ICON[e.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: C.textPrimary, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.label}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{e.detail}</div>
            </div>
            <span style={{ fontSize: 10, color: C.textHint, flexShrink: 0 }}>
              {timeAgo(e.created_at)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard principal ──────────────────────────────────────────
export default function AdminDashboard() {
  const [data,        setData]        = useState(null);
  const [activity,    setActivity]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [actLoading,  setActLoading]  = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/etl_output/kpis_all.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les KPIs.");
    }
  };

  const loadActivity = async () => {
    setActLoading(true);
    try {
      const res = await fetch(`${API}/recent-activity`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setActivity(await res.json());
    } catch (err) {
      console.error("activity:", err);
    }
    setActLoading(false);
  };

  useEffect(() => {
    Promise.all([loadData(), loadActivity()]).finally(() => setInitialLoad(false));
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/run-etl`);
      if (!res.ok) throw new Error(`Serveur: ${res.status}`);
      await Promise.all([loadData(), loadActivity()]);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour.");
    }
    setLoading(false);
  };

  const timeLabel = lastUpdated?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // Données barres catégories : produits (by_category contient {category, count})
  const categoryData = data?.products?.by_category ?? [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.pageBg }}>
      <Sidebar />

      <main style={{ marginLeft: SIDEBAR_WIDTH, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", background: C.pageBg }}>

        {/* Topbar */}
        <div style={{
          padding: "14px 28px", borderBottom: `1px solid ${C.border}`,
          background: C.topbarBg,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>Dashboard Admin</div>
            {timeLabel && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Mis à jour à {timeLabel}</div>}
          </div>
          <button
            onClick={handleRefresh} disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 8, fontSize: 13,
              background: "#fff", border: `1px solid ${C.border}`,
              color: C.textPrimary, cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#f0edff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
          >
            <svg style={{ width: 13, height: 13, animation: loading ? "spin 1s linear infinite" : "none" }}
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="14,2 14,6 10,6"/>
              <path d="M13.2 9a6 6 0 1 1-1.4-6.2L14 6"/>
            </svg>
            {loading ? "Mise à jour..." : "Rafraîchir"}
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px", flex: 1 }}>

          {error && (
            <div style={{
              marginBottom: 16, padding: "10px 14px", borderRadius: 8,
              background: "#FEF2F2", border: "1px solid #FECACA",
              color: "#991B1B", fontSize: 13,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="8"/>
              </svg>
              {error}
            </div>
          )}

          {/* Section label */}
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textHint, letterSpacing: "0.08em", marginBottom: 12 }}>
            VUE GLOBALE
          </div>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
            {KPI_CONFIG.map((cfg) => (
              <KpiCard key={cfg.key} cfg={cfg} data={data} skeleton={initialLoad} />
            ))}
          </div>

          {/* Ligne 2 : barres catégories + activité récente */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Ventes par catégorie */}
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "16px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 14 }}>
                Produits par catégorie
              </div>
              <CategoryBars items={categoryData} />
            </div>

            {/* Activité récente */}
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "16px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 14 }}>
                Activité récente
              </div>
              <ActivityFeed events={activity} loading={actLoading} />
            </div>

          </div>

        </div>
      </main>

      <style>{`
        @keyframes spin      { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes kpi-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </div>
  );
}