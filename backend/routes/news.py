from fastapi import APIRouter, Query
from typing import Literal
from services.news_service import NewsService

router = APIRouter()
svc = NewsService()

@router.get("/")
def get_news(
    limit: int = Query(default=20, ge=1, le=100),
    category: Literal["all","economia","geopolitica","opep","producao","conflitos"] = "all"
):
    """
    Notícias filtradas por categoria com score de sentimento NLP.
    Fontes: Reuters, Bloomberg, IEA, OPEP, EIA, AP.
    """
    return svc.get_news(limit=limit, category=category)

@router.get("/sentiment")
def get_sentiment():
    """Sentimento agregado do mercado nas últimas 24h."""
    return svc.get_aggregate_sentiment()

@router.get("/keywords")
def get_keywords():
    """Palavras-chave e temas em tendência nas notícias recentes."""
    return svc.get_keywords()

@router.get("/critical")
def get_critical():
    """Notícias críticas que podem provocar movimentos significativos no mercado."""
    return svc.get_critical_news()
