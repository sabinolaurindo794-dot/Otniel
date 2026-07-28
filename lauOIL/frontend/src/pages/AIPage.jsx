import { useState, useEffect } from "react";
import { aiAPI } from "../services/api";
import { Card, KPICard, Badge, TabRow, Btn, Loading, ErrorBox } from "../components/ui";
import {
  ResponsiveContainer, AreaChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

export default function AIPage() {
  const [horizon,     setHorizon]     = useState("30");
  const [forecast,    setForecast]    = useState(null);
  const [prob,        setProb]        = useState(null);
  const [patterns,    setPatterns]    = useState([]);
  const [simInputs,   setSimInputs]   = useState({ opec_cut: 2, usd_change: 0, geo_risk: 5, demand_chg: 1 });
  const [simResult,   setSimResult]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [simLoading,  setSimLoading]  = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => { load(); }, [horizon]);

  async function load() {
    setLoading(true); setError("");
    try {
      const [fc, pr, pt] = await Promise.all([
        aiAPI.getForecast(+horizon),
        aiAPI.getProbability(),
        aiAPI.getPatterns(),
      ]);
      setForecast(fc);
      setProb(pr);
      setPatterns(pt.patterns || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleSimulate(e) {
    e?.preventDefault();
    setSimLoading(true);
    try {
      const res = await aiAPI.simulate(simInputs);
      setSimResult(res);
    } catch (e) { setError(e.message); }
    finally { setSimLoading(false); }
  }

  if (loading) return <Loading text="A carregar dados de IA..." />;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-.03em" }}>IA & Previsão Ensemble</h1>
        <p style={{ fontSize:12, color:"#525252", fontFamily:"monospace", marginTop:4 }}>
          MODELOS PROPRIETÁRIOS: LSTM · XGBOOST · PROPHET · MONTE CARLO
        </p>
      </div>

      <ErrorBox msg={error} />

      {forecast && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          <KPICard label="Preço Base" value={`$${forecast.base_price}`} sub="Brent Atual" />
          <KPICard label={`Previsão ${forecast.horizon_days}D`} value={`$${forecast.predicted_price}`} sub={`Var: ${forecast.change_pct}%`} large />
          <KPICard label="Confiança Modelo" value={`${forecast.confidence}%`} sub="Backtested" />
          <KPICard label="Sinal de Mercado" value={forecast.signal.replace("_", " ").toUpperCase()} colored sub="Ensemble Decision" />
        </div>
      )}

      {/* Seletor de Horizonte */}
      <TabRow
        tabs={[
          { key:"7",   label:"7 dias"   },
          { key:"30",  label:"30 dias"  },
          { key:"90",  label:"90 dias"  },
          { key:"180", label:"180 dias" },
        ]}
        active={horizon}
        onChange={setHorizon}
      />

      {/* Gráfico Ensemble */}
      {forecast && (
        <Card title={`Previsão Multimodelo (${forecast.horizon_days} dias)`}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecast.series} margin={{ top:8, right:16, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:"#525252" }} interval={Math.ceil(forecast.series.length / 8)} />
              <YAxis domain={["auto","auto"]} tick={{ fontSize:10, fill:"#525252" }} />
              <Tooltip contentStyle={{ background:"#111", border:"1px solid #333", borderRadius:8, fontSize:11 }} />
              <Legend wrapperStyle={{ fontSize:11 }} />

              <Area type="monotone" dataKey="upper_band" stroke="none" fill="rgba(245,158,11,0.1)" name="Banda Sup" />
              <Area type="monotone" dataKey="lower_band" stroke="none" fill="rgba(245,158,11,0.1)" name="Banda Inf" />
              <Line type="monotone" dataKey="ensemble"   stroke="#f59e0b" strokeWidth={3} dot={false} name="Ensemble Final" />
              <Line type="monotone" dataKey="lstm"       stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="LSTM" />
              <Line type="monotone" dataKey="xgboost"    stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="XGBoost" />
              <Line type="monotone" dataKey="prophet"    stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Prophet" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Probabilidades Monte Carlo */}
        {prob && (
          <Card title="Probabilidade de Movimento (Random Forest)">
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {["24h", "7d", "30d"].map(t => (
                <div key={t}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:12 }}>
                    <span style={{ color:"#a3a3a3", fontFamily:"monospace" }}>Prazo: {t}</span>
                    <span style={{ color:"#22c55e", fontFamily:"monospace", fontWeight:700 }}>Subida: {prob[t]?.up}%</span>
                    <span style={{ color:"#ef4444", fontFamily:"monospace", fontWeight:700 }}>Queda: {prob[t]?.down}%</span>
                  </div>
                  <div style={{ height:6, background:"#ef4444", borderRadius:3, overflow:"hidden", display:"flex" }}>
                    <div style={{ width:`${prob[t]?.up}%`, background:"#22c55e", height:"100%" }} />
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#525252", fontFamily:"monospace", marginTop:8 }}>
                <span>Modelo: {prob.model}</span>
                <span>Acurácia: {prob.accuracy_backtest}%</span>
              </div>
            </div>
          </Card>
        )}

        {/* Padrões Identificados */}
        <Card title="Padrões Detetados por IA">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {patterns.map((p, idx) => (
              <div key={idx} style={{ background:"#1a1a1a", borderRadius:8, padding:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:"#f5f5f5" }}>{p.name}</span>
                  <Badge color={p.strength === "alta" ? "amber" : "gray"}>Força {p.strength}</Badge>
                </div>
                <p style={{ fontSize:11, color:"#a3a3a3", margin:"4px 0" }}>{p.description}</p>
                <div style={{ fontSize:10, color:"#525252", fontFamily:"monospace" }}>Confiança do Padrão: {p.confidence}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Simulação de Cenários What-If */}
      <Card title="Simulador de Cenários Geopolíticos & Económicos (What-If)">
        <form onSubmit={handleSimulate} style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:16 }}>
          <div>
            <label style={{ display:"block", fontSize:11, color:"#a3a3a3", fontFamily:"monospace", marginBottom:6 }}>Corte OPEP (Mbpd)</label>
            <input
              type="number"
              step="0.5"
              value={simInputs.opec_cut}
              onChange={e => setSimInputs({ ...simInputs, opec_cut: +e.target.value })}
              style={{ width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontSize:13 }}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, color:"#a3a3a3", fontFamily:"monospace", marginBottom:6 }}>Variação USD Index (%)</label>
            <input
              type="number"
              step="0.5"
              value={simInputs.usd_change}
              onChange={e => setSimInputs({ ...simInputs, usd_change: +e.target.value })}
              style={{ width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontSize:13 }}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, color:"#a3a3a3", fontFamily:"monospace", marginBottom:6 }}>Risco Geopolítico (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={simInputs.geo_risk}
              onChange={e => setSimInputs({ ...simInputs, geo_risk: +e.target.value })}
              style={{ width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontSize:13 }}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, color:"#a3a3a3", fontFamily:"monospace", marginBottom:6 }}>Variação Procura (%)</label>
            <input
              type="number"
              step="0.5"
              value={simInputs.demand_chg}
              onChange={e => setSimInputs({ ...simInputs, demand_chg: +e.target.value })}
              style={{ width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontSize:13 }}
            />
          </div>
          <div style={{ gridColumn:"1/-1", display:"flex", justifyContent:"flex-end" }}>
            <Btn disabled={simLoading}>{simLoading ? "A simular..." : "Executar Simulação IA"}</Btn>
          </div>
        </form>

        {simResult && (
          <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, padding:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:12 }}>
              <div>
                <span style={{ fontSize:10, color:"#525252", fontFamily:"monospace" }}>PREÇO SIMULADO</span>
                <p style={{ fontSize:22, fontWeight:800, color:"#fbbf24" }}>${simResult.simulated_price}</p>
              </div>
              <div>
                <span style={{ fontSize:10, color:"#525252", fontFamily:"monospace" }}>VARIAÇÃO ESTIMADA</span>
                <p style={{ fontSize:22, fontWeight:800, color: simResult.change_pct >= 0 ? "#22c55e" : "#ef4444" }}>
                  {simResult.change_pct >= 0 ? "+" : ""}{simResult.change_pct}%
                </p>
              </div>
              <div>
                <span style={{ fontSize:10, color:"#525252", fontFamily:"monospace" }}>INTERVALO DE CONFIANÇA</span>
                <p style={{ fontSize:14, fontWeight:700, color:"#f5f5f5", marginTop:4 }}>${simResult.lower_band} – ${simResult.upper_band}</p>
              </div>
              <div>
                <span style={{ fontSize:10, color:"#525252", fontFamily:"monospace" }}>CONFIANÇA</span>
                <p style={{ fontSize:14, fontWeight:700, color:"#f5f5f5", marginTop:4 }}>{simResult.confidence}%</p>
              </div>
            </div>
            <p style={{ fontSize:12, color:"#a3a3a3", fontFamily:"monospace", borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:10, margin:0 }}>
              💡 <b>Análise Narrativa IA:</b> {simResult.narrative}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
