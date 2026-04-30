import { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
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
  accent:      "#059669",
};
const MONTH_COLORS = ["#059669","#573ff5","#D97706","#DC2626","#0891b2","#7c3aed","#be185d","#0f766e"];

const tooltipStyle = {
  background: "#1a1a2e", border: "none",
  borderRadius: 8, fontSize: 12, color: "#f9fafb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};

// ── Utilitaires ──────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 18, radius = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "#e9eaec",
      animation: "pulse 1.4s ease-in-out infinite",
    }} />
  );
}

function SectionLabel({ children, mt = 0 }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: C.textHint,
      letterSpacing: "0.08em", marginBottom: 12, marginTop: mt,
    }}>
      {children}
    </div>
  );
}

function Card({ title, children, style }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...style,
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

// ── KPI Card ─────────────────────────────────────────────────────
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
        : <div style={{ fontSize: 26, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>
            {value ?? "—"}
          </div>
      }
      <div style={{ fontSize: 12, color: C.textHint, marginTop: 6 }}>
        {skeleton ? <Skeleton h={12} w={80} /> : sub}
      </div>
    </div>
  );
}

// ── Custom Tooltip ───────────────────────────────────────────────
function ChartTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tooltipStyle, padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb" }}>
          {p.name} : {typeof p.value === "number"
            ? p.value.toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : p.value}{suffix}
        </div>
      ))}
    </div>
  );
}

