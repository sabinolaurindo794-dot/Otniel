from fastapi import APIRouter, Query
from pydantic import BaseModel
from services.ai_service import AIService

router = APIRouter()
svc = AIService()

class ScenarioInput(BaseModel):
    opec_cut:   float = 0.0   # corte OPEP em Mbpd (-5 a +5)
    usd_change: float = 0.0   # variação USD em %
    geo_risk:   float = 5.0   # risco geopolítico (0-10)
    demand_chg: float = 0.0   # variação de procura em %

@router.get("/forecast")
def get_forecast(horizon: int = Query(default=30, ge=7, le=180)):
    """
    Previsão de preço do Brent para o horizonte indicado.
    Utiliza ensemble: LSTM + XGBoost + Prophet.
    """
    return svc.forecast(horizon)

@router.get("/probability")
def get_probability():
    """
    Probabilidade de subida ou queda do preço nas próximas 24h, 7d e 30d.
    """
    return svc.get_probability()

@router.get("/patterns")
def get_patterns():
    """Padrões históricos identificados pelo modelo de ML."""
    return svc.get_patterns()

@router.get("/factors")
def get_factors():
    """Peso atual de cada fator no modelo de previsão."""
    return svc.get_factor_weights()

@router.post("/simulate")
def simulate(inputs: ScenarioInput):
    """Simulação de cenário hipotético com os fatores ajustados pelo utilizador."""
    return svc.simulate(inputs.dict())
