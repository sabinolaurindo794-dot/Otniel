import { useState, useEffect } from "react";
import { marketAPI } from "../services/api";
import { Card, KPICard, TabRow, Loading, ErrorBox } from "../components/ui";
import {
  ResponsiveContainer, ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

export default function Market() {
  const [history,  setHistory]  = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [vol,      setVol]      = useState(null);
  const [opec,     setOpec]     = useState(null);
  const [days,     setDays]     = useState("90");
  const [view,     setView]     = useState("prices");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => { load(); }, [days]);

  async function load() {
    setLoading(true); setError("");
    try {
      const [h, s, v, o] = await Promise.all([
        marketAPI.getHistory(+days),
        marketAPI.getSummary(),
        marketAPI.getVolatility(),
        marketAPI.getOpec(),
      ]);
      setHistory(h.data || []);
      setSummary(s);
      setVol(v);
      setOpec(o);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const RISK_COL = { baixo:"#22c55e", moderado:"#f59e0b", alto:"#ef4444" };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-.03em" }}>Mercado</h1>
        <p style={{ fontSize:12, color:"#525252", fontFamily:"monospace", marginTop:4 }}>HISTÓRICO · COMPARAÇÃO BRENT/WTI · MÉDIAS MÓVEIS · OPEP</p>
      </div>

      <ErrorBox msg={error} />

      {summary && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          <KPICard label="Brent Atual"      value={`$${summary.brent}`}                       sub="USD/barril" large />
          <KPICard label="Variação Diária"  value={`${summary.changes.daily > 0 ? "+" : ""}${summary.changes.daily}%`} colored sub="vs ontem" />
          <KPICard label="Máx 52 semanas"   value={`$${summary["52w_high"]}`}                 sub="USD/barril" />
          <KPICard label="Mín 52 semanas"   value={`$${summary["52w_low"]}`}                  sub="USD/barril" />
        </div>
      )}

      {/* Seletor de dias */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <TabRow
          tabs={[
            { key:"30",  label:"30 dias"  },
            { key:"90",  label:"90 dias"  },
            { key:"180", label:"6 meses"  },
            { key:"365", label:"1 ano"    },
          ]}
          active={days}
          onChange={d => setDays(d)}
        />
        <TabRow
          tabs={[
            { key:"prices", label:"Preços"        },
            { key:"ma",     label:"Médias Móveis" },
            { key:"volume", label:"Volume"        },
          ]}
          active={view}
          onChange={setView}
        />
      </div>

      {loading ? <Loading /> : (
        <>
          {/* Gráfico principal */}
          <Card title={view === "prices" ? "Brent vs WTI" : view === "ma" ? "Médias Móveis (MA7, MA20, MA50)" : "Volume de Transações"}>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={history} margin={{ top:4, right:16, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="date" tick={{ fontSize:10, fill:"#525252" }} interval={Math.ceil(history.length / 7)} />
                <YAxis yAxisId="left"  tick={{ fontSize:10, fill:"#525252" }} domain={["auto","auto"]} />
                {view === "volume" && <YAxis yAxisId="right" orientation="right" tick={{ fontSize:10, fill:"#525252" }} />}
                <Tooltip contentStyle={{ background:"#111", border:"1px solid #333", borderRadius:8, fontSize:11 }} />
                <Legend wrapperStyle={{ fontSize:11 }} />

                {view === "prices" && <>
                  <Line yAxisId="left" type="monotone" dataKey="brent" stroke="#f59e0b" strokeWidth={2} dot={false} name="Brent" />
                  <Line yAxisId="left" type="monotone" dataKey="wti"   stroke="#3b82f6" strokeWidth={2} dot={false} name="WTI"   />
                </>}

                {view === "ma" && <>
                  <Line yAxisId="left" type="monotone" dataKey="brent" stroke="#525252" strokeWidth={1} dot={false} name="Brent"  strokeDasharray="4 3" />
                  <Line yAxisId="left" type="monotone" dataKey="ma7"   stroke="#f59e0b" strokeWidth={2} dot={false} name="MA7"   />
                  <Line yAxisId="left" type="monotone" dataKey="ma20"  stroke="#22c55e" strokeWidth={2} dot={false} name="MA20"  />
                  <Line yAxisId="left" type="monotone" dataKey="ma50"  stroke="#3b82f6" strokeWidth={2} dot={false} name="MA50"  />
                </>}

                {view === "volume" && <>
                  <Line yAxisId="left"  type="monotone" dataKey="brent"  stroke="#f59e0b" strokeWidth={2} dot={false} name="Brent" />
                  <Bar  yAxisId="right" dataKey="volume" fill="rgba(245,158,11,.15)" name="Volume" />
                </>}
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Volatilidade */}
            {vol && (
              <Card title="Volatilidade e Risco">
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1a1a1a" }}>
                    <span style={{ fontSize:12, color:"#a3a3a3" }}>Volatilidade 30 dias</span>
                    <span style={{ fontFamily:"monospace", fontSize:13, color:"#fbbf24", fontWeight:500 }}>{vol.historical_vol_30d}%</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1a1a1a" }}>
                    <span style={{ fontSize:12, color:"#a3a3a3" }}>Volatilidade 90 dias</span>
                    <span style={{ fontFamily:"monospace", fontSize:13, color:"#fbbf24", fontWeight:500 }}>{vol.historical_vol_90d}%</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1a1a1a" }}>
                    <span style={{ fontSize:12, color:"#a3a3a3" }}>Variação média diária</span>
                    <span style={{ fontFamily:"monospace", fontSize:13, color:"#fbbf24", fontWeight:500 }}>{vol.avg_daily_change}%</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0" }}>
                    <span style={{ fontSize:12, color:"#a3a3a3" }}>Nível de risco</span>
                    <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color: RISK_COL[vol.risk_level] || "#f59e0b", textTransform:"uppercase" }}>
                      {vol.risk_level}
                    </span>
                  </div>
                  {/* Barra de risco */}
                  <div style={{ marginTop:8 }}>
                    <div style={{ fontSize:10, color:"#525252", fontFamily:"monospace", marginBottom:6 }}>ÍNDICE DE RISCO</div>
                    <div style={{ height:6, background:"#222", borderRadius:3 }}>
                      <div style={{ height:"100%", width:`${vol.risk_score * 100}%`, background: RISK_COL[vol.risk_level], borderRadius:3, transition:"width .6s" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:10, color:"#525252", fontFamily:"monospace" }}>
                      <span>Baixo</span><span>Moderado</span><span>Alto</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* OPEP */}
            {opec && (
              <Card title="Dados OPEP">
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1a1a1a" }}>
                    <span style={{ fontSize:12, color:"#a3a3a3" }}>Produção total</span>
                    <span style={{ fontFamily:"monospace", fontSize:13, color:"#fbbf24" }}>{opec.total_production_mbpd} Mbpd</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1a1a1a" }}>
                    <span style={{ fontSize:12, color:"#a3a3a3" }}>Conformidade de quotas</span>
                    <span style={{ fontFamily:"monospace", fontSize:13, color:"#22c55e" }}>{opec.quota_compliance_pct}%</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1a1a1a" }}>
                    <span style={{ fontSize:12, color:"#a3a3a3" }}>Corte actual</span>
                    <span style={{ fontFamily:"monospace", fontSize:13, color:"#ef4444" }}>{opec.current_cut_mbpd} Mbpd</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #1a1a1a" }}>
                    <span style={{ fontSize:12, color:"#a3a3a3" }}>Última reunião</span>
                    <span style={{ fontFamily:"monospace", fontSize:12, color:"#a3a3a3" }}>{opec.last_meeting}</span>
                  </div>
                  <div style={{ fontSize:11, color:"#525252", fontFamily:"monospace", marginTop:8 }}>MAIORES PRODUTORES</div>
                  {opec.top_producers.map((p, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, color:"#a3a3a3", minWidth:130 }}>{p.country}</span>
                      <div style={{ flex:1, height:3, background:"#222", borderRadius:2 }}>
                        <div style={{ height:"100%", width:`${(p.production / 10) * 100}%`, background:"#f59e0b", borderRadius:2 }} />
                      </div>
                      <span style={{ fontFamily:"monospace", fontSize:11, color:"#525252" }}>{p.production}M</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
