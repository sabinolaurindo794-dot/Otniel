const LINKS = [
  { section: "Principal" },
  { key: "dashboard", label: "Dashboard",  icon: "▦" },
  { key: "market",    label: "Mercado",    icon: "◈" },
  { section: "Inteligência" },
  { key: "ai",        label: "IA & Previsão", icon: "⟡" },
  { key: "news",      label: "Notícias",   icon: "◉" },
  { section: "Gestão" },
  { key: "alerts",    label: "Alertas",    icon: "◎" },
  { key: "reports",   label: "Relatórios", icon: "▣" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <div style={{ background:"#111", borderRight:"1px solid #222", padding:"20px 12px", display:"flex", flexDirection:"column", gap:4 }}>
      {LINKS.map((l, i) =>
        l.section ? (
          <div key={i} style={{ fontSize:10, color:"#525252", fontFamily:"monospace", letterSpacing:".08em", padding:"16px 12px 6px", textTransform:"uppercase" }}>
            {l.section}
          </div>
        ) : (
          <button
            key={l.key}
            onClick={() => onNavigate(l.key)}
            style={{
              display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8,
              fontSize:13, fontWeight:600, border:"none", width:"100%", textAlign:"left", cursor:"pointer",
              background: activePage === l.key ? "rgba(245,158,11,.12)" : "transparent",
              color:      activePage === l.key ? "#f59e0b" : "#a3a3a3",
              transition: "all .15s",
            }}
          >
            <span style={{ width:16, textAlign:"center", fontSize:14 }}>{l.icon}</span>
            {l.label}
          </button>
        )
      )}
    </div>
  );
}
