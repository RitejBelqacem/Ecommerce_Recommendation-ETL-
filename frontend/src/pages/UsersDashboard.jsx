import { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const API = "http://127.0.0.1:5000";

const C = {
  pageBg:      "#f4f5f7",
  cardBg:      "#ffffff",
  topbarBg:    "#ffffff",
  border:      "#e8e8ed",
  textPrimary: "#1a1a2e",
  textMuted:   "#6b7280",
  textHint:    "#9ca3af",
  accent:      "#573ff5",
};

const COUNTRY_COLORS = ["#573ff5","#059669","#D97706","#DC2626","#0891b2","#7c3aed","#be185d"];

const tooltipStyle = {
  background: "#1a1a2e",
  border: "none",
  borderRadius: 8,
  fontSize: 12,
  color: "#f9fafb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};

// ── Squelette d'animation ────────────────────────────────────────
function Skeleton({ w = "100%", h = 18, radius = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "#e9eaec",
      animation: "pulse 1.4s ease-in-out infinite",
    }} />
  );
}

// ── Carte KPI ────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent, iconBg, iconColor, icon, skeleton }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "16px 18px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: 3, height: "100%", background: accent,
        borderRadius: "12px 0 0 12px",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: "0.06em" }}>
          {label}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: iconBg, color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      {skeleton
        ? <Skeleton h={28} w={100} />
        : <div style={{ fontSize: 26, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{value ?? "—"}</div>
      }
      <div style={{ fontSize: 12, color: C.textHint, marginTop: 6 }}>
        {skeleton ? <Skeleton h={12} w={80} /> : sub}
      </div>
    </div>
  );
}

// ── Titre de section ─────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: C.textHint,
      letterSpacing: "0.08em", marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

// ── Carte conteneur ──────────────────────────────────────────────
function Card({ title, children, style }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      ...style,
    }}>
      {title && (
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 16 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Custom tooltip graphique ─────────────────────────────────────
function ChartTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tooltipStyle, padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb" }}>
          {p.value?.toLocaleString("fr-FR")}{unit}
        </div>
      ))}
    </div>
  );
}

