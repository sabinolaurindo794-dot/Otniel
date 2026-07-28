import { useEffect, useState } from "react";

export default function Topbar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString("pt-PT"));
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString("pt-PT")), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      gridColumn: "1/-1", background: "#111", borderBottom: "1px solid #222",
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:30, height:30, background:"#f59e0b", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⛽</div>
        <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-.02em" }}>
          lau<span style={{ color:"#f59e0b" }}>OIL</span>
        </span>
        <span style={{ fontSize:11, color:"#525252", fontFamily:"monospace", marginLeft:8 }}>
          v1.0 · IA Petrolífera
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#a3a3a3", fontFamily:"monospace" }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite" }} />
          LIVE
        </div>
        <span style={{ fontFamily:"monospace", fontSize:12, color:"#525252" }}>{time}</span>
      </div>
    </div>
  );
}
