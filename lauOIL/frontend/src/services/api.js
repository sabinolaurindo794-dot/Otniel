const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const dashboardAPI = {
  get: () => req("/dashboard/"),
};

export const marketAPI = {
  getCurrent:    ()          => req("/market/prices/current"),
  getHistory:    (days = 90) => req(`/market/prices/history?days=${days}`),
  getSummary:    ()          => req("/market/prices/summary"),
  getVolatility: ()          => req("/market/prices/volatility"),
  getOpec:       ()          => req("/market/opec"),
};

export const aiAPI = {
  getForecast:    (horizon = 30) => req(`/ai/forecast?horizon=${horizon}`),
  getProbability: ()             => req("/ai/probability"),
  getPatterns:    ()             => req("/ai/patterns"),
  getFactors:     ()             => req("/ai/factors"),
  simulate:       (body)         => req("/ai/simulate", { method: "POST", body: JSON.stringify(body) }),
};

export const newsAPI = {
  getNews:      (limit = 20, category = "all") => req(`/news/?limit=${limit}&category=${category}`),
  getSentiment: ()                             => req("/news/sentiment"),
  getKeywords:  ()                             => req("/news/keywords"),
  getCritical:  ()                             => req("/news/critical"),
};

export const alertsAPI = {
  list:    ()      => req("/alerts/"),
  create:  (body)  => req("/alerts/", { method: "POST", body: JSON.stringify(body) }),
  delete:  (id)    => req(`/alerts/${id}`, { method: "DELETE" }),
  triggered: ()    => req("/alerts/triggered"),
  check:   ()      => req("/alerts/check", { method: "POST" }),
};

export const reportsAPI = {
  getSummary: () => req("/reports/summary"),
  pdfUrl:     () => BASE + "/reports/pdf",
  excelUrl:   () => BASE + "/reports/excel",
};