// ── Tableau pays ─────────────────────────────────────────────────
function CountryTable({ data }) {
  if (!data?.length) return <div style={{ fontSize: 13, color: C.textHint }}>Aucune donnée</div>;

  const max = Math.max(...data.map(r => r.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.slice(0, 8).map((r, i) => {
        const pct = max > 0 ? Math.round((r.count / max) * 100) : 0;
        return (
          <div key={r.country} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 12, color: C.textMuted, width: 40, flexShrink: 0,
              fontWeight: 600, textTransform: "uppercase",
            }}>
              {r.country}
            </span>
            <div style={{ flex: 1, height: 8, background: "#f0f0f3", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
                borderRadius: 4, transition: "width 0.7s ease",
              }} />
            </div>
            <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: 600, width: 40, textAlign: "right" }}>
              {r.count.toLocaleString("fr-FR")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Badges rôles ─────────────────────────────────────────────────
function RoleBadges({ data, total }) {
  if (!data?.length) return null;
  const ROLE_COLOR = { admin: "#573ff5", user: "#059669" };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {data.map(r => {
        const pct = total > 0 ? ((r.count / total) * 100).toFixed(1) : 0;
        const color = ROLE_COLOR[r.role] ?? C.accent;
        return (
          <div key={r.role} style={{
            flex: 1, minWidth: 120,
            background: color + "10",
            border: `1px solid ${color}30`,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <div style={{ fontSize: 11, color: color, fontWeight: 700, textTransform: "capitalize", letterSpacing: "0.04em" }}>
              {r.role}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>
              {r.count.toLocaleString("fr-FR")}
            </div>
            <div style={{ fontSize: 11, color: C.textHint }}>{pct}% du total</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────
export default function UsersDashboard() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/etl_output/kpis_users.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données utilisateurs.");
    }
  };

  useEffect(() => {
    loadData().finally(() => setInitialLoad(false));
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/run-etl`);
      if (!res.ok) throw new Error(`Serveur: ${res.status}`);
      await loadData();
    } catch (err) {
      setError("Erreur lors de la mise à jour.");
    }
    setLoading(false);
  };

  const timeLabel = lastUpdated?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // Données graphiques
  const regData    = data?.registrations_over_time ?? [];
  const countryData = data?.by_country ?? [];
  const roleData   = data?.by_role ?? [];
  const total      = data?.total_users ?? 0;

  const kpiCards = [
    {
      label: "TOTAL UTILISATEURS",
      value: total.toLocaleString("fr-FR"),
      sub: `${data?.new_7d ?? 0} nouveaux cette semaine`,
      accent: C.accent, iconBg: "#EEEDFE", iconColor: "#534AB7",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M11 14v-1.5a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3V14"/>
          <circle cx="6" cy="5" r="3"/>
          <path d="M15 14v-1.5a3 3 0 0 0-2-2.83"/>
          <path d="M11 2.17a3 3 0 0 1 0 5.66"/>
        </svg>
      ),
    },
    {
      label: "NOUVEAUX CE MOIS",
      value: data?.new_30d != null ? `+${data.new_30d.toLocaleString("fr-FR")}` : "—",
      sub: "inscriptions (30 derniers jours)",
      accent: "#059669", iconBg: "#ECFDF5", iconColor: "#065F46",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M8 1v14M1 8h14"/>
        </svg>
      ),
    },
    {
      label: "NOUVEAUX CETTE SEMAINE",
      value: data?.new_7d != null ? `+${data.new_7d.toLocaleString("fr-FR")}` : "—",
      sub: "inscriptions (7 derniers jours)",
      accent: "#0891b2", iconBg: "#ECFEFF", iconColor: "#164E63",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="2" width="14" height="13" rx="2"/>
          <path d="M5 1v3M11 1v3M1 7h14"/>
        </svg>
      ),
    },
    {
      label: "PAYS REPRÉSENTÉS",
      value: countryData.length.toLocaleString("fr-FR"),
      sub: countryData[0] ? `Top : ${countryData[0].country} (${countryData[0].count})` : "",
      accent: "#D97706", iconBg: "#FFFBEB", iconColor: "#92400E",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="7"/>
          <path d="M1 8h14M8 1a11 11 0 0 1 0 14M8 1a11 11 0 0 0 0 14"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.pageBg }}>
      <Sidebar />

      <main style={{
        marginLeft: SIDEBAR_WIDTH, flex: 1,
        display: "flex", flexDirection: "column",
        minHeight: "100vh", background: C.pageBg,
      }}>

        {/* Topbar */}
        <div style={{
          padding: "14px 28px", borderBottom: `1px solid ${C.border}`,
          background: C.topbarBg,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: C.accent,
              }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>
                Utilisateurs
              </div>
            </div>
           
          </div>

          <button
            onClick={handleRefresh} disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 8, fontSize: 13,
              background: "#fff", border: `1px solid ${C.border}`,
              color: C.textPrimary, cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f0edff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
          >
            <svg style={{ width: 13, height: 13, animation: loading ? "spin 1s linear infinite" : "none" }}
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="14,2 14,6 10,6"/>
              <path d="M13.2 9a6 6 0 1 1-1.4-6.2L14 6"/>
            </svg>
            {loading ? "Mise à jour..." : "Rafraîchir"}
          </button>
        </div>

        {/* Contenu */}
        <div style={{ padding: "24px 28px", flex: 1 }}>

          {/* Erreur */}
          {error && (
            <div style={{
              marginBottom: 16, padding: "10px 14px", borderRadius: 8,
              background: "#FEF2F2", border: "1px solid #FECACA",
              color: "#991B1B", fontSize: 13,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="8"/>
                <circle cx="8" cy="11" r="0.5" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

          {/* KPIs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 12, marginBottom: 24,
          }}>
            {kpiCards.map((k, i) => (
              <KpiCard key={i} {...k} skeleton={initialLoad} />
            ))}
          </div>

          {/* Graphique inscriptions */}
          <SectionLabel>ACTIVITÉ</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>

            <Card title="Inscriptions par mois">
              {initialLoad ? (
                <Skeleton h={200} />
              ) : regData.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={regData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={C.accent} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f0f0f3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: C.textHint, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => v?.slice(0, 7)}
                    />
                    <YAxis
                      tick={{ fill: C.textHint, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone" dataKey="count"
                      stroke={C.accent} strokeWidth={2}
                      fill="url(#gUsers)" dot={false}
                      activeDot={{ r: 4, fill: C.accent, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ fontSize: 13, color: C.textHint, padding: "60px 0", textAlign: "center" }}>
                  Aucune donnée d'inscription
                </div>
              )}
            </Card>

            {/* Rôles */}
            <Card title="Répartition par rôle">
              {initialLoad ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Skeleton h={70} /><Skeleton h={70} />
                </div>
              ) : (
                <RoleBadges data={roleData} total={total} />
              )}
            </Card>
          </div>

          {/* Répartition pays */}
          <SectionLabel>GÉOGRAPHIE</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Barres pays */}
            <Card title="Répartition par pays">
              {initialLoad
                ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1,2,3,4,5].map(i => <Skeleton key={i} h={14} />)}
                  </div>
                : <CountryTable data={countryData} />
              }
            </Card>

            {/* BarChart pays */}
            <Card title="Top pays — graphique">
              {initialLoad ? (
                <Skeleton h={200} />
              ) : countryData.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={countryData.slice(0, 8)}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#f0f0f3" vertical={false} />
                    <XAxis
                      dataKey="country"
                      tick={{ fill: C.textHint, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.textHint, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                      {countryData.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ fontSize: 13, color: C.textHint, padding: "60px 0", textAlign: "center" }}>
                  Aucune donnée pays
                </div>
              )}
            </Card>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}