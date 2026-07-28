from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import dashboard, market, ai, news, alerts, reports

app = FastAPI(
    title="lauOIL API",
    description="Plataforma de Inteligência Artificial para o Mercado Petrolífero",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(market.router,    prefix="/api/market",    tags=["Mercado"])
app.include_router(ai.router,        prefix="/api/ai",        tags=["IA"])
app.include_router(news.router,      prefix="/api/news",      tags=["Notícias"])
app.include_router(alerts.router,    prefix="/api/alerts",    tags=["Alertas"])
app.include_router(reports.router,   prefix="/api/reports",   tags=["Relatórios"])

@app.get("/")
def root():
    return {"app": "lauOIL", "status": "online", "version": "1.0.0"}
