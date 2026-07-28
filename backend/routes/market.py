from fastapi import APIRouter, Query
from services.market_service import MarketService

router = APIRouter()
svc = MarketService()

@router.get("/prices/current")
def get_current():
    """Preço atual do Brent e WTI."""
    return svc.get_current_prices()

@router.get("/prices/history")
def get_history(days: int = Query(default=90, ge=7, le=1825)):
    """Histórico de preços com médias móveis (MA7, MA20, MA50)."""
    return svc.get_history_with_ma(days)

@router.get("/prices/summary")
def get_summary():
    """Resumo: variações diária, semanal, mensal, anual, máx/mín 52 semanas."""
    return svc.get_summary()

@router.get("/prices/volatility")
def get_volatility():
    """Volatilidade histórica e índice de risco atual."""
    return svc.get_volatility()

@router.get("/opec")
def get_opec():
    """Dados de produção e decisões recentes da OPEP."""
    return svc.get_opec_data()
