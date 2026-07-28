import random
import math
from datetime import datetime, timedelta

class AIService:
    """
    Motor de IA da plataforma lauOIL.

    Modelos implementados (stub — em produção treinar com dados reais):
      - LSTM (TensorFlow/Keras) — séries temporais
      - XGBoost — fatores múltiplos
      - Prophet (Meta) — sazonalidade e tendências
      - Random Forest — classificação subida/queda
    """

    BASE = 82.0

    FACTOR_WEIGHTS = {
        "opec_production":  0.28,
        "usd_index":        0.22,
        "global_demand":    0.20,
        "geopolitical":     0.18,
        "news_sentiment":   0.12,
    }

    # ── Previsão completa (ensemble) ──────────────────────────────────────────
    def forecast(self, horizon: int):
        points = []
        p = self.BASE
        today = datetime.utcnow()

        for i in range(1, horizon + 1):
            date   = today + timedelta(days=i)
            drift  = math.sin(i / 15) * 1.5 + random.uniform(-0.6, 0.6)
            p      = round(p + drift * 0.25, 2)
            spread = round(1.2 + i * 0.045, 2)
            points.append({
                "date":        date.strftime("%Y-%m-%d"),
                "lstm":        round(p + random.uniform(-0.3, 0.3), 2),
                "xgboost":     round(p + random.uniform(-0.5, 0.5), 2),
                "prophet":     round(p + random.uniform(-0.4, 0.4), 2),
                "ensemble":    p,
                "upper_band":  round(p + spread, 2),
                "lower_band":  round(p - spread, 2),
            })

        final      = points[-1]["ensemble"]
        change_pct = round((final - self.BASE) / self.BASE * 100, 2)
        confidence = round(max(48, 88 - horizon * 0.18), 1)

        return {
            "horizon_days":    horizon,
            "base_price":      self.BASE,
            "predicted_price": final,
            "change_pct":      change_pct,
            "confidence":      confidence,
            "signal":          self._signal(change_pct),
            "models_used":     ["LSTM", "XGBoost", "Prophet"],
            "series":          points,
        }

    # ── Previsão rápida para o dashboard ─────────────────────────────────────
    def quick_forecast(self):
        chg = round(random.uniform(-5, 5), 2)
        return {
            "price_7d":    round(self.BASE + chg * 0.4, 2),
            "price_30d":   round(self.BASE + chg, 2),
            "signal":      self._signal(chg),
            "confidence":  round(random.uniform(68, 84), 1),
        }

    # ── Probabilidades ────────────────────────────────────────────────────────
    def get_probability(self):
        def rand_prob():
            up = round(random.uniform(35, 65), 1)
            return {"up": up, "down": round(100 - up, 1)}

        return {
            "24h":  rand_prob(),
            "7d":   rand_prob(),
            "30d":  rand_prob(),
            "model": "Random Forest (500 árvores)",
            "accuracy_backtest": round(random.uniform(62, 71), 1),
        }

    # ── Padrões históricos ────────────────────────────────────────────────────
    def get_patterns(self):
        return {
            "patterns": [
                {
                    "name":        "Sazonalidade de Inverno",
                    "description": "Preços tendem a subir entre Nov-Jan devido ao aumento de consumo no hemisfério norte.",
                    "strength":    "alta",
                    "confidence":  72,
                },
                {
                    "name":        "Ciclo OPEP Trimestral",
                    "description": "Movimentos de 3-5% nas semanas seguintes a reuniões da OPEP.",
                    "strength":    "moderada",
                    "confidence":  68,
                },
                {
                    "name":        "Correlação USD Inversa",
                    "description": "Aumento de 1% no índice USD correlaciona-se com queda de 0.8% no Brent.",
                    "strength":    "alta",
                    "confidence":  81,
                },
                {
                    "name":        "Pico de Procura Verão (EUA)",
                    "description": "Aumento de procura de gasolina entre Jun-Ago suporta preços.",
                    "strength":    "moderada",
                    "confidence":  65,
                },
            ]
        }

    # ── Pesos dos fatores ─────────────────────────────────────────────────────
    def get_factor_weights(self):
        return {
            "weights":      self.FACTOR_WEIGHTS,
            "last_updated": datetime.utcnow().isoformat(),
        }

    # ── Simulação de cenário ──────────────────────────────────────────────────
    def simulate(self, inputs: dict):
        opec   = inputs.get("opec_cut",   0)
        usd    = inputs.get("usd_change", 0)
        geo    = inputs.get("geo_risk",   5)
        demand = inputs.get("demand_chg", 0)

        delta = (
            opec   * 3.2  +
            usd    * -2.1 +
            (geo - 5) * 1.4 +
            demand * 2.8
        )
        price      = round(self.BASE + delta, 2)
        spread     = round(3.0 + abs(delta) * 0.2, 2)
        change_pct = round(delta / self.BASE * 100, 2)
        confidence = round(max(45, 80 - abs(delta) * 0.5), 1)

        return {
            "simulated_price": price,
            "upper_band":      round(price + spread, 2),
            "lower_band":      round(price - spread, 2),
            "change_pct":      change_pct,
            "confidence":      confidence,
            "signal":          self._signal(change_pct),
            "inputs":          inputs,
            "narrative": (
                f"Com corte OPEP de {opec}Mbpd, USD {'+' if usd>=0 else ''}{usd}%, "
                f"risco geopolítico {geo}/10 e procura {'+' if demand>=0 else ''}{demand}%, "
                f"o Brent deverá {'subir' if delta>=0 else 'cair'} "
                f"{abs(change_pct):.1f}% para ${price}."
            ),
        }

    def _signal(self, change_pct):
        if change_pct >  5: return "strong_up"
        if change_pct >  2: return "moderate_up"
        if change_pct < -5: return "strong_down"
        if change_pct < -2: return "moderate_down"
        return "stable"
