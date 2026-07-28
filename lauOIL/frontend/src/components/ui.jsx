// ── KPI Card ────────────────────────────────────────────────────────────────
export function KPICard({ label, value, sub, colored = false, large = false }) {
  const col = colored
    ? parseFloat(value) >= 0 ? "#22c55e" : "#ef4444"
    : "#f5f5f5";
  return (
    <div style={{ background:"#111", border:"1px solid #222", borderRadius:12, padding:16, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, right:0, width:60, height:60, background:"radial-gradient(circle,rgba(245,158,11,.06) 0%,transparent 70%)" }} />
      <p style={{ fontSize:11, color:"#525252", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>{label}</p>
      <p style={{ fontSize: large ? 28 : 24, fontWeight:800, color: col, letterSpacing:"-.03em" }}>{value ?? "—"}</p>
      {sub && <p style={{ fontSize:11, color:"#525252", fontFamily:"monospace", marginTop:4 }}>{sub}</p>}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ title, children, action }) {
  return (
    <div style={{ background:"#111", border:"1px solid #222", borderRadius:12, padding:20, marginBottom:16 }}>
      {title && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#f5f5f5" }}>{title}</p>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "amber" }) {
  const styles = {
    amber:  { background:"rgba(245,158,11,.12)",  color:"#f59e0b" },
    green:  { background:"rgba(34,197,94,.12)",   color:"#22c55e" },
    red:    { background:"rgba(239,68,68,.12)",   color:"#ef4444" },
    gray:   { background:"#222",                  color:"#a3a3a3" },
    blue:   { background:"rgba(59,130,246,.12)",  color:"#3b82f6" },
  };
  return (
    <span style={{ fontSize:10, fontFamily:"monospace", padding:"2px 8px", borderRadius:99, ...styles[color] }}>
      {children}
    </span>
  );
}

// ── Tab Row ───────────────────────────────────────────────────────────────────
export function TabRow({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:4, marginBottom:16 }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            background: active === t.key ? "rgba(245,158,11,.12)" : "transparent",
            border: `1px solid ${active === t.key ? "#f59e0b" : "#2a2a2a"}`,
            borderRadius:8, color: active === t.key ? "#f59e0b" : "#a3a3a3",
            fontFamily:"monospace", fontSize:11, padding:"5px 12px", cursor:"pointer",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Factor Bar ────────────────────────────────────────────────────────────────
export function FactorBar({ label, pct, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
      <span style={{ fontSize:12, color:"#a3a3a3", minWidth:120 }}>{label}</span>
      <div style={{ flex:1, height:4, background:"#222", borderRadius:2 }}>
        <div style={{ height:"100%", width:`${pct}%`, background: color, borderRadius:2, transition:"width .6s" }} />
      </div>
      <span style={{ fontFamily:"monospace", fontSize:11, color:"#525252", minWidth:32, textAlign:"right" }}>{pct}%</span>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────
export function Loading({ text = "A carregar..." }) {
  return (
    <div style={{ color:"#525252", fontFamily:"monospace", fontSize:12, padding:16 }}>{text}</div>
  );
}

// ── Error ─────────────────────────────────────────────────────────────────────
export function ErrorBox({ msg }) {
  return msg ? (
    <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:8, padding:"10px 16px", color:"#ef4444", fontFamily:"monospace", fontSize:12, marginBottom:12 }}>
      ⚠ {msg}
    </div>
  ) : null;
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, disabled, variant = "amber", small = false }) {
  const bg = { amber:"#f59e0b", dark:"#1a1a1a", red:"rgba(239,68,68,.15)" }[variant];
  const col = { amber:"#000", dark:"#f5f5f5", red:"#ef4444" }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background:bg, color:col, border: variant==="dark"?"1px solid #333":"none",
        borderRadius:8, padding: small ? "5px 12px" : "9px 18px",
        fontWeight:700, fontSize: small ? 11 : 13, cursor:"pointer", opacity: disabled?.5:1,
        fontFamily: variant==="dark" ? "monospace" : "inherit",
      }}
    >
      {children}
    </button>
  );
}
