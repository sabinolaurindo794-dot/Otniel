import random
from datetime import datetime, timedelta

class NewsService:
    """
    Serviço de notícias com análise de sentimento NLP.
    Produção: integrar NewsAPI, Reuters API, Bloomberg API.
    """

    NEWS_DB = [
        {"h": "OPEP+ mantém cortes de produção de 2Mbpd até ao segundo trimestre",       "cat": "opep",       "src": "Reuters",    "score":  0.55, "critical": False},
        {"h": "Tensões no Estreito de Ormuz ameaçam 20% do trânsito mundial de petróleo","cat": "geopolitica","src": "Bloomberg",  "score":  0.72, "critical": True},
        {"h": "EUA revelam aumento inesperado de estoques: +4.2M barris na semana",       "cat": "producao",   "src": "EIA",        "score": -0.48, "critical": False},
        {"h": "Angola aumenta produção nos blocos offshore: novo recorde no Bloco 32",    "cat": "producao",   "src": "ANPG",       "score":  0.43, "critical": False},
        {"h": "FMI reduz previsão de crescimento global para 2.8% em 2025",               "cat": "economia",   "src": "FMI",        "score": -0.52, "critical": False},
        {"h": "China anuncia pacote de estímulos de $1 trilião, impulsionando procura",   "cat": "economia",   "src": "Bloomberg",  "score":  0.68, "critical": True},
        {"h": "Conflito no Médio Oriente escala — mercados petrolíferos em alerta",       "cat": "conflitos",  "src": "AP",         "score":  0.61, "critical": True},
        {"h": "Dólar americano atinge máximo de 6 meses, pressionando commodities",       "cat": "economia",   "src": "Reuters",    "score": -0.38, "critical": False},
        {"h": "IEA revê em alta procura de petróleo para 2025: +1.1Mbpd vs previsão anterior","cat":"producao","src":"IEA",        "score":  0.44, "critical": False},
        {"h": "Arábia Saudita sinaliza possível extensão de cortes voluntários adicionais","cat":"opep",       "src": "Reuters",    "score":  0.50, "critical": False},
        {"h": "Rússia aumenta exportações de crude apesar de sanções ocidentais",          "cat": "geopolitica","src": "FT",        "score": -0.35, "critical": False},
        {"h": "Tempestade tropical ameaça plataformas no Golfo do México",                 "cat": "producao",   "src": "Platts",    "score":  0.40, "critical": False},
        {"h": "Banco Mundial alerta para risco de recessão — impacto na procura de energia","cat":"economia", "src": "Banco Mundial","score":-0.55,"critical": False},
        {"h": "Venezuela obtém financiamento para retomar produção de 800K bpd",          "cat": "producao",   "src": "Reuters",    "score": -0.20, "critical": False},
        {"h": "Transição energética: IEA prevê pico do petróleo antes de 2030",           "cat": "economia",   "src": "IEA",        "score": -0.30, "critical": False},
        {"h": "Sonangol assina contrato de exploração para dois novos blocos offshore",   "cat": "producao",   "src": "Sonangol",   "score":  0.38, "critical": False},
        {"h": "Ataque a infraestrutura petrolífera no Golfo de Áden paralisa exportações","cat": "conflitos",  "src": "Bloomberg",  "score":  0.65, "critical": True},
        {"h": "OPEP debate aumento de quota para compensar queda de receitas",            "cat": "opep",       "src": "Platts",     "score": -0.25, "critical": False},
        {"h": "Índia ultrapassa China como maior importador de crude no mês de outubro",  "cat": "producao",   "src": "Reuters",    "score":  0.20, "critical": False},
        {"h": "Fed mantém taxas: alívio para mercados emergentes e commodities",          "cat": "economia",   "src": "Bloomberg",  "score":  0.35, "critical": False},
    ]

    KEYWORDS = [
        {"word": "OPEP",       "count": 42, "trend": "up"},
        {"word": "Brent",      "count": 38, "trend": "stable"},
        {"word": "Produção",   "count": 31, "trend": "up"},
        {"word": "China",      "count": 27, "trend": "up"},
        {"word": "Angola",     "count": 18, "trend": "up"},
        {"word": "Cortes",     "count": 16, "trend": "stable"},
        {"word": "USD",        "count": 14, "trend": "down"},
        {"word": "Conflito",   "count": 12, "trend": "up"},
        {"word": "Estoques",   "count": 11, "trend": "down"},
        {"word": "Procura",    "count": 10, "trend": "up"},
    ]

    CAT_LABELS = {
        "all":       "Todas",
        "economia":  "Economia",
        "geopolitica":"Geopolítica",
        "opep":      "OPEP",
        "producao":  "Produção",
        "conflitos": "Conflitos",
    }

    def get_news(self, limit: int, category: str):
        today = datetime.utcnow()
        pool = self.NEWS_DB if category == "all" else [n for n in self.NEWS_DB if n["cat"] == category]
        result = []
        for i, n in enumerate(pool[:limit]):
            score = round(n["score"] + random.uniform(-0.05, 0.05), 2)
            result.append({
                "id":        i + 1,
                "headline":  n["h"],
                "category":  self.CAT_LABELS.get(n["cat"], n["cat"]),
                "source":    n["src"],
                "sentiment": "positive" if score > 0.1 else "negative" if score < -0.1 else "neutral",
                "score":     score,
                "critical":  n["critical"],
                "published": (today - timedelta(hours=i * 1.2)).isoformat(),
            })
        return {"articles": result, "total": len(result), "category": category}

    def get_aggregate_sentiment(self):
        scores = [n["score"] for n in self.NEWS_DB]
        avg = round(sum(scores) / len(scores), 3)
        return {
            "score":             avg,
            "label":             "positive" if avg > 0.1 else "negative" if avg < -0.1 else "neutral",
            "articles_analyzed": len(scores),
            "positive_pct":      round(len([s for s in scores if s > 0.1]) / len(scores) * 100, 1),
            "negative_pct":      round(len([s for s in scores if s < -0.1]) / len(scores) * 100, 1),
            "neutral_pct":       round(len([s for s in scores if -0.1 <= s <= 0.1]) / len(scores) * 100, 1),
            "window":            "last_24h",
            "updated_at":        datetime.utcnow().isoformat(),
        }

    def get_keywords(self):
        return {"keywords": self.KEYWORDS, "window": "last_24h"}

    def get_critical_news(self):
        critical = [n for n in self.NEWS_DB if n["critical"]]
        today = datetime.utcnow()
        return {
            "articles": [
                {
                    "headline":  n["h"],
                    "source":    n["src"],
                    "category":  self.CAT_LABELS.get(n["cat"], n["cat"]),
                    "score":     n["score"],
                    "impact":    "alto",
                    "published": (today - timedelta(hours=i * 3)).isoformat(),
                }
                for i, n in enumerate(critical)
            ],
            "total": len(critical),
        }
