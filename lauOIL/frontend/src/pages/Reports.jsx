import { useState, useEffect } from "react";
import { reportsAPI } from "../services/api";
import { Card, KPICard, Btn, Loading, ErrorBox } from "../components/ui";

export default function Reports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await reportsAPI.getSummary();
      setData(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function downloadFile(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (loading) return <Loading text="A preparar relatório executivo..." />;

  const prices   = data?.prices;
  const summary  = data?.summary;
  const forecast = data?.forecast;
  const sent     = data?.sentiment;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-.03em" }}>Módulo de Relatórios Executivos</h1>
          <p style={{ fontSize:12, color:"#525252", fontFamily:"monospace", marginTop:4 }}>
            EXPORTAÇÃO AUTOMÁTICA EM PDF E EXCEL COM DADOS DE IA E ANÁLISE DE MERCADO
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn onClick={() => downloadFile(reportsAPI.pdfUrl(), "lauOIL_relatorio.pdf")}>
            📄 Descarregar PDF
          </Btn>
          <Btn variant="dark" onClick={() => downloadFile(reportsAPI.excelUrl(), "lauOIL_relatorio.xlsx")}>
            📊 Exportar Excel (.xlsx)
          </Btn>
        </div>
      </div>

      <ErrorBox msg={error} />

      {data && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
            <KPICard label="Gerado em" value={new Date(data.generated_at).toLocaleTimeString("pt-PT")} sub={new Date(data.generated_at).toLocaleDateString("pt-PT")} />
            <KPICard label="Brent Atual" value={`$${prices?.brent?.price}`} sub="Crude de Referência" />
            <KPICard label="Previsão 30D" value={`$${forecast?.price_30d}`} sub={`Sinal: ${forecast?.signal}`} />
            <KPICard label="Sentimento NLP" value={`${sent?.score}`} sub={sent?.label?.toUpperCase()} colored={sent?.score >= 0} />
          </div>

          <Card title="Pré-visualização do Relatório Estruturado">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Tabela de Preços */}
              <div>
                <h3 style={{ fontSize:13, fontWeight:700, color:"#f59e0b", marginBottom:12, fontFamily:"monospace" }}>
                  1. PREÇOS ATUAIS E COOTAÇÕES
                </h3>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:"monospace" }}>
                  <thead>
                    <tr style={{ background:"#1a1a1a", color:"#a3a3a3", textAlign:"left" }}>
                      <th style={{ padding:8 }}>COMMODITY</th>
                      <th style={{ padding:8 }}>PREÇO</th>
                      <th style={{ padding:8 }}>MOEDA</th>
                      <th style={{ padding:8 }}>UNIDADE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom:"1px solid #1a1a1a" }}>
                      <td style={{ padding:8 }}>Brent Crude</td>
                      <td style={{ padding:8, color:"#fbbf24" }}>${prices?.brent?.price}</td>
                      <td style={{ padding:8 }}>USD</td>
                      <td style={{ padding:8 }}>barril</td>
                    </tr>
                    <tr style={{ borderBottom:"1px solid #1a1a1a" }}>
                      <td style={{ padding:8 }}>WTI Crude</td>
                      <td style={{ padding:8, color:"#fbbf24" }}>${prices?.wti?.price}</td>
                      <td style={{ padding:8 }}>USD</td>
                      <td style={{ padding:8 }}>barril</td>
                    </tr>
                    <tr style={{ borderBottom:"1px solid #1a1a1a" }}>
                      <td style={{ padding:8 }}>Gás Natural</td>
                      <td style={{ padding:8, color:"#fbbf24" }}>${prices?.natural_gas?.price}</td>
                      <td style={{ padding:8 }}>USD</td>
                      <td style={{ padding:8 }}>mmbtu</td>
                    </tr>
                    <tr>
                      <td style={{ padding:8 }}>Spread B-W</td>
                      <td style={{ padding:8, color:"#fbbf24" }}>${prices?.spread}</td>
                      <td style={{ padding:8 }}>USD</td>
                      <td style={{ padding:8 }}>barril</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabela de Variações */}
              <div>
                <h3 style={{ fontSize:13, fontWeight:700, color:"#f59e0b", marginBottom:12, fontFamily:"monospace" }}>
                  2. VARIAÇÕES HISTÓRICAS
                </h3>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:"monospace" }}>
                  <thead>
                    <tr style={{ background:"#1a1a1a", color:"#a3a3a3", textAlign:"left" }}>
                      <th style={{ padding:8 }}>PERÍODO</th>
                      <th style={{ padding:8 }}>VARIAÇÃO (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom:"1px solid #1a1a1a" }}>
                      <td style={{ padding:8 }}>Diária</td>
                      <td style={{ padding:8, color: summary?.changes?.daily >= 0 ? "#22c55e" : "#ef4444" }}>
                        {summary?.changes?.daily > 0 ? "+" : ""}{summary?.changes?.daily}%
                      </td>
                    </tr>
                    <tr style={{ borderBottom:"1px solid #1a1a1a" }}>
                      <td style={{ padding:8 }}>Semanal</td>
                      <td style={{ padding:8, color: summary?.changes?.weekly >= 0 ? "#22c55e" : "#ef4444" }}>
                        {summary?.changes?.weekly > 0 ? "+" : ""}{summary?.changes?.weekly}%
                      </td>
                    </tr>
                    <tr style={{ borderBottom:"1px solid #1a1a1a" }}>
                      <td style={{ padding:8 }}>Mensal</td>
                      <td style={{ padding:8, color: summary?.changes?.monthly >= 0 ? "#22c55e" : "#ef4444" }}>
                        {summary?.changes?.monthly > 0 ? "+" : ""}{summary?.changes?.monthly}%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding:8 }}>Anual</td>
                      <td style={{ padding:8, color: summary?.changes?.yearly >= 0 ? "#22c55e" : "#ef4444" }}>
                        {summary?.changes?.yearly > 0 ? "+" : ""}{summary?.changes?.yearly}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
