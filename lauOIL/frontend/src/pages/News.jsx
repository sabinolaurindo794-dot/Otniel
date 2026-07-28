import { useState, useEffect } from "react";
import { newsAPI } from "../services/api";
import { Card, Badge, TabRow, Loading, ErrorBox } from "../components/ui";

export default function News() {
  const [news,      setNews]      = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [keywords,  setKeywords]  = useState([]);
  const [critical,  setCritical]  = useState([]);
  const [category,  setCategory]  = useState("all");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => { load(); }, [category]);

  async function load() {
    setLoading(true); setError("");
    try {
      const [n, s, k, c] = await Promise.all([
        newsAPI.getNews(25, category),
        newsAPI.getSentiment(),
        newsAPI.getKeywords(),
        newsAPI.getCritical(),
      ]);
      setNews(n.articles || []);
      setSentiment(s);
      setKeywords(k.keywords || []);
      setCritical(c.articles || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const SENT_COLORS = { positive: "green", negative: "red", neutral: "gray" };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-.03em" }}>Notícias & Análise de Sentimento NLP</h1>
        <p style={{ fontSize:12, color:"#525252", fontFamily:"monospace", marginTop:4 }}>
          MONITORIZAÇÃO GLOBAL EM TEMPO REAL · PROCESSAMENTO DE LINGUAGEM NATURAL
        </p>
      </div>

      <ErrorBox msg={error} />

      {/* Bar de Sentimento Global */}
      {sentiment && (
        <Card title="Sentimento do Mercado (Últimas 24h)">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:16, alignItems:"center" }}>
            <div>
              <span style={{ fontSize:10, color:"#525252", fontFamily:"monospace" }}>SCORE NLP AGREGADO</span>
              <p style={{ fontSize:26, fontWeight:800, color: sentiment.score >= 0 ? "#22c55e" : "#ef4444" }}>
                {sentiment.score > 0 ? "+" : ""}{sentiment.score}
              </p>
              <Badge color={SENT_COLORS[sentiment.label]}>{sentiment.label.toUpperCase()}</Badge>
            </div>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, fontFamily:"monospace", marginBottom:4 }}>
                <span style={{ color:"#22c55e" }}>Positivo: {sentiment.positive_pct}%</span>
                <span style={{ color:"#a3a3a3" }}>Neutro: {sentiment.neutral_pct}%</span>
                <span style={{ color:"#ef4444" }}>Negativo: {sentiment.negative_pct}%</span>
              </div>
              <div style={{ height:8, borderRadius:4, overflow:"hidden", display:"flex", background:"#222" }}>
                <div style={{ width:`${sentiment.positive_pct}%`, background:"#22c55e", height:"100%" }} />
                <div style={{ width:`${sentiment.neutral_pct}%`, background:"#525252", height:"100%" }} />
                <div style={{ width:`${sentiment.negative_pct}%`, background:"#ef4444", height:"100%" }} />
              </div>
            </div>
            <div style={{ textAlign:"right", fontSize:11, color:"#525252", fontFamily:"monospace" }}>
              <p>{sentiment.articles_analyzed} artigos analisados</p>
              <p>Fontes: Reuters, Bloomberg, EIA, IEA, ANPG</p>
            </div>
          </div>
        </Card>
      )}

      {/* Keywords e Alertas Críticos */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card title="Palavras-Chave Tendência (NLP)">
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {keywords.map((kw, i) => (
              <span
                key={i}
                style={{
                  background:"#1a1a1a", border:"1px solid #333", borderRadius:20,
                  padding:"4px 12px", fontSize:12, fontFamily:"monospace", color:"#f5f5f5",
                  display:"inline-flex", alignItems:"center", gap:6
                }}
              >
                #{kw.word}
                <span style={{ fontSize:10, color:"#f59e0b" }}>({kw.count})</span>
              </span>
            ))}
          </div>
        </Card>

        <Card title="Eventos de Alto Impacto Crítico">
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {critical.map((c, i) => (
              <div key={i} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <Badge color="red">CRÍTICO</Badge>
                  <span style={{ fontSize:10, color:"#a3a3a3", fontFamily:"monospace" }}>{c.source}</span>
                </div>
                <p style={{ fontSize:12, fontWeight:700, color:"#fff", margin:0 }}>{c.headline}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filtros de Categoria */}
      <TabRow
        tabs={[
          { key:"all",         label:"Todas"       },
          { key:"economia",    label:"Economia"    },
          { key:"geopolitica", label:"Geopolítica" },
          { key:"opep",        label:"OPEP"        },
          { key:"producao",    label:"Produção"    },
          { key:"conflitos",   label:"Conflitos"   },
        ]}
        active={category}
        onChange={setCategory}
      />

      {/* Feed de Notícias */}
      {loading ? <Loading text="A filtrar notícias..." /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {news.map((item) => (
            <div
              key={item.id}
              style={{
                background:"#111", border:"1px solid #222", borderRadius:10, padding:16,
                display:"flex", flexDirection:"column", gap:8
              }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <Badge color={SENT_COLORS[item.sentiment]}>{item.sentiment.toUpperCase()}</Badge>
                  <span style={{ fontSize:11, color:"#a3a3a3", fontFamily:"monospace" }}>{item.category}</span>
                </div>
                <div style={{ display:"flex", gap:12, fontSize:11, color:"#525252", fontFamily:"monospace" }}>
                  <span>Fonte: {item.source}</span>
                  <span>Score NLP: {item.score > 0 ? "+" : ""}{item.score}</span>
                </div>
              </div>

              <h3 style={{ fontSize:14, fontWeight:700, color:"#f5f5f5", margin:0 }}>
                {item.headline}
              </h3>

              <div style={{ fontSize:10, color:"#525252", fontFamily:"monospace" }}>
                Publicado a: {new Date(item.published).toLocaleString("pt-PT")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
