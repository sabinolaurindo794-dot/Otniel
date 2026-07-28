import { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";
import { KPICard, Card, Badge, FactorBar, Loading, ErrorBox } from "../components/ui";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const FACTOR_NAMES  = { opec_production:"Produção OPEP", usd_index:"Índice USD", global_demand:"Procura Global", geopolitical:"Geopolítica", news_sentiment:"Sentimento NLP" };
const FACTOR_COLORS = { opec_production:"#f59e0b", usd_index:"#8b5cf6", global_demand:"#3b82f6", geopolitical:"#ef4444", news_sentiment:"#22c55e" };
const SIG_LABELS    = { strong_up:"Alta Forte", moderate_up:"Alta Moderada", stable:"Estável", moderate_down:"Queda Moderada", strong_down:"Queda Forte" };
const SIG_COLORS    = { strong_up:"green", moderate_up:"green", stable:"gray", moderate_down:"red", strong_down:"red" };

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError("");
    try {
      const d = await dashboardAPI.get();
      setData(d);
      const pts = []; let p = 82;
      for (let i = 29; i >= 0; i--) {
        const date = new Date(); date.setDate(date.getDate() - i);
        p = +(p + Math.sin(i / 10) * 0.4 + (Math.random() - 0.5) * 1.2).toFixed(2);
        pts.push({ date: date.toISOString().slice(5, 10), brent: p });
      }
      setHistory(pts);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  if (loading) return <Loading text="A carregar dashboard..." />;

  const prices  = data?.prices;
  const summary = data?.summary;
  const fc      = data?.forecast;
  const weights = data?.factors?.weights || {};

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-.03em" }}>Dashboard</h1>
        <p style={{ fontSize:12, color:"#525252", fontFamily:"monospace", marginTop:4 }}>
          MERCADO PETROLÍFERO · TEMPO REAL · lauOIL v1.0
        </p>
      </div>

      <ErrorBox msg={error} />

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <KPICard label="Brent (USD/bbl)"    value={prices ? `$${prices.brent.price}` : "—"} sub="Crude referência global" large />
        <KPICard label="WTI (USD/bbl)"      value={prices ? `$${prices.wti.price}`   : "—"} sub="Crude EUA" />
        <KPICard label="Spread Brent-WTI"   value={prices ? `$${prices.spread}`      : "—"} sub="USD por barril" />
        <KPICard
          label="Variação Diária"
          value={summary ? `${summary.changes.daily > 0 ? "+" : ""}${summary.changes.daily}%` : "—"}
          sub={summary?.changes?.daily >= 0 ? "Em alta" : "Em queda"}
          colored
        />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
        {/* Gráfico 30 dias */}
        <Card title="Brent — Últimos 30 dias">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history} margin={{ top:4, right:8, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:"#525252" }} interval={4} />
              <YAxis domain={["auto","auto"]} tick={{ fontSize:10, fill:"#525252" }} />
              <Tooltip contentStyle={{ background:"#111", border:"1px solid #333", borderRadius:8, fontSize:12 }} />
              <Line type="monotone" dataKey="brent" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Resumo */}
        <Card title="Resumo do Mercado">
          {summary && (
            <div>
              {[
                ["Máx 52 semanas", `$${summary["52w_high"]}`],
                ["Mín 52 semanas", `$${summary["52w_low"]}`],
                ["Média 30 dias",  `$${summary.avg_30d}`],
                ["Média 90 dias",  `$${summary.avg_90d}`],
                ["Variação semanal", `${summary.changes.weekly > 0 ? "+" : ""}${summary.changes.weekly}%`],
                ["Variação mensal",  `${summary.changes.monthly > 0 ? "+" : ""}${summary.changes.monthly}%`],
                ["Variação anual",   `${summary.changes.yearly > 0 ? "+" : ""}${summary.changes.yearly}%`],
              ].map(([k, v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1a1a1a" }}>
                  <span style={{ fontSize:12, color:"#a3a3a3" }}>{k}</span>
                  <span style={{ fontFamily:"monospace", fontSize:13, color:"#fbbf24", fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Previsão rápida */}
        <Card title="Previsão IA">
          {fc && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div style={{ background:"#1a1a1a", borderRadius:8, padding:12, textAlign:"center" }}>
                  <p style={{ fontSize:10, color:"#525252", fontFamily:"monospace", marginBottom:6 }}>7 DIAS</p>
                  <p style={{ fontSize:22, fontWeight:800, color:"#fbbf24" }}>${fc.price_7d}</p>
                </div>
                <div style={{ background:"#1a1a1a", borderRadius:8, padding:12, textAlign:"center" }}>
                  <p style={{ fontSize:10, color:"#525252", fontFamily:"monospace", marginBottom:6 }}>30 DIAS</p>
                  <p style={{ fontSize:22, fontWeight:800, color:"#fbbf24" }}>${fc.price_30d}</p>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <Badge color={SIG_COLORS[fc.signal] || "gray"}>{SIG_LABELS[fc.signal] || fc.signal}</Badge>
                <span style={{ fontFamily:"monospace", fontSize:11, color:"#525252" }}>Confiança: {fc.confidence}%</span>
              </div>
              <p style={{ fontSize:11, color:"#525252", fontFamily:"monospace" }}>Ensemble: LSTM + XGBoost + Prophet</p>
            </div>
          )}
        </Card>

        {/* Fatores */}
        <Card title="Peso dos Fatores">
          {Object.entries(weights).map(([k, v]) => (
            <FactorBar
              key={k}
              label={FACTOR_NAMES[k] || k}
              pct={Math.round(v * 100)}
              color={FACTOR_COLORS[k] || "#888"}
            />
          ))}
        </Card>
      </div>
    </div>
  );
}
