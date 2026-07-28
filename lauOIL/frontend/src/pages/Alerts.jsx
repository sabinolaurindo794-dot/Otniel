import { useState, useEffect } from "react";
import { alertsAPI } from "../services/api";
import { Card, KPICard, Badge, Btn, Loading, ErrorBox } from "../components/ui";

export default function Alerts() {
  const [alerts,     setAlerts]     = useState([]);
  const [triggered,  setTriggered]  = useState([]);
  const [form,       setForm]       = useState({ name: "", type: "price_above", threshold: 85, email: "gestor@lauoil.ao" });
  const [loading,    setLoading]    = useState(true);
  const [checking,   setChecking]   = useState(false);
  const [msg,        setMsg]        = useState("");
  const [error,      setError]      = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError("");
    try {
      const [l, t] = await Promise.all([
        alertsAPI.list(),
        alertsAPI.triggered(),
      ]);
      setAlerts(l.alerts || []);
      setTriggered(t.triggered || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(""); setMsg("");
    try {
      const res = await alertsAPI.create(form);
      if (res.success) {
        setMsg("Alerta criado com sucesso!");
        setForm({ name: "", type: "price_above", threshold: 85, email: "gestor@lauoil.ao" });
        load();
      }
    } catch (e) { setError(e.message); }
  }

  async function handleDelete(id) {
    try {
      await alertsAPI.delete(id);
      load();
    } catch (e) { setError(e.message); }
  }

  async function handleCheckNow() {
    setChecking(true); setMsg(""); setError("");
    try {
      const res = await alertsAPI.check();
      setMsg(`Verificação concluída. ${res.count} novo(s) alerta(s) disparado(s).`);
      load();
    } catch (e) { setError(e.message); }
    finally { setChecking(false); }
  }

  const TYPE_LABELS = {
    price_above: "Preço Acima de ($)",
    price_below: "Preço Abaixo de ($)",
    volatility:  "Volatilidade Acima de (%)",
  };

  if (loading) return <Loading text="A carregar alertas..." />;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-.03em" }}>Sistema de Alertas Automáticos</h1>
          <p style={{ fontSize:12, color:"#525252", fontFamily:"monospace", marginTop:4 }}>
            MONITORIZAÇÃO CONTINUA DE THRESHOLDS E NOTIFICAÇÃO EM TEMPO REAL
          </p>
        </div>
        <Btn onClick={handleCheckNow} disabled={checking}>
          {checking ? "A verificar..." : "⚡ Testar Regras de Alerta Agora"}
        </Btn>
      </div>

      <ErrorBox msg={error} />

      {msg && (
        <div style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:8, padding:"10px 16px", color:"#22c55e", fontFamily:"monospace", fontSize:12, marginBottom:16 }}>
          ✓ {msg}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        <KPICard label="Alertas Ativos" value={alerts.length} sub="Regras em monitorização" />
        <KPICard label="Disparos Registados" value={triggered.length} sub="Histórico acumulado" />
        <KPICard label="Canal Principal" value="Email / Webhook" sub="gestor@lauoil.ao" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Formulário de Criação */}
        <Card title="Criar Novo Alerta">
          <form onSubmit={handleCreate} style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:11, color:"#a3a3a3", fontFamily:"monospace", marginBottom:4 }}>Nome do Alerta</label>
              <input
                type="text"
                placeholder="Ex: Brent acima de $85"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontSize:13 }}
              />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div>
                <label style={{ display:"block", fontSize:11, color:"#a3a3a3", fontFamily:"monospace", marginBottom:4 }}>Tipo de Condição</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontSize:13 }}
                >
                  <option value="price_above">Preço Acima de ($)</option>
                  <option value="price_below">Preço Abaixo de ($)</option>
                  <option value="volatility">Volatilidade Acima de (%)</option>
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, color:"#a3a3a3", fontFamily:"monospace", marginBottom:4 }}>Limite / Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.threshold}
                  onChange={e => setForm({ ...form, threshold: +e.target.value })}
                  style={{ width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontSize:13 }}
                />
              </div>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, color:"#a3a3a3", fontFamily:"monospace", marginBottom:4 }}>Email para Notificação</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width:"100%", background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"8px 12px", color:"#fff", fontSize:13 }}
              />
            </div>
            <Btn>+ Ativar Regra de Alerta</Btn>
          </form>
        </Card>

        {/* Lista de Alertas Ativos */}
        <Card title="Regras de Alerta Ativas">
          {alerts.length === 0 ? (
            <p style={{ color:"#525252", fontFamily:"monospace", fontSize:12 }}>Nenhum alerta configurado.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {alerts.map(a => (
                <div key={a.id} style={{ background:"#1a1a1a", borderRadius:8, padding:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontWeight:700, fontSize:13, color:"#fff" }}>{a.name}</span>
                      <Badge color="green">Ativo</Badge>
                    </div>
                    <p style={{ fontSize:11, color:"#a3a3a3", fontFamily:"monospace", margin:"4px 0 0" }}>
                      Condição: {TYPE_LABELS[a.type]} {a.threshold} | Email: {a.email}
                    </p>
                  </div>
                  <Btn small variant="red" onClick={() => handleDelete(a.id)}>Remover</Btn>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Histórico de Disparos */}
      <Card title="Histórico de Alertas Disparados">
        {triggered.length === 0 ? (
          <p style={{ color:"#525252", fontFamily:"monospace", fontSize:12 }}>Sem disparos recentes no sistema.</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", textAlign:"left", fontSize:12, fontFamily:"monospace" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #222", color:"#525252" }}>
                  <th style={{ padding:8 }}>ALERTA</th>
                  <th style={{ padding:8 }}>MOTIVO DO DISPARO</th>
                  <th style={{ padding:8 }}>PREÇO BRENT</th>
                  <th style={{ padding:8 }}>DATA / HORA</th>
                </tr>
              </thead>
              <tbody>
                {triggered.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom:"1px solid #1a1a1a", color:"#a3a3a3" }}>
                    <td style={{ padding:8, color:"#fff", fontWeight:700 }}>{t.alert_name}</td>
                    <td style={{ padding:8, color:"#f59e0b" }}>{t.reason}</td>
                    <td style={{ padding:8 }}>${t.price_at}</td>
                    <td style={{ padding:8 }}>{new Date(t.triggered_at).toLocaleString("pt-PT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
