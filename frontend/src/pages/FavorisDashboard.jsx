import { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import {
  BarChart, Bar, PieChart, Pie, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
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
  accent:      "#D4537E",
};

const PALETTE = [
  "#D4537E","#573ff5","#D97706","#059669",
  "#0891b2","#7c3aed","#DC2626","#0f766e",
];

const tooltipStyle = {
  background: "#1a1a2e", border: "none",
  borderRadius: 8, fontSize: 12, color: "#f9fafb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};

function Skeleton({ w = "100%", h = 18, radius = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "#e9eaec", animation: "pulse 1.4s ease-in-out infinite",
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

function Card({ title, subtitle, children, style }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...style,
    }}>
      {title && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.textHint, marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

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
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: "0.06em" }}>{label}</span>
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
        : <div style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {value ?? "—"}
          </div>
      }
      <div style={{ fontSize: 12, color: C.textHint, marginTop: 6 }}>
        {skeleton ? <Skeleton h={12} w={80} /> : sub}
      </div>
    </div>
  );
}

// ── Podium top 3 ─────────────────────────────────────────────────
function Podium({ data, skeleton }) {
  if (skeleton) return <Skeleton h={200} />;
  if (data.length < 1) return <div style={{ fontSize: 13, color: C.textHint, textAlign: "center", padding: "40px 0" }}>Aucune donnée</div>;

  const top3  = data.slice(0, 3);
  const order = [
    { idx: 1, rank: 2, h: 90,  color: "#573ff5", medal: "🥈" },
    { idx: 0, rank: 1, h: 130, color: "#D4537E", medal: "🥇" },
    { idx: 2, rank: 3, h: 65,  color: "#D97706", medal: "🥉" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, padding: "8px 0 0" }}>
      {order.map(({ idx, rank, h, color, medal }) => {
        const p = top3[idx];
        if (!p) return <div key={rank} style={{ flex: 1 }} />;
        return (
          <div key={rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{medal}</div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: C.textPrimary,
              textAlign: "center", maxWidth: 110,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              marginBottom: 2,
            }}>
              {p.product_name}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, color,
              background: color + "15", borderRadius: 6,
              padding: "2px 8px", marginBottom: 8,
            }}>
              {p.count} ♥
            </div>
            <div style={{
              width: "100%", height: h, background: `linear-gradient(180deg, ${color}, ${color}bb)`,
              borderRadius: "8px 8px 0 0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 900, color: "#fff",
              boxShadow: `0 -3px 12px ${color}44`,
            }}>
              {rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── RadialBar adoption ───────────────────────────────────────────
function AdoptionRadial({ pct, usersWithFav, totalUsers, skeleton }) {
  if (skeleton) return <Skeleton h={200} />;

  const radialData = [{ value: Math.min(pct, 100), fill: C.accent }];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="60%" outerRadius="90%"
            startAngle={90} endAngle={90 - (pct / 100) * 360}
            data={radialData}
          >
            <RadialBar
              dataKey="value" cornerRadius={8}
              background={{ fill: "#f0f0f3", radius: 8 }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", textAlign: "center",
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>adoption</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>
            {Number(usersWithFav).toLocaleString("fr-FR")}
          </div>
          <div style={{ fontSize: 10, color: C.textHint }}>avec favoris</div>
        </div>
        <div style={{ width: 1, background: C.border }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary }}>
            {Number(totalUsers).toLocaleString("fr-FR")}
          </div>
          <div style={{ fontSize: 10, color: C.textHint }}>total users</div>
        </div>
      </div>
    </div>
  );
}

// ── BarChart horizontal top 10 ───────────────────────────────────
function TopProductsBar({ data, skeleton }) {
  if (skeleton) return <Skeleton h={300} />;
  if (!data?.length) return (
    <div style={{ fontSize: 13, color: C.textHint, textAlign: "center", padding: "60px 0" }}>
      Aucune donnée — lance <code>seed_favoris.py</code>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data.slice(0, 10)} layout="vertical"
        margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
      >
        <CartesianGrid stroke="#f0f0f3" horizontal={false} />
        <XAxis type="number" tick={{ fill: C.textHint, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis
          dataKey="product_name" type="category"
          tick={{ fill: C.textMuted, fontSize: 11 }}
          axisLine={false} tickLine={false} width={130}
          tickFormatter={v => v?.length > 17 ? v.slice(0, 17) + "…" : v}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={v => [v, "♥ favoris"]} />
        <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={20}>
          <LabelList
            dataKey="count" position="right"
            style={{ fill: C.textMuted, fontSize: 10, fontWeight: 700 }}
          />
          {data.slice(0, 10).map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── PieChart catégories avec légende ────────────────────────────
function CategoryPie({ data, skeleton }) {
  if (skeleton) return <Skeleton h={200} />;
  if (!data?.length) return (
    <div style={{ fontSize: 13, color: C.textHint, textAlign: "center", padding: "40px 0" }}>Aucune donnée</div>
  );

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <div style={{ flexShrink: 0 }}>
        <ResponsiveContainer width={170} height={170}>
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={42} outerRadius={76}
              paddingAngle={3} dataKey="count"
              startAngle={90} endAngle={-270}
            >
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n, p) => [v, p.payload.category]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
        {data.map((c, i) => {
          const pct   = total > 0 ? ((c.count / total) * 100).toFixed(1) : 0;
          const color = PALETTE[i % PALETTE.length];
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.textPrimary, textTransform: "capitalize" }}>
                    {c.category}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
                  <span style={{ fontSize: 11, color: C.textHint }}>{c.count}</span>
                </div>
              </div>
              <div style={{ height: 4, background: "#f0f0f3", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%", background: color,
                  borderRadius: 2, transition: "width 0.7s ease",
                }} />
              </div>
            </div>
          );
        })}
        <div style={{
          marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: C.textMuted,
        }}>
          <span>Total</span>
          <span style={{ fontWeight: 700, color: C.textPrimary }}>{total.toLocaleString("fr-FR")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Classement liste enrichi ─────────────────────────────────────
function RankingList({ data, skeleton }) {
  if (skeleton) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} h={44} />)}
    </div>
  );
  if (!data?.length) return (
    <div style={{ fontSize: 13, color: C.textHint, textAlign: "center", padding: "40px 0" }}>Aucune donnée</div>
  );

  const max = data[0]?.count ?? 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {data.slice(0, 10).map((p, i) => {
        const pct   = Math.round((p.count / max) * 100);
        const color = PALETTE[i % PALETTE.length];
        const isTop = i < 3;

        return (
          <div key={`rank-${i}`} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", borderRadius: 8,
            background: isTop ? color + "08" : "transparent",
            border: `1px solid ${isTop ? color + "20" : "transparent"}`,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              background: isTop ? color : "#f0f0f3",
              color: isTop ? "#fff" : C.textHint,
              fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {i + 1}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: isTop ? color : C.textPrimary,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  maxWidth: "55%",
                }}>
                  {p.product_name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{p.count} ♥</span>
                  {p.category && (
                    <span style={{
                      fontSize: 9, fontWeight: 600,
                      background: color + "18", color,
                      borderRadius: 4, padding: "2px 6px", textTransform: "capitalize",
                    }}>
                      {p.category}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ height: 4, background: "#f0f0f3", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: `linear-gradient(90deg, ${color}, ${color}99)`,
                  borderRadius: 2, transition: "width 0.9s ease",
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
export default function FavorisDashboard() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/etl_output/kpis_favoris.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Impossible de charger les données favoris.");
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
      if (!res.ok) throw new Error();
      await loadData();
    } catch {
      setError("Erreur lors de la mise à jour.");
    }
    setLoading(false);
  };

  const timeLabel   = lastUpdated?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const byCategory  = data?.by_category  ?? [];
  const topProducts = data?.top_products ?? [];
  const usersWithFav  = data?.users_with_fav ?? 0;
  const pctUsersFav   = data?.pct_users_fav  ?? 0;
  const totalUsersEst = pctUsersFav > 0 ? Math.round(usersWithFav / (pctUsersFav / 100)) : 0;

  const kpiCards = [
    {
      label: "TOTAL FAVORIS",
      value: data?.total_favoris != null ? Number(data.total_favoris).toLocaleString("fr-FR") : "—",
      sub: `moy. ${data?.avg_fav_per_user ?? "—"} / utilisateur`,
      accent: C.accent, iconBg: "#FCE7F3", iconColor: "#9D174D",
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 14s-6-3.9-6-8a4 4 0 0 1 6-3.45A4 4 0 0 1 14 6c0 4.1-6 8-6 8z"/></svg>,
    },
    {
      label: "USERS AVEC FAVORIS",
      value: usersWithFav ? Number(usersWithFav).toLocaleString("fr-FR") : "—",
      sub: `sur ${totalUsersEst.toLocaleString("fr-FR")} utilisateurs`,
      accent: "#573ff5", iconBg: "#EEEDFE", iconColor: "#534AB7",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M11 14v-1.5a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3V14"/>
          <circle cx="6" cy="5" r="3"/>
          <path d="M15 14v-1.5a3 3 0 0 0-2-2.83M11 2.17a3 3 0 0 1 0 5.66"/>
        </svg>
      ),
    },
    {
      label: "TAUX D'ADOPTION",
      value: pctUsersFav ? `${pctUsersFav}%` : "—",
      sub: "ont au moins 1 favori",
      accent: "#059669", iconBg: "#ECFDF5", iconColor: "#065F46",
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 8 L6 13 L15 3"/></svg>,
    },
    {
      label: "MOY. PAR UTILISATEUR",
      value: data?.avg_fav_per_user ?? "—",
      sub: "favoris par user actif",
      accent: "#D97706", iconBg: "#FFFBEB", iconColor: "#92400E",
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 2v12M4 6h8M4 10h8"/></svg>,
    },
    {
      label: "PRODUIT N°1",
      value: topProducts[0]?.product_name?.slice(0, 15) ?? "—",
      sub: topProducts[0] ? `${topProducts[0].count} ♥ favoris` : "",
      accent: "#D4537E", iconBg: "#FCE7F3", iconColor: "#9D174D",
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6"/></svg>,
    },
    {
      label: "CATÉGORIES",
      value: byCategory.length || "—",
      sub: byCategory[0] ? `Top : ${byCategory[0].category}` : "",
      accent: "#0891b2", iconBg: "#ECFEFF", iconColor: "#164E63",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="1" width="6" height="6" rx="1"/>
          <rect x="9" y="1" width="6" height="6" rx="1"/>
          <rect x="1" y="9" width="6" height="6" rx="1"/>
          <rect x="9" y="9" width="6" height="6" rx="1"/>
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
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>Favoris</div>
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
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#fdf2f8"; }}
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
              color: "#991B1B", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg style={{ width: 13, height: 13 }} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="9"/>
              </svg>
              {error}
            </div>
          )}

          {/* 6 KPIs */}
          <SectionLabel>VUE GLOBALE</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12, marginBottom: 24,
          }}>
            {kpiCards.map((k, i) => <KpiCard key={i} {...k} skeleton={initialLoad} />)}
          </div>

          {/* Podium + Adoption */}
          <SectionLabel>ENGAGEMENT</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, minWidth: 0 }}>
            <Card title="Podium — Top 3 produits" subtitle="Les plus mis en favoris" style={{ minWidth: 0 }}>
              <Podium data={topProducts} skeleton={initialLoad} />
            </Card>
            <Card title="Taux d'adoption" subtitle="Part des utilisateurs avec au moins 1 favori" style={{ minWidth: 0 }}>
              {initialLoad ? <Skeleton h={220} /> : (
                <AdoptionRadial pct={pctUsersFav} usersWithFav={usersWithFav} totalUsers={totalUsersEst} skeleton={false} />
              )}
            </Card>
          </div>

          {/* Catégories */}
          <SectionLabel mt={8}>PAR CATÉGORIE</SectionLabel>
          <Card title="Répartition des favoris par catégorie" subtitle="Distribution et pourcentages" style={{ minWidth: 0, overflow: "hidden" }}>
            {initialLoad ? <Skeleton h={200} /> : <CategoryPie data={byCategory} skeleton={false} />}
          </Card>

        </div>
      </main>

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        .recharts-wrapper { min-width: 0 !important; }
        .recharts-responsive-container { min-width: 0 !important; }
      `}</style>
    </div>
  );
}