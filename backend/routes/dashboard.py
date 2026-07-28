from fastapi import APIRouter
from services.market_service import MarketService
from services.ai_service import AIService

router = APIRouter()
market_svc = MarketService()
ai_svc = AIService()

@router.get("/")
def get_dashboard():
    """
    Retorna todos os dados do dashboard numa única chamada:
    preço atual, tendência, indicadores e resumo do mercado.
    """
    current = market_svc.get_current_prices()
    summary = market_svc.get_summary()
    forecast = ai_svc.quick_forecast()
    factors = ai_svc.get_factor_weights()

    return {
        "prices": current,
        "summary": summary,
        "forecast": forecast,
        "factors": factors,
    }