// ── Tableau top clients ──────────────────────────────────────────
function TopUsersTable({ data, skeleton }) {
  if (skeleton) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[1,2,3,4,5].map(i => <Skeleton key={i} h={38} />)}
      </div>
    );
  }
  if (!data?.length) return (
    <div style={{ fontSize: 13, color: C.textHint, textAlign: "center", padding: "30px 0" }}>
      Aucune donnée
    </div>
  );

  const max = data[0]?.total_spent ?? 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((u, i) => {
        const pct   = Math.round((u.total_spent / max) * 100);
        const color = MONTH_COLORS[i % MONTH_COLORS.length];
        return (
          <div key={u.user_id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: color + "20", color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>
              {i + 1}
            </div>

            {/* Barre + montant */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: C.textMuted }}>
                  User #{u.user_id}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>
                  {Number(u.total_spent).toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT
                </span>
              </div>
              <div style={{ height: 5, background: "#f0f0f3", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: color, borderRadius: 3,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tableau mensuel ──────────────────────────────────────────────
function MonthlyTable({ data, skeleton }) {
  if (skeleton) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} h={34} />)}
      </div>
    );
  }
  if (!data?.length) return (
    <div style={{ fontSize: 13, color: C.textHint, textAlign: "center", padding: "20px 0" }}>
      Aucune donnée mensuelle
    </div>
  );

  const maxRev = Math.max(...data.map(r => r.revenue));

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 70px 110px 90px",
        padding: "6px 8px", fontSize: 10, fontWeight: 700,
        color: C.textHint, letterSpacing: "0.06em",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span>MOIS</span>
        <span style={{ textAlign: "right" }}>CMDS</span>
        <span style={{ textAlign: "right" }}>CA</span>
        <span style={{ textAlign: "right" }}>TENDANCE</span>
      </div>
      {[...data].reverse().slice(0, 8).map((r, i) => {
        const pct = maxRev > 0 ? Math.round((r.revenue / maxRev) * 100) : 0;
        return (
          <div key={r.month} style={{
            display: "grid", gridTemplateColumns: "1fr 70px 110px 90px",
            padding: "9px 8px", fontSize: 12,
            borderBottom: `1px solid ${C.border}`,
            background: i % 2 === 0 ? "transparent" : "#fafafa",
            alignItems: "center",
          }}>
            <span style={{ fontWeight: 600, color: C.textPrimary }}>{r.month}</span>
            <span style={{ textAlign: "right", color: C.textMuted }}>{r.orders}</span>
            <span style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
              {Number(r.revenue).toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT
            </span>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 60, height: 6, background: "#f0f0f3", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: "#059669", borderRadius: 3,
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────
export default function CommandesDashboard() {
  const [period, setPeriod] = useState("day");
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/etl_output/kpis_commandes.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données commandes.");
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

  const timeLabel     = lastUpdated?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const monthlyData   = data?.monthly            ?? [];
  const cumulData     = data?.revenue_cumulative ?? [];
  const dailyData = data?.orders_daily ?? [];
  
const ordersMonthly = monthlyData.map(m => ({
  created_at: new Date(m.month).toLocaleString("fr-FR", { month: "short" }),
  count: m.orders
}));
// ── Données annuelles ─────────────────────────────
const ordersYearly = Object.values(
  monthlyData.reduce((acc, m) => {
    const year = m.month.slice(0, 4); // "2024-01" → "2024"

    if (!acc[year]) {
      acc[year] = {
        created_at: year,
        count: 0
      };
    }

    acc[year].count += m.orders;

    return acc;
  }, {})
);

const chartData =
  period === "day"
    ? dailyData
    : period === "month"
    ? ordersMonthly
    : ordersYearly;
  const topUsers      = data?.top_users          ?? [];

  const kpiCards = [
    {
      label:   "CHIFFRE D'AFFAIRES",
      value:   data?.revenue != null
        ? Number(data.revenue).toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DT"
        : "—",
      sub:     `${data?.total_orders ?? 0} commandes au total`,
      accent:  C.accent, iconBg: "#ECFDF5", iconColor: "#065F46",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="8" y1="1" x2="8" y2="15"/>
          <path d="M11 4H6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H4"/>
        </svg>
      ),
    },
    {
      label:   "PANIER MOYEN",
      value:   data?.avg_cart != null
        ? Number(data.avg_cart).toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DT"
        : "—",
      sub:     `min ${data?.min_order != null ? Number(data.min_order).toFixed(2) : "—"} DT · max ${data?.max_order != null ? Number(data.max_order).toFixed(2) : "—"} DT`,
      accent:  "#573ff5", iconBg: "#EEEDFE", iconColor: "#534AB7",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 2h2l2.4 7h6l2-5H6"/>
          <circle cx="9" cy="13" r="1"/><circle cx="13" cy="13" r="1"/>
        </svg>
      ),
    },
    {
      label:   "TAUX DE CONVERSION",
      value:   data?.conversion_rate != null ? `${data.conversion_rate}%` : "—",
      sub:     `${data?.users_ordered ?? 0} acheteurs uniques`,
      accent:  "#D97706", iconBg: "#FFFBEB", iconColor: "#92400E",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M1 8 L6 13 L15 3"/>
        </svg>
      ),
    },
    {
      label:   "COMMANDES (7J)",
      value:   data?.orders_7d != null ? Number(data.orders_7d).toLocaleString("fr-FR") : "—",
      sub:     "cette semaine",
      accent:  "#0891b2", iconBg: "#ECFEFF", iconColor: "#164E63",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="2" width="14" height="13" rx="2"/>
          <path d="M5 1v3M11 1v3M1 7h14"/>
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
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>Commandes</div>
            </div>
            {timeLabel && (
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, marginLeft: 18 }}>
                Mis à jour à {timeLabel}
              </div>
            )}
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
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#ecfdf5"; }}
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

          {error && (
            <div style={{
              marginBottom: 16, padding: "10px 14px", borderRadius: 8,
              background: "#FEF2F2", border: "1px solid #FECACA",
              color: "#991B1B", fontSize: 13,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="9"/>
              </svg>
              {error}
            </div>
          )}

          {/* KPIs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12, marginBottom: 24,
          }}>
            {kpiCards.map((k, i) => (
              <KpiCard key={i} {...k} skeleton={initialLoad} />
            ))}
          </div>

          {/* CA cumulé + commandes/jour */}
          <SectionLabel>ÉVOLUTION</SectionLabel>
          <div style={{ display: "grid", gap: 16, marginBottom: 16 }}>

            {/* AreaChart CA cumulé */}
            <Card title="Chiffre d'affaires cumulé">
              {initialLoad ? <Skeleton h={200} /> : cumulData.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={cumulData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={C.accent} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f0f0f3" vertical={false} />
                    <XAxis
                      dataKey="created_at"
                      tick={{ fill: C.textHint, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => v?.slice(5, 10)}
                      interval={Math.floor(cumulData.length / 6)}
                    />
                    <YAxis
                      tick={{ fill: C.textHint, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={v => [
                        Number(v).toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DT",
                        "CA cumulé"
                      ]}
                      labelFormatter={l => `Date : ${l}`}
                    />
                    <Area
                      type="monotone" dataKey="cumulative"
                      stroke={C.accent} strokeWidth={2}
                      fill="url(#gCA)" dot={false}
                      activeDot={{ r: 4, fill: C.accent, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ fontSize: 13, color: C.textHint, padding: "60px 0", textAlign: "center" }}>
                  Aucune donnée cumulative
                </div>
              )}
            </Card>
</div>
          <div style={{ display: "grid",gap: 16, marginBottom: 16 }}>

            {/* Commandes par jour (LineChart) */}
            <Card title="Commandes">
  {initialLoad ? <Skeleton h={200} /> : chartData.length ? (
    <>
      {/* SELECT propre */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e0e0e4",
            fontSize: 12,
            cursor: "pointer",
            background: "#573ff5"
          }}
        >
          <option value="day">Par jour</option>
          <option value="month">Par mois</option>
          <option value="year">Par année</option>
        </select>
      </div>

      {/* GRAPH */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#f0f0f3" vertical={false} />

          <XAxis
            dataKey="created_at"
            tick={{ fill: C.textHint, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
           tickFormatter={(v) =>
  period === "day"
    ? v?.slice(5)        // 04-30
    : period === "month"
    ? v                  // 2024-01
    : v                  // 2024
}
          />

          <YAxis tick={{ fill: C.textHint, fontSize: 10 }} axisLine={false} tickLine={false} />

          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [v, "commandes"]}
          />

          <Line
            type="monotone"
            dataKey="count"
            stroke="#573ff5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  ) : (
    <div style={{ textAlign: "center", padding: 60 }}>Aucune donnée</div>
  )}
</Card>
          </div>

          {/* CA mensuel (BarChart) */}
          <SectionLabel mt={8}>CA PAR MOIS</SectionLabel>
          <div style={{ marginBottom: 16 }}>
            <Card title="Revenus mensuels">
              {initialLoad ? <Skeleton h={220} /> : monthlyData.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#f0f0f3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: C.textHint, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.textHint, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v, name) => [
                        name === "revenue"
                          ? Number(v).toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DT"
                          : v,
                        name === "revenue" ? "CA" : "Commandes"
                      ]}
                    />
                    <Bar dataKey="revenue" name="revenue" radius={[4,4,0,0]} maxBarSize={48}>
                      {monthlyData.map((_, i) => (
                        <Cell key={i} fill={MONTH_COLORS[i % MONTH_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ fontSize: 13, color: C.textHint, padding: "60px 0", textAlign: "center" }}>
                  Aucune donnée mensuelle
                </div>
              )}
            </Card>
          </div>

          {/* Tableau mensuel + Top clients */}
          <SectionLabel mt={8}>DÉTAIL</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            <Card title="Historique mensuel">
              <MonthlyTable data={monthlyData} skeleton={initialLoad} />
            </Card>

            <Card title="Top 5 clients (CA)">
              <TopUsersTable data={topUsers} skeleton={initialLoad} />
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