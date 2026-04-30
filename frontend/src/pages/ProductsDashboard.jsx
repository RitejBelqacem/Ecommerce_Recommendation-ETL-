import { useState, useEffect } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
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
  accent:      "#D97706",
};

const CAT_COLORS = ["#D97706","#573ff5","#059669","#DC2626","#0891b2","#7c3aed","#be185d","#0f766e"];

const SOURCE_COLORS = {
  recommendation: "#573ff5",
  home:           "#D97706",
  search:         "#059669",
  category:       "#0891b2",
};

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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tooltipStyle, padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb" }}>
          {p.name} : {typeof p.value === "number"
            ? p.value.toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : p.value}
        </div>
      ))}
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
        : <div style={{ fontSize: 26, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{value ?? "—"}</div>
      }
      <div style={{ fontSize: 12, color: C.textHint, marginTop: 6 }}>
        {skeleton ? <Skeleton h={12} w={80} /> : sub}
      </div>
    </div>
  );
}

// ── Barres catégories ────────────────────────────────────────────
function CategoryBars({ data }) {
  if (!data?.length) return <div style={{ fontSize: 13, color: C.textHint }}>Aucune donnée</div>;
  const max = Math.max(...data.map(r => r.count));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((r, i) => {
        const pct = max > 0 ? Math.round((r.count / max) * 100) : 0;
        return (
          <div key={r.category} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 12, color: C.textMuted, width: 90, flexShrink: 0,
              textAlign: "right", textTransform: "capitalize", fontWeight: 500,
            }}>
              {r.category}
            </span>
            <div style={{ flex: 1, height: 8, background: "#f0f0f3", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: CAT_COLORS[i % CAT_COLORS.length],
                borderRadius: 4, transition: "width 0.7s ease",
              }} />
            </div>
            <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: 600, width: 28, textAlign: "right" }}>
              {r.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Tableau top remises ──────────────────────────────────────────
function DiscountTable({ data }) {
  if (!data?.length) return <div style={{ fontSize: 13, color: C.textHint }}>Aucune donnée</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 70px",
        padding: "6px 8px", fontSize: 10, fontWeight: 700,
        color: C.textHint, letterSpacing: "0.06em",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span>PRODUIT</span>
        <span style={{ textAlign: "center" }}>CATÉGORIE</span>
        <span style={{ textAlign: "right" }}>PRIX</span>
        <span style={{ textAlign: "right" }}>AVANT</span>
        <span style={{ textAlign: "right" }}>REMISE</span>
      </div>
      {data.map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 70px",
          padding: "9px 8px", fontSize: 12,
          borderBottom: `1px solid ${C.border}`,
          background: i % 2 === 0 ? "transparent" : "#fafafa",
          alignItems: "center",
        }}>
          <span style={{
            color: C.textPrimary, fontWeight: 500,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {r.name}
          </span>
          <span style={{ textAlign: "center" }}>
            <span style={{
              fontSize: 10, background: C.accent + "18", color: C.accent,
              borderRadius: 4, padding: "2px 7px", fontWeight: 600,
              textTransform: "capitalize",
            }}>
              {r.category}
            </span>
          </span>
          <span style={{ textAlign: "right", color: C.textPrimary, fontWeight: 600 }}>
            {Number(r.price).toFixed(2)} DT
          </span>
          <span style={{ textAlign: "right", color: C.textMuted, textDecoration: "line-through" }}>
            {Number(r.old_price).toFixed(2)} DT
          </span>
          <span style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
            -{Number(r.discount).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── TOP 10 PRODUITS LES PLUS CONSULTÉS ──────────────────────────
function TopViewedTable({ data, skeleton }) {
  if (skeleton) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...Array(5)].map((_, i) => <Skeleton key={i} h={40} />)}
      </div>
    );
  }
  if (!data?.length) return (
    <div style={{ fontSize: 13, color: C.textHint, padding: "40px 0", textAlign: "center" }}>
      Aucune donnée — lancez l'ETL pour charger les vues
    </div>
  );

  const maxViews = Math.max(...data.map(r => r.views));

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "28px 1fr 100px 180px 70px",
        padding: "6px 8px", fontSize: 10, fontWeight: 700,
        color: C.textHint, letterSpacing: "0.06em",
        borderBottom: `1px solid ${C.border}`, gap: 8,
      }}>
        <span>#</span>
        <span>PRODUIT</span>
        <span style={{ textAlign: "center" }}>CATÉGORIE</span>
        <span style={{ textAlign: "center" }}>CONSULTATIONS</span>
        <span style={{ textAlign: "right" }}>VUES</span>
      </div>

      {data.map((r, i) => {
        const pct  = maxViews > 0 ? Math.round((r.views / maxViews) * 100) : 0;
        const color = CAT_COLORS[
          ["Beauty","Electronics","Sports","Clothing","Home"].indexOf(r.category) % CAT_COLORS.length
        ] || CAT_COLORS[i % CAT_COLORS.length];

        return (
          <div key={r.product_id} style={{
            display: "grid",
            gridTemplateColumns: "28px 1fr 100px 180px 70px",
            padding: "10px 8px", gap: 8,
            borderBottom: `1px solid ${C.border}`,
            background: i % 2 === 0 ? "transparent" : "#fafafa",
            alignItems: "center",
            transition: "background .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff8ed"}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#fafafa"}
          >
            {/* Rang */}
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: i < 3 ? C.accent : C.textHint,
            }}>
              {i + 1}
            </span>

            {/* Nom produit */}
            <span style={{
              fontSize: 13, fontWeight: 500, color: C.textPrimary,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {r.product_name}
            </span>

            {/* Catégorie badge */}
            <span style={{ textAlign: "center" }}>
              <span style={{
                fontSize: 10, borderRadius: 4, padding: "2px 7px",
                fontWeight: 600, textTransform: "capitalize",
                background: color + "18", color: color,
              }}>
                {r.category}
              </span>
            </span>

            {/* Barre de progression */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                flex: 1, height: 6, background: "#f0f0f3",
                borderRadius: 3, overflow: "hidden",
              }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: color, borderRadius: 3,
                  transition: "width 0.7s ease",
                }} />
              </div>
            </div>

            {/* Nombre de vues */}
            <span style={{
              textAlign: "right", fontWeight: 700,
              fontSize: 13, color: C.textPrimary,
            }}>
              {r.views.toLocaleString("fr-FR")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Vues par source ──────────────────────────────────────────────
function SourceBars({ data }) {
  if (!data?.length) return null;
  const total = data.reduce((s, r) => s + r.views, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((r, i) => {
        const pct  = total > 0 ? Math.round((r.views / total) * 100) : 0;
        const color = SOURCE_COLORS[r.source] || CAT_COLORS[i % CAT_COLORS.length];
        return (
          <div key={r.source} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 12, color: C.textMuted, width: 110, flexShrink: 0,
              textAlign: "right", textTransform: "capitalize", fontWeight: 500,
            }}>
              {r.source}
            </span>
            <div style={{ flex: 1, height: 8, background: "#f0f0f3", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: color, borderRadius: 4,
                transition: "width 0.7s ease",
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, width: 50, textAlign: "right" }}>
              {r.views} <span style={{ fontWeight: 400, color: C.textHint }}>({pct}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────
export default function ProductsDashboard() {
  const [data,        setData]        = useState(null);
  const [viewsData,   setViewsData]   = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error,       setError]       = useState(null);

  const loadData = async () => {
    try {
      const [resProducts, resViews] = await Promise.all([
        fetch(`${API}/etl_output/kpis_products.json`),
        fetch(`${API}/api/kpis/views`).catch(() => null),  // ✅ temps réel
      ]);
      if (!resProducts.ok) throw new Error(`HTTP ${resProducts.status}`);
      setData(await resProducts.json());

      if (resViews && resViews.ok) {
        setViewsData(await resViews.json());
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données produits.");
    }
  };

  useEffect(() => {
    loadData().finally(() => setInitialLoad(false));

    const interval = setInterval(() => {
      fetch(`${API}/api/kpis/views`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setViewsData(d); })
        .catch(console.error);
    }, 30_000);

    return () => clearInterval(interval);
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

  const timeLabel    = lastUpdated?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const categoryData = data?.by_category      ?? [];
  const priceData    = data?.price_by_category ?? [];
  const discountData = data?.top_discounted    ?? [];
  const topViewed    = viewsData?.top_products ?? [];
  const bySource     = viewsData?.by_source    ?? [];
  const totalViews   = viewsData?.total_views  ?? 0;

  // Fusion catégories + prix pour BarChart groupé
  const mergedCatData = categoryData.map(c => {
    const match = priceData.find(p => p.category === c.category);
    return { category: c.category, count: c.count, avg_price: match?.avg_price ?? 0 };
  });

  const kpiCards = [
    {
      label: "TOTAL PRODUITS",
      value: data?.total_products != null ? Number(data.total_products).toLocaleString("fr-FR") : "—",
      sub: `${data?.available ?? 0} disponibles`,
      accent: C.accent, iconBg: "#FFFBEB", iconColor: "#92400E",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M14 11V5a1 1 0 0 0-.5-.87L8.5 1.13a1 1 0 0 0-1 0L3.5 4.13A1 1 0 0 0 3 5v6a1 1 0 0 0 .5.87l4 2.27a1 1 0 0 0 1 0l4-2.27A1 1 0 0 0 14 11z"/>
        </svg>
      ),
    },
    {
      label: "PRIX MOYEN",
      value: data?.avg_price != null ? `${Number(data.avg_price).toFixed(2)} DT` : "—",
      sub: `remise moy. ${data?.avg_discount != null ? Number(data.avg_discount).toFixed(2) : "—"} DT`,
      accent: "#573ff5", iconBg: "#EEEDFE", iconColor: "#534AB7",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="8" y1="1" x2="8" y2="15"/>
          <path d="M11 4H6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H4"/>
        </svg>
      ),
    },
    {
      label: "RUPTURES DE STOCK",
      value: data?.out_of_stock != null ? Number(data.out_of_stock).toLocaleString("fr-FR") : "—",
      sub: "produits avec stock = 0",
      accent: "#DC2626", iconBg: "#FEF2F2", iconColor: "#991B1B",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="7"/>
          <line x1="8" y1="5" x2="8" y2="9"/>
          <circle cx="8" cy="11.5" r="0.5" fill="currentColor"/>
        </svg>
      ),
    },
    {
      label: "MIS EN AVANT",
      value: data?.featured != null ? Number(data.featured).toLocaleString("fr-FR") : "—",
      sub: "produits featured",
      accent: "#059669", iconBg: "#ECFDF5", iconColor: "#065F46",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6"/>
        </svg>
      ),
    },
    {
      label: "TOTAL CONSULTATIONS",
      value: totalViews > 0 ? totalViews.toLocaleString("fr-FR") : "—",
      sub: `${viewsData?.unique_products ?? 0} produits distincts vus`,
      accent: "#0891b2", iconBg: "#E0F2FE", iconColor: "#0c4a6e",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/>
          <circle cx="8" cy="8" r="2"/>
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
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>Produits</div>
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
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#fff8ed"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
          >
            <svg
              style={{ width: 13, height: 13, animation: loading ? "spin 1s linear infinite" : "none" }}
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
            >
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
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12, marginBottom: 24,
          }}>
            {kpiCards.map((k, i) => (
              <KpiCard key={i} {...k} skeleton={initialLoad} />
            ))}
          </div>

          {/* ── TOP 10 PRODUITS CONSULTÉS ── */}
          <SectionLabel>PRODUITS LES PLUS CONSULTÉS</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 24 }}>

            {/* Tableau top 10 */}
            <Card title="Top 10 — produits les plus vus">
              <TopViewedTable data={topViewed} skeleton={initialLoad} />
            </Card>

            {/* Panneau latéral : KPIs views + par source */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Mini KPIs consultations */}
              <Card>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Total consultations", value: totalViews.toLocaleString("fr-FR"), color: "#0891b2" },
                    { label: "Produits distincts vus", value: (viewsData?.unique_products ?? 0).toLocaleString("fr-FR"), color: "#573ff5" },
                    { label: "Visiteurs uniques", value: (viewsData?.unique_visitors ?? 0).toLocaleString("fr-FR"), color: "#059669" },
                    { label: "Moy. vues / produit", value: viewsData?.avg_views_per_product ?? "—", color: C.accent },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      paddingBottom: 10, borderBottom: `1px solid ${C.border}`,
                    }}>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{item.label}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>
                        {initialLoad ? <Skeleton w={40} h={14} /> : item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Vues par source */}
              <Card title="Par source de trafic">
                {initialLoad
                  ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[1,2,3,4].map(i => <Skeleton key={i} h={12} />)}
                    </div>
                  : <SourceBars data={bySource} />
                }
              </Card>
            </div>
          </div>

          {/* ── CATALOGUE ── */}
          <SectionLabel>CATALOGUE</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            <Card title="Produits par catégorie">
              {initialLoad
                ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1,2,3,4,5].map(i => <Skeleton key={i} h={14} />)}
                  </div>
                : <CategoryBars data={categoryData} />
              }
            </Card>

            <Card title="Répartition — camembert">
              {initialLoad ? <Skeleton h={220} /> : categoryData.length ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={categoryData} cx="50%" cy="50%"
                        innerRadius={45} outerRadius={75}
                        paddingAngle={3} dataKey="count"
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v, n, p) => [v, p.payload.category]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 }}>
                    {categoryData.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textMuted }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0 }} />
                        {c.category}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: C.textHint, padding: "60px 0", textAlign: "center" }}>
                  Aucune donnée
                </div>
              )}
            </Card>
          </div>

          {/* Prix par catégorie */}
          <SectionLabel>PRIX</SectionLabel>
          <div style={{ marginBottom: 16 }}>
            <Card title="Prix moyen par catégorie">
              {initialLoad ? <Skeleton h={220} /> : mergedCatData.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mergedCatData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#f0f0f3" vertical={false} />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: C.textHint, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.textHint, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => `${v} DT`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="avg_price" name="Prix moy." radius={[4,4,0,0]} maxBarSize={48}>
                      {mergedCatData.map((_, i) => (
                        <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ fontSize: 13, color: C.textHint, padding: "60px 0", textAlign: "center" }}>
                  Aucune donnée prix
                </div>
              )}
            </Card>
          </div>

          {/* Top remises */}
          <SectionLabel>TOP REMISES</SectionLabel>
          <Card title="Produits les plus remisés">
            {initialLoad
              ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1,2,3,4,5].map(i => <Skeleton key={i} h={36} />)}
                </div>
              : <DiscountTable data={discountData} />
            }
          </Card>

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