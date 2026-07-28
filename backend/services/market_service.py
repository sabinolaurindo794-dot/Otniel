import random
import math
from datetime import datetime, timedelta

class MarketService:
    """
    Serviço de dados de mercado do petróleo.
    Produção: substituir _sim_* por chamadas reais às APIs
    Bloomberg, Reuters, EIA, Alpha Vantage ou Yahoo Finance.
    """

    BASE_BRENT = 82.0
    BASE_WTI   = 78.5

    # ── Preços actuais ────────────────────────────────────────────────────────
    def get_current_prices(self):
        brent = round(self.BASE_BRENT + random.uniform(-1.5, 1.5), 2)
        wti   = round(self.BASE_WTI   + random.uniform(-1.5, 1.5), 2)
        natural_gas = round(2.85 + random.uniform(-0.2, 0.2), 3)
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "brent":       {"price": brent,       "currency": "USD", "unit": "barrel"},
            "wti":         {"price": wti,          "currency": "USD", "unit": "barrel"},
            "natural_gas": {"price": natural_gas,  "currency": "USD", "unit": "mmbtu"},
            "spread":      round(brent - wti, 2),
        }

    # ── Histórico com médias móveis ───────────────────────────────────────────
    def get_history_with_ma(self, days: int):
        records, brent_series, wti_series = [], [], []
        b, w = self.BASE_BRENT, self.BASE_WTI
        today = datetime.utcnow()

        for i in range(days + 50, 0, -1):           # 50 dias extra para MA50
            date = today - timedelta(days=i)
            b = round(b + math.sin(i / 30) * 0.5 + random.uniform(-1.0, 1.0), 2)
            w = round(w + math.sin(i / 30) * 0.5 + random.uniform(-1.0, 1.0), 2)
            brent_series.append(b)
            wti_series.append(w)
            if i <= days:
                records.append({
                    "date":  date.strftime("%Y-%m-%d"),
                    "brent": b,
                    "wti":   w,
                    "volume": random.randint(80_000, 120_000),
                })

        # Calcular médias móveis
        def ma(series, window):
            return [
                round(sum(series[max(0, i - window + 1): i + 1]) / min(i + 1, window), 2)
                for i in range(len(series))
            ]

        full_brent = brent_series
        ma7_full  = ma(full_brent, 7)
        ma20_full = ma(full_brent, 20)
        ma50_full = ma(full_brent, 50)
        offset = len(full_brent) - days

        for idx, rec in enumerate(records):
            rec["ma7"]  = ma7_full[offset + idx]
            rec["ma20"] = ma20_full[offset + idx]
            rec["ma50"] = ma50_full[offset + idx]

        return {"days": days, "data": records}

    # ── Resumo ────────────────────────────────────────────────────────────────
    def get_summary(self):
        brent = round(self.BASE_BRENT + random.uniform(-1, 1), 2)
        return {
            "brent": brent,
            "changes": {
                "daily":   round(random.uniform(-3.0, 3.0), 2),
                "weekly":  round(random.uniform(-6.0, 6.0), 2),
                "monthly": round(random.uniform(-12, 12),   2),
                "yearly":  round(random.uniform(-25, 25),   2),
            },
            "52w_high": round(brent + random.uniform(6, 16),  2),
            "52w_low":  round(brent - random.uniform(6, 16),  2),
            "avg_30d":  round(brent + random.uniform(-2, 2),  2),
            "avg_90d":  round(brent + random.uniform(-4, 4),  2),
        }

    # ── Volatilidade ──────────────────────────────────────────────────────────
    def get_volatility(self):
        vol = round(random.uniform(15, 40), 1)
        risk = "baixo" if vol < 20 else "moderado" if vol < 30 else "alto"
        return {
            "historical_vol_30d": vol,
            "historical_vol_90d": round(vol + random.uniform(-5, 5), 1),
            "risk_level": risk,
            "risk_score": round(vol / 50, 2),
            "avg_daily_change": round(random.uniform(0.8, 2.5), 2),
        }

    # ── OPEP ──────────────────────────────────────────────────────────────────
    def get_opec_data(self):
        return {
            "total_production_mbpd": round(random.uniform(27, 30), 2),
            "quota_compliance_pct":  round(random.uniform(88, 98), 1),
            "last_meeting": "Novembro 2024",
            "next_meeting":  "Fevereiro 2025",
            "current_cut_mbpd": 2.0,
            "top_producers": [
                {"country": "Arábia Saudita", "production": 9.0},
                {"country": "Iraque",         "production": 4.2},
                {"country": "EAU",            "production": 3.2},
                {"country": "Kuwait",         "production": 2.5},
                {"country": "Angola",         "production": 1.1},
            ],
        }
