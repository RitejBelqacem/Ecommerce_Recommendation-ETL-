import { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import {
  BarChart, Bar, PieChart, Pie,
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
  accent:      "#D85A30",
};

const COLORS = ["#D85A30","#573ff5","#059669","#D97706","#0891b2","#7c3aed","#DC2626","#0f766e"];

const tooltipStyle = {
  background: "#e3e3ed", border: "none",
  borderRadius: 8, fontSize: 12, color: "#f9fafb",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  color:"#00008a"
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

function KpiCard({ label, value, sub, accent, iconBg, iconColor, icon, skeleton, alert }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${alert ? accent + "44" : C.border}`,
      borderRadius: 12, padding: "16px 18px",
      position: "relative", overflow: "hidden",
      boxShadow: alert ? `0 0 0 2px ${accent}18` : "0 1px 4px rgba(0,0,0,0.05)",
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
        : <div style={{ fontSize: 26, fontWeight: 700, color: alert ? accent : C.textPrimary, lineHeight: 1 }}>
            {value ?? "—"}
          </div>
      }
      <div style={{ fontSize: 12, color: C.textHint, marginTop: 6 }}>
        {skeleton ? <Skeleton h={12} w={80} /> : sub}
      </div>
    </div>
  );
}

// ── Jauge taux d'abandon ─────────────────────────────────────────
function AbandonGauge({ rate, skeleton }) {
  if (skeleton) return <Skeleton h={140} />;
  const pct   = Math.min(rate ?? 0, 100);
  const color = pct > 60 ? "#DC2626" : pct > 35 ? "#D97706" : "#059669";
  const label = pct > 60 ? "Critique" : pct > 35 ? "Modéré" : "Bon";

  // Arc SVG
  const r     = 60;
  const circ  = Math.PI * r;
  const dash  = (pct / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Fond arc */}
        <path
          d={`M 20 80 A ${r} ${r} 0 0 1 140 80`}
          fill="none" stroke="#f0f0f3" strokeWidth="14" strokeLinecap="round"
        />
        {/* Arc coloré */}
        <path
          d={`M 20 80 A ${r} ${r} 0 0 1 140 80`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        {/* Texte centre */}
        <text x="80" y="72" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>
          {pct}%
        </text>
      </svg>
      <div style={{
        fontSize: 12, fontWeight: 600, color,
        background: color + "18", borderRadius: 6, padding: "3px 12px",
      }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: C.textHint }}>taux d'abandon panier</div>
    </div>
  );
}

// ── Barres horizontales ──────────────────────────────────────────
function HBars({ data, valueKey, labelKey }) {
  if (!data?.length) return <div style={{ fontSize: 13, color: C.textHint }}>Aucune donnée</div>;
  const max = Math.max(...data.map(r => r[valueKey]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((r, i) => {
        const pct = max > 0 ? Math.round((r[valueKey] / max) * 100) : 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 11, color: C.textMuted, width: 90, flexShrink: 0,
              textAlign: "right", textTransform: "capitalize", fontWeight: 500,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {r[labelKey]}
            </span>
            <div style={{ flex: 1, height: 7, background: "#f0f0f3", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: COLORS[i % COLORS.length],
                borderRadius: 4, transition: "width 0.7s ease",
              }} />
            </div>
            <span style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600, width: 40, textAlign: "right", flexShrink: 0 }}>
              {r[valueKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────
export default function PanierDashboard() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/etl_output/kpis_panier.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données panier.");
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

  const timeLabel   = lastUpdated?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const byCategory  = data?.by_category  ?? [];
  const topProducts = data?.top_products ?? [];
  const abandonRate = data?.abandon_rate ?? 0;

  const kpiCards = [
    {
      label: "TAUX D'ABANDON",
      value: data?.abandon_rate != null ? `${data.abandon_rate}%` : "—",
      sub: `${data?.abandoned_carts ?? 0} paniers abandonnés`,
      accent: C.accent, iconBg: "#FEF2F2", iconColor: "#991B1B",
      alert: (data?.abandon_rate ?? 0) > 35,
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 2h2l2.4 7h6l2-5H6"/>
          <line x1="3" y1="3" x2="13" y2="13"/>
        </svg>
      ),
    },
    {
      label: "PANIERS ACTIFS",
      value: data?.users_with_cart != null ? Number(data.users_with_cart).toLocaleString("fr-FR") : "—",
      sub: "utilisateurs avec panier",
      accent: "#573ff5", iconBg: "#EEEDFE", iconColor: "#534AB7",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 2h2l2.4 7h6l2-5H6"/>
          <circle cx="9" cy="13" r="1"/><circle cx="13" cy="13" r="1"/>
        </svg>
      ),
    },
    {
      label: "TOTAL ARTICLES",
      value: data?.total_quantity != null ? Number(data.total_quantity).toLocaleString("fr-FR") : "—",
      sub: `${data?.total_items ?? 0} lignes panier`,
      accent: "#059669", iconBg: "#ECFDF5", iconColor: "#065F46",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="3" width="14" height="12" rx="2"/>
          <path d="M5 3V2a3 3 0 0 1 6 0v1"/>
        </svg>
      ),
    },
    {
      label: "PANIERS ABANDONNÉS",
      value: data?.abandoned_carts != null ? Number(data.abandoned_carts).toLocaleString("fr-FR") : "—",
      sub: "sans commande passée",
      accent: "#D97706", iconBg: "#FFFBEB", iconColor: "#92400E",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="7"/>
          <line x1="8" y1="5" x2="8" y2="9"/>
          <circle cx="8" cy="11.5" r="0.5" fill="currentColor"/>
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
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>Panier</div>
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
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#fff5f0"; }}
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
          <SectionLabel>VUE GLOBALE</SectionLabel>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 12, marginBottom: 24,
          }}>
            {kpiCards.map((k, i) => (
              <KpiCard key={i} {...k} skeleton={initialLoad} />
            ))}
          </div>

          {/* Abandon + catégories */}
          <SectionLabel>ANALYSE ABANDON</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>

            {/* Jauge */}
            <Card title="Taux d'abandon">
              <AbandonGauge rate={abandonRate} skeleton={initialLoad} />
              {!initialLoad && (
                <div style={{
                  marginTop: 16, padding: "10px 14px", borderRadius: 8,
                  background: abandonRate > 35 ? "#FEF2F2" : "#ECFDF5",
                  border: `1px solid ${abandonRate > 35 ? "#FECACA" : "#A7F3D0"}`,
                  fontSize: 12,
                  color: abandonRate > 35 ? "#991B1B" : "#065F46",
                }}>
                  {abandonRate > 60
                    ? "⚠ Taux critique — action urgente requise"
                    : abandonRate > 35
                    ? "⚡ Taux élevé — optimiser le tunnel d'achat"
                    : "✓ Taux acceptable — continuer à surveiller"}
                </div>
              )}
            </Card>

            {/* Quantités par catégorie */}
            <Card title="Quantités par catégorie">
              {initialLoad
                ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1,2,3,4,5].map(i => <Skeleton key={i} h={14} />)}
                  </div>
                : <HBars data={byCategory} valueKey="quantity" labelKey="category" />
              }
              {!initialLoad && byCategory.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={byCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#f0f0f3" vertical={false} />
                      <XAxis dataKey="category" tick={{ fill: C.textHint, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.textHint, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={v => [v, "articles"]}
                      />
                      <Bar dataKey="quantity" radius={[4,4,0,0]} maxBarSize={40}>
                        {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Top produits panier */}
          <SectionLabel mt={8}>TOP PRODUITS EN PANIER</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Classement liste */}
            <Card title="Produits les plus ajoutés au panier">
              {initialLoad ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1,2,3,4,5,6].map(i => <Skeleton key={i} h={34} />)}
                </div>
              ) : !topProducts.length ? (
                <div style={{ fontSize: 13, color: C.textHint, textAlign: "center", padding: "40px 0" }}>Aucune donnée</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {topProducts.slice(0, 8).map((p, i) => {
                    const max   = topProducts[0]?.total_quantity ?? 1;
                    const pct   = Math.round((p.total_quantity / max) * 100);
                    const color = COLORS[i % COLORS.length];
                    return (
                      <div key={`panier-${i}`} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                          background: i < 3 ? color : "#f0f0f3",
                          color: i < 3 ? "#fff" : C.textHint,
                          fontSize: 10, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {i + 1}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{
                              fontSize: 12, color: C.textPrimary, fontWeight: 500,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "65%",
                            }}>
                              {p.product_name}
                            </span>
                           
                          </div>
                          <div style={{ height: 5, background: "#f0f0f3", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* PieChart catégories panier */}
            <Card title="Répartition catégories panier">
              {initialLoad ? <Skeleton h={260} /> : byCategory.length ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={byCategory} cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={3} dataKey="quantity"
                      >
                        {byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                     <Tooltip
  contentStyle={tooltipStyle}
  formatter={v => [v, "articles"]}
  cursor={{ fill: "#fff5f0" }}
/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 }}>
                    {byCategory.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textMuted }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        {c.category} ({c.quantity})
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: C.textHint, padding: "60px 0", textAlign: "center" }}>Aucune donnée</div>
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