from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import Literal
from services.alert_service import AlertService

router = APIRouter()
svc = AlertService()

class AlertCreate(BaseModel):
    type: Literal["price_above","price_below","volatility","news_critical"]
    threshold: float = 0.0
    email: str
    name: str = ""

@router.get("/")
def list_alerts():
    return svc.list_alerts()

@router.post("/")
def create_alert(body: AlertCreate):
    return svc.create_alert(body.dict())

@router.delete("/{alert_id}")
def delete_alert(alert_id: str):
    return svc.delete_alert(alert_id)

@router.get("/triggered")
def get_triggered():
    return svc.get_triggered()

@router.post("/check")
def check_alerts():
    """Verifica todos os alertas ativos contra o preço atual. Chamar periodicamente."""
    return svc.check_all()
