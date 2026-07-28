import uuid
from datetime import datetime
from services.market_service import MarketService

class AlertService:
    def __init__(self):
        self._alerts    = {}
        self._triggered = []
        self._market    = MarketService()

    def list_alerts(self):
        return {"alerts": list(self._alerts.values()), "total": len(self._alerts)}

    def create_alert(self, config: dict):
        aid = str(uuid.uuid4())[:8]
        alert = {
            "id":         aid,
            "name":       config.get("name") or f"Alerta {aid}",
            "type":       config["type"],
            "threshold":  config.get("threshold", 0),
            "email":      config["email"],
            "active":     True,
            "created_at": datetime.utcnow().isoformat(),
        }
        self._alerts[aid] = alert
        return {"success": True, "alert": alert}

    def delete_alert(self, alert_id: str):
        if alert_id not in self._alerts:
            return {"success": False, "error": "Alerta não encontrado"}
        del self._alerts[alert_id]
        return {"success": True, "deleted_id": alert_id}

    def get_triggered(self):
        return {"triggered": self._triggered[-20:], "total": len(self._triggered)}

    def check_all(self):
        current = self._market.get_current_prices()
        price   = current["brent"]["price"]
        vol     = 25.0   # stub — usar MarketService.get_volatility() em produção
        new_triggers = []

        for alert in self._alerts.values():
            if not alert["active"]:
                continue
            fired = False
            reason = ""
            t = alert["type"]
            if t == "price_above"   and price > alert["threshold"]:
                fired = True; reason = f"Brent ${price} > threshold ${alert['threshold']}"
            elif t == "price_below" and price < alert["threshold"]:
                fired = True; reason = f"Brent ${price} < threshold ${alert['threshold']}"
            elif t == "volatility"  and vol > alert["threshold"]:
                fired = True; reason = f"Volatilidade {vol}% > {alert['threshold']}%"

            if fired:
                event = {
                    "alert_id":     alert["id"],
                    "alert_name":   alert["name"],
                    "type":         t,
                    "reason":       reason,
                    "price_at":     price,
                    "triggered_at": datetime.utcnow().isoformat(),
                }
                self._triggered.append(event)
                new_triggers.append(event)

        return {"triggered_now": new_triggers, "count": len(new_triggers)}
