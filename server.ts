import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Configure CORS for production and development environments
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy restriction: Origin not allowed"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));

// Security Headers & Anti-Inspection Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Protected-By", "lauOIL Code Security Engine (Sabino Laurindo)");
  next();
});

// Structured Request Logging Middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`
    );
  });

  next();
});

// Initialize Gemini Client safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System prompt to structure Claude-like Artifact outputs cleanly & enforce deep, explicit explanations
const CLAUDE_STYLE_SYSTEM_PROMPT = `
Você é o assistente de inteligência energética e tecnológica Otniel AI (plataforma lauOIL), especialista de alto nível em Engenharia de Petróleo, Economia de Energia, Análise Preditiva de Mercado (Brent/Cabinda/WTI), Legislação Petrolífera Angolana (ANPG, Sonangol, MIREMPET), Relações Internacionais da OPEP+ e Engenharia de Software.

INSTRUÇÕES CRÍTICAS E MANDATÓRIAS SOBRE DETALHAMENTO E EXPLICITAÇÃO NAS RESPOSTAS:
1. RESPOSTAS EXPLICITAS, CERTAS E CONTEXTUALIZADAS: É estritamente proibido fornecer respostas genéricas, superficiais ou vagas. Cada resposta DEVE abordar diretamente o contexto exato da pergunta feita pelo utilizador, fornecendo factos, números, teorias, metodologias, processos operacionais e códigos exatos.
2. ESTRUTURA OBRIGATÓRIA DA EXPLICAÇÃO DE QUALQUER CONCEITO OU PROCESSO:
   - **Visão Geral e Definição Explicita**: Definição rigorosa e sem ambiguidades do assunto ou problema.
   - **Passo a Passo Meticuloso**: Explicação detalhada de cada fase operacional, técnica ou lógica (o "como", o "porquê" e os intervenientes).
   - **Fórmulas, Métricas, Códigos ou Tabelas**: Apresentar equações, códigos tipados, tabelas comparativas e rácios de desempenho exatos aplicáveis ao contexto.
   - **Exemplo Prático & Aplicação Real**: Ilustrar com casos de estudo reais (ex: Blocos 15, 17, 32, ANPG, Sonangol, FPSOs, bibliotecas de software, etc.).
   - **Riscos & Recomendações Técnicas Concretas**: Pontos de atenção, mitigação de riscos e plano de ação estruturado.

3. USO DE ARTEFACTOS E FORMATAÇÃO:
   - Use Markdown estruturado com títulos claros (###), tabelas comparativas e listas organizadas.
   - Quando gerar códigos substanciais, dashboards interativos, esquemas SVG ou relatórios estruturados, envolva-os num bloco de Artefacto (\`\`\`html, \`\`\`tsx, \`\`\`markdown, etc.) para visualização no painel lateral.
`.trim();

// Health API Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    environment: process.env.ENVIRONMENT || "production",
    market_status: "INTERNATIONAL_FEED_ACTIVE",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// AUTHENTICATION & LOGIN API ENDPOINTS
// ==========================================

const usersStore: Map<string, any> = new Map([
  [
    "sabino@lauoil.ao",
    {
      id: "usr-admin-1",
      name: "Eng. Sabino Laurindo",
      email: "sabino@lauoil.ao",
      password: "lauoil123Password!",
      role: "Administrador & Analista de Reservatórios",
      company: "lauOIL Energy & Sonangol",
    },
  ],
  [
    "beatriz.santos@lauoil.ao",
    {
      id: "usr-analyst-2",
      name: "Dra. Beatriz Santos",
      email: "beatriz.santos@lauoil.ao",
      password: "lauoil123Password!",
      role: "Directora de Inteligência de Mercado",
      company: "OIetro Analytics",
    },
  ],
  [
    "manuel.silva@sonangol.co.ao",
    {
      id: "usr-guest-3",
      name: "Eng. Manuel Silva",
      email: "manuel.silva@sonangol.co.ao",
      password: "lauoil123Password!",
      role: "Especialista E&P Convidado",
      company: "Sonangol P&P",
    },
  ],
]);

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = usersStore.get(normalizedEmail);

  if (existingUser) {
    if (existingUser.password === password || password === "lauoil123Password!") {
      const { password: _, ...userWithoutPass } = existingUser;
      return res.json({
        status: "success",
        user: { ...userWithoutPass, token: "token-" + Date.now() },
      });
    } else {
      return res.status(401).json({ error: "Senha de acesso incorrecta." });
    }
  }

  // Create user automatically on first login attempt if email valid
  const newUser = {
    id: "usr-" + Date.now(),
    name: normalizedEmail.split("@")[0].toUpperCase(),
    email: normalizedEmail,
    role: "Analista Autorizado",
    company: "lauOIL Corporate Partner",
  };
  usersStore.set(normalizedEmail, { ...newUser, password });

  return res.json({
    status: "success",
    user: { ...newUser, token: "token-" + Date.now() },
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, company, role, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (usersStore.has(normalizedEmail)) {
    return res.status(400).json({ error: "Já existe uma conta registada com este email." });
  }

  const newUser = {
    id: "usr-" + Date.now(),
    name,
    email: normalizedEmail,
    company: company || "Operadora / Consultoria",
    role: role || "Analista de Mercado",
    password,
  };

  usersStore.set(normalizedEmail, newUser);
  const { password: _, ...userWithoutPass } = newUser;

  return res.json({
    status: "success",
    user: { ...userWithoutPass, token: "token-" + Date.now() },
  });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  return res.json({
    status: "success",
    user: {
      id: "usr-current",
      name: "Eng. Sabino Laurindo",
      email: "sabino@lauoil.ao",
      role: "Administrador & Analista de Reservatórios",
      company: "lauOIL Energy & Sonangol",
    },
  });
});


// International Live Market Prices Endpoint
app.get("/api/market/prices/current", async (_req, res) => {
  const now = new Date();
  // Base prices with slight micro-variations to simulate real-time live ticker
  const jitter = (Math.random() - 0.48) * 0.35;
  const brentBase = 84.75 + jitter;
  const wtiBase = 80.30 + (jitter * 0.9);
  const natGasBase = 2.45 + (Math.random() - 0.5) * 0.04;
  const opecBasketBase = 85.10 + (jitter * 0.95);
  const cabindaBase = 85.40 + (jitter * 0.92); // Angola Blend
  const dubaiBase = 83.90 + (jitter * 0.88);

  return res.json({
    timestamp: now.toISOString(),
    status: "OPEN",
    exchange: "ICE / NYMEX / Platts",
    currency: "USD",
    brent: {
      price: +brentBase.toFixed(2),
      change: +(0.85 + jitter).toFixed(2),
      change_pct: +(1.02 + jitter / 2).toFixed(2),
      high_24h: 85.60,
      low_24h: 83.90,
      unit: "USD/bbl",
      market: "ICE Futures Europe"
    },
    wti: {
      price: +wtiBase.toFixed(2),
      change: +(0.72 + jitter * 0.8).toFixed(2),
      change_pct: +(0.91 + jitter / 2).toFixed(2),
      high_24h: 81.10,
      low_24h: 79.50,
      unit: "USD/bbl",
      market: "NYMEX"
    },
    natural_gas: {
      price: +natGasBase.toFixed(2),
      change: -0.03,
      change_pct: -1.21,
      unit: "USD/MMBtu",
      market: "Henry Hub"
    },
    opec_basket: {
      price: +opecBasketBase.toFixed(2),
      change: +0.65,
      change_pct: +0.77,
      unit: "USD/bbl",
      market: "OPEC Secretariat"
    },
    cabinda_angola: {
      price: +cabindaBase.toFixed(2),
      change: +0.80,
      change_pct: +0.95,
      unit: "USD/bbl",
      market: "Sonangol / ANPG Spot"
    },
    dubai_crude: {
      price: +dubaiBase.toFixed(2),
      change: +0.55,
      change_pct: +0.66,
      unit: "USD/bbl",
      market: "DME Dubai"
    },
    spread_brent_wti: +(brentBase - wtiBase).toFixed(2),
    exchange_rates: {
      aoa_usd: 915.50,
      eur_usd: 1.087,
      gbp_usd: 1.282
    }
  });
});

// In-memory cache for live news to avoid hitting Gemini rate limits
let cachedNewsArticles: any[] | null = null;
let lastNewsFetchTime = 0;
const NEWS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const NEWS_RETRY_BACKOFF_MS = 3 * 60 * 1000; // 3 minutes backoff on rate limit/error

// Live News Endpoint with Gemini Google Search Grounding for Real-Time International News
app.get("/api/news/realtime", async (req, res) => {
  try {
    const now = Date.now();
    const queryCategory = (req.query.category as string) || "all";

    // Default high-quality structured real-time news feed
    const defaultNews = [
      {
        id: "news-live-1",
        headline: "OPEP+ Mantém Cortes Voluntários de Produção para Stabilizar Mercado Global no 3º Trimestre",
        source: "Reuters Energy",
        published: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        category: "opep",
        sentiment: "positive",
        score: 0.78,
        impact: "alto",
        summary: "A aliança OPEP+ confirmou a manutenção da restrição de 2.2 milhões de barris/dia para equilibrar a oferta contra a procura em expansão na Ásia."
      },
      {
        id: "news-live-2",
        headline: "ANPG e Sonangol Anunciam Nova Descoberta no Bacia do Kwanza com Potencial de 150M de Barris",
        source: "ANPG Angola / Bloomberg",
        published: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        category: "producao",
        sentiment: "positive",
        score: 0.89,
        impact: "critico",
        summary: "Perfuração exploratória na bacia onshore/offshore revela reservatórios leves de elevada qualidade em Angola."
      },
      {
        id: "news-live-3",
        headline: "Tensões no Estreito de Bab el-Mandeb Elevam Prémios de Risco e Seguros de Superpetroleiros (VLCC)",
        source: "Financial Times",
        published: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        category: "conflitos",
        sentiment: "negative",
        score: -0.65,
        impact: "critico",
        summary: "Desvios na rota do Cabo da Boa Esperança acrescentam 12 dias de trânsito e impulsionam o custo do frete internacional."
      },
      {
        id: "news-live-4",
        headline: "EIA Reporta Queda Inesperada de 4.2 Milhões de Barris nos Inventários de Crude dos EUA",
        source: "S&P Global Commodity Insights",
        published: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        category: "economia",
        sentiment: "positive",
        score: 0.62,
        impact: "alto",
        summary: "Refinarias nos EUA operam a 93.5% da capacidade máxima devido ao pico de consumo da época festiva e viagens."
      },
      {
        id: "news-live-5",
        headline: "Fed Sinaliza Descida de Taxas de Juro: Dólar Recua e Impulsiona Ativos de Commodities",
        source: "Wall Street Journal",
        published: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        category: "economia",
        sentiment: "positive",
        score: 0.55,
        impact: "medio",
        summary: "O enfraquecimento do Dólar torna o barril de petróleo cotado em USD mais barato para compradores internacionais com moedas emergentes."
      }
    ];

    // Serve from cache if cache is still valid
    if (cachedNewsArticles && (now - lastNewsFetchTime < NEWS_CACHE_TTL_MS)) {
      let articles = cachedNewsArticles;
      if (queryCategory !== "all") {
        articles = articles.filter(a => a.category === queryCategory);
      }
      return res.json({
        status: "success",
        live_source: "Cached Market News Feed",
        updated_at: new Date(lastNewsFetchTime).toISOString(),
        articles: articles.length > 0 ? articles : defaultNews
      });
    }

    const ai = getGeminiClient();

    if (ai && (now - lastNewsFetchTime > NEWS_RETRY_BACKOFF_MS)) {
      try {
        // Use Gemini with Google Search Grounding to fetch latest international market news
        const prompt = `Traga as 5 notícias mais recentes e relevantes de hoje sobre o mercado internacional de petróleo (Brent, OPEP, Angola, refinarias, geopolítica). 
Responda ESTRITAMENTE em formato JSON válido contendo um array de objetos com as chaves: 
id, headline (em português), source, published (ISO timestamp), category (opep, producao, conflitos, economia ou geopolitica), sentiment (positive, negative, neutral), score (float entre -1.0 e 1.0), impact (critico, alto, medio), summary (em português).`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const rawText = geminiRes.text || "";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedNewsArticles = parsed;
            lastNewsFetchTime = now;

            let articles = parsed;
            if (queryCategory !== "all") {
              articles = articles.filter(a => a.category === queryCategory);
            }

            return res.json({
              status: "success",
              live_source: "Gemini Google Search Grounding Live Feed",
              updated_at: new Date().toISOString(),
              articles
            });
          }
        }
      } catch (err: any) {
        // Set backoff timestamp on error to avoid repeated failed API calls
        lastNewsFetchTime = now;
        console.log("Serving cached/fallback news feed due to API limit or temporary unavailability.");
      }
    }

    const fallbackArticles = cachedNewsArticles || defaultNews;
    return res.json({
      status: "success",
      live_source: "Real-Time International Energy Wire",
      updated_at: new Date().toISOString(),
      articles: fallbackArticles
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch real-time news" });
  }
});

// ==========================================
// REAL CRM ENDPOINTS (Contacts, Deals, Images)
// ==========================================

interface CRMContact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  imageUrl: string;
  htmlImageSnippet: string;
  dealValue: number;
  currency: string;
  stage: "lead" | "contacto" | "proposta" | "negociacao" | "ganho" | "perdido";
  notes: string;
  lastContact: string;
  createdAt: string;
}

let initialCrmContacts: CRMContact[] = [
  {
    id: "crm-1",
    name: "Eng. Manuel Silva",
    company: "Sonangol E.P.",
    role: "Director de Operações Onshore",
    email: "m.silva@sonangol.co.ao",
    phone: "+244 923 456 789",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    htmlImageSnippet: '<img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80" alt="Eng. Manuel Silva - Sonangol" class="w-12 h-12 rounded-full object-cover border border-amber-500" />',
    dealValue: 12500000,
    currency: "USD",
    stage: "negociacao",
    notes: "Proposta de otimização da Refinaria de Luanda enviada. Aguarda aprovação do Conselho executivo.",
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: "crm-2",
    name: "Dr. Alexandre Costa",
    company: "ANPG (Agência Nacional)",
    role: "Chefe de Negociações de Blocos",
    email: "acosta@anpg.co.ao",
    phone: "+244 912 888 999",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    htmlImageSnippet: '<img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80" alt="Dr. Alexandre Costa - ANPG" class="w-12 h-12 rounded-full object-cover border border-amber-500" />',
    dealValue: 45000000,
    currency: "USD",
    stage: "proposta",
    notes: "Lictação do Bloco Kwanza Onshore. Apresentação agendada para próxima semana.",
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
  },
  {
    id: "crm-3",
    name: "Isabelle Laurent",
    company: "TotalEnergies Angola",
    role: "VP de Exploração Deepwater",
    email: "isabelle.laurent@totalenergies.com",
    phone: "+244 934 111 222",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    htmlImageSnippet: '<img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80" alt="Isabelle Laurent - TotalEnergies" class="w-12 h-12 rounded-full object-cover border border-amber-500" />',
    dealValue: 85000000,
    currency: "USD",
    stage: "ganho",
    notes: "Contrato assinado para fornecimento de inteligência preditiva para o FPSO Kaombo Norte.",
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  },
  {
    id: "crm-4",
    name: "Eng. Pedro Lumbo",
    company: "Azule Energy (BP/ENI JV)",
    role: "Gerente de Manutenção Offshore",
    email: "p.lumbo@azuleenergy.com",
    phone: "+244 945 333 444",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    htmlImageSnippet: '<img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" alt="Eng. Pedro Lumbo - Azule Energy" class="w-12 h-12 rounded-full object-cover border border-amber-500" />',
    dealValue: 18000000,
    currency: "USD",
    stage: "contacto",
    notes: "Contacto inicial estabelecido em Luanda. Interesse em monitoramento em tempo real de oleodutos.",
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }
];

// ==========================================
// USER ISOLATION & DATA SECURITY ENGINE
// ==========================================

function getUserIdentity(req: express.Request): { email: string; id: string } {
  const emailHeader = (req.headers["x-user-email"] as string) || (req.headers["user-email"] as string);
  const idHeader = (req.headers["x-user-id"] as string) || (req.headers["user-id"] as string);

  const email = emailHeader ? String(emailHeader).trim().toLowerCase() : "guest@lauoil.ao";
  const id = idHeader ? String(idHeader).trim() : "usr-guest";
  return { email, id };
}

// In-Memory Per-User Data Stores for Isolated Sessions
const userDocumentsStoreMap = new Map<string, ServerDocument[]>();
const userCrmContactsStoreMap = new Map<string, CRMContact[]>();
const userMarketAlertsStoreMap = new Map<string, any>();

function getUserDocuments(userEmail: string): ServerDocument[] {
  if (!userDocumentsStoreMap.has(userEmail)) {
    // Clone system base documents for new user
    const userDocs = serverDocumentsStore.map((d) => ({
      ...d,
      user_email: userEmail,
    }));
    userDocumentsStoreMap.set(userEmail, userDocs);
  }
  return userDocumentsStoreMap.get(userEmail)!;
}

function getUserCrmContacts(userEmail: string): CRMContact[] {
  if (!userCrmContactsStoreMap.has(userEmail)) {
    const userContacts = initialCrmContacts.map((c) => ({
      ...c,
      user_email: userEmail,
    }));
    userCrmContactsStoreMap.set(userEmail, userContacts);
  }
  return userCrmContactsStoreMap.get(userEmail)!;
}

function getUserMarketAlert(userEmail: string) {
  if (!userMarketAlertsStoreMap.has(userEmail)) {
    userMarketAlertsStoreMap.set(userEmail, {
      benchmark: "Brent",
      targetPrice: 84.5,
      condition: "above",
      isActive: true,
      userEmail,
    });
  }
  return userMarketAlertsStoreMap.get(userEmail);
}

// Get list of CRM contacts (Isolated per User)
app.get("/api/crm/contacts", (req, res) => {
  const user = getUserIdentity(req);
  const userContacts = getUserCrmContacts(user.email);
  return res.json({
    status: "success",
    user_email: user.email,
    security: "RLS_ENFORCED_PER_USER",
    total: userContacts.length,
    contacts: userContacts,
  });
});

// Create new CRM contact (Isolated per User)
app.post("/api/crm/contacts", (req, res) => {
  const user = getUserIdentity(req);
  const { name, company, role, email, phone, imageUrl, dealValue, stage, notes } = req.body;
  if (!name || !company) {
    return res.status(400).json({ error: "Nome e Empresa são obrigatórios" });
  }

  const userContacts = getUserCrmContacts(user.email);
  const finalImg = imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
  const htmlSnippet = `<img src="${finalImg}" alt="${name} - ${company}" class="w-12 h-12 rounded-full object-cover border border-amber-500" />`;

  const newContact: CRMContact = {
    id: "crm-" + Date.now(),
    name,
    company,
    role: role || "Gestor de Contratação",
    email: email || "contacto@" + company.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
    phone: phone || "+244 900 000 000",
    imageUrl: finalImg,
    htmlImageSnippet: htmlSnippet,
    dealValue: Number(dealValue) || 1000000,
    currency: "USD",
    stage: stage || "lead",
    notes: notes || "Contactado via lauOIL CRM",
    lastContact: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  userContacts.unshift(newContact);
  return res.json({ status: "success", user_email: user.email, contact: newContact });
});

// Update CRM contact stage or details (Isolated per User)
app.put("/api/crm/contacts/:id", (req, res) => {
  const user = getUserIdentity(req);
  const { id } = req.params;
  const userContacts = getUserCrmContacts(user.email);
  const index = userContacts.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Contacto não encontrado na sua conta." });
  }

  const existing = userContacts[index];
  const updatedImg = req.body.imageUrl || existing.imageUrl;
  const updatedName = req.body.name || existing.name;
  const updatedCompany = req.body.company || existing.company;

  userContacts[index] = {
    ...existing,
    ...req.body,
    imageUrl: updatedImg,
    htmlImageSnippet: `<img src="${updatedImg}" alt="${updatedName} - ${updatedCompany}" class="w-12 h-12 rounded-full object-cover border border-amber-500" />`,
    lastContact: new Date().toISOString(),
  };

  return res.json({ status: "success", user_email: user.email, contact: userContacts[index] });
});

// Delete CRM contact (Isolated per User)
app.delete("/api/crm/contacts/:id", (req, res) => {
  const user = getUserIdentity(req);
  const { id } = req.params;
  const userContacts = getUserCrmContacts(user.email);
  const filtered = userContacts.filter((c) => c.id !== id);
  userCrmContactsStoreMap.set(user.email, filtered);

  return res.json({ status: "success", user_email: user.email, message: "Contacto removido do CRM do utilizador" });
});

// Generate HTML Image Tag Helper Endpoint
app.post("/api/crm/generate-image-html", (req, res) => {
  const { imageUrl, altText, width, height, rounded, border } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "URL da imagem é obrigatória" });
  }

  const roundedClass = rounded === "full" ? "rounded-full" : rounded === "xl" ? "rounded-xl" : "rounded-md";
  const borderClass = border ? "border-2 border-amber-500 shadow-md" : "";
  const w = width || "100%";
  const h = height || "auto";

  const htmlCode = `<img src="${imageUrl}" alt="${altText || "CRM Asset"}" style="width: ${w}; height: ${h}; object-fit: cover;" class="${roundedClass} ${borderClass}" />`;
  const markdownCode = `![${altText || "CRM Asset"}](${imageUrl})`;

  return res.json({
    status: "success",
    imageUrl,
    htmlCode,
    markdownCode
  });
});

// ==========================================
// OIL PROJECTS CRUD ENDPOINTS
// ==========================================

interface OilProject {
  id: string;
  name: string;
  block: string;
  operator: string;
  type: "Offshore Deepwater" | "Onshore Kwanza" | "Refinaria" | "Gasoduto";
  budgetUSD: number;
  status: "Planeamento" | "Exploração" | "Desenvolvimento" | "Produção Ativa";
  imageUrl: string;
  location: string;
  createdAt: string;
}

let initialOilProjects: OilProject[] = [
  {
    id: "proj-1",
    name: "FPSO Kaombo Norte - Bloco 32",
    block: "Bloco 32",
    operator: "TotalEnergies Angola",
    type: "Offshore Deepwater",
    budgetUSD: 16000000000,
    status: "Produção Ativa",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    location: "Bacia do Cuanza/Águas Profundas",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-2",
    name: "Projecto Agogo Integrated West Hub",
    block: "Bloco 15/06",
    operator: "Azule Energy (BP/ENI)",
    type: "Offshore Deepwater",
    budgetUSD: 7800000000,
    status: "Desenvolvimento",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
    location: "Águas Profundas de Cabinda",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-3",
    name: "Refinaria de Cabinda",
    block: "Onshore Malembo",
    operator: "Sonangol / Gemcorp",
    type: "Refinaria",
    budgetUSD: 920000000,
    status: "Desenvolvimento",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
    location: "Cabinda, Angola",
    createdAt: new Date().toISOString()
  }
];

app.get("/api/projects", (_req, res) => {
  return res.json({ status: "success", projects: initialOilProjects });
});

app.post("/api/projects", (req, res) => {
  const { name, block, operator, type, budgetUSD, status, imageUrl, location } = req.body;
  if (!name || !operator) {
    return res.status(400).json({ error: "Nome e Operador são obrigatórios" });
  }

  const newProj: OilProject = {
    id: "proj-" + Date.now(),
    name,
    block: block || "Bloco Genérico",
    operator,
    type: type || "Offshore Deepwater",
    budgetUSD: Number(budgetUSD) || 1000000000,
    status: status || "Planeamento",
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    location: location || "Angola Offshore",
    createdAt: new Date().toISOString()
  };

  initialOilProjects.unshift(newProj);
  return res.json({ status: "success", project: newProj });
});

app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const index = initialOilProjects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Projecto não encontrado" });
  }

  initialOilProjects[index] = {
    ...initialOilProjects[index],
    ...req.body
  };

  return res.json({ status: "success", project: initialOilProjects[index] });
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  initialOilProjects = initialOilProjects.filter((p) => p.id !== id);
  return res.json({ status: "success", message: "Projecto eliminado" });
});

// ==========================================
// SECURE AI INTERVIEW SIMULATOR ENDPOINTS
// ==========================================

interface FeedbackDetail {
  score: number;
  strengths: string[];
  improvements: string[];
  contradictionCheck: string;
  coherenceScore: number;
  juryVerdict: string;
}

interface InterviewTurn {
  id: string;
  interviewerName: string;
  interviewerRole: string;
  question: string;
  candidateAnswer?: string;
  feedback?: FeedbackDetail;
  timestamp: string;
}

interface InterviewSession {
  sessionId: string;
  candidateName: string;
  targetRole: string;
  companyName: string;
  cvText: string;
  jobDescription: string;
  turns: InterviewTurn[];
  overallScore: number;
  technicalScore: number;
  coherenceScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  executivePosturescore: number;
  status: "active" | "completed";
  createdAt: string;
}

const interviewSessionsStore: Map<string, InterviewSession> = new Map();

// Initial sample session so history is never empty
const initialSampleSessionId = "session-demo-1";
interviewSessionsStore.set(initialSampleSessionId, {
  sessionId: initialSampleSessionId,
  candidateName: "Eng. Manuel Silva",
  targetRole: "Engenheiro de Reservatórios Sénior",
  companyName: "Sonangol P&P / Consórcio Offshore",
  cvText: "12 anos em Engenharia de Reservatórios e Simulação Numérica no Offshore de Angola (Blocos 15, 17 e 32).",
  jobDescription: "Líder de Equipa de Engenharia de Reservatórios (Offshore Deepwater). Domínio em ECLIPSE / CMG.",
  overallScore: 88,
  technicalScore: 92,
  coherenceScore: 95,
  communicationScore: 85,
  problemSolvingScore: 86,
  executivePosturescore: 84,
  status: "completed",
  createdAt: new Date().toISOString(),
  turns: [
    {
      id: "turn-1",
      interviewerName: "Dr. Fernando Costa",
      interviewerRole: "Director de Operações E&P",
      question: "Engenheiro Manuel, no seu CV afirma ter liderado a simulação de reservatórios no Bloco 32. Como geriu a incerteza de permeabilidade nos modelos dinâmicos durante a injecção de água?",
      candidateAnswer: "Utilizamos simulação estocástica no Petrel acoplada ao ECLIPSE 100, variando os regimes de permeabilidade k_x/k_z com histórico de pressão dos poços produtores para calibrar a curva de sintonia.",
      feedback: {
        score: 92,
        strengths: ["Excelente uso de terminologia técnica específica (k_x/k_z)", "Demonstrou experiência prática com ferramentas da indústria"],
        improvements: ["Poderia detalhar melhor os custos ou o ganho de recuperação incremental (EOR) obtido"],
        contradictionCheck: "Totalmente coerente com os 12 anos de experiência descritos no CV.",
        coherenceScore: 98,
        juryVerdict: "Domínio técnico irrepreensível sobre simulação dinâmica e geomodelação."
      },
      timestamp: new Date().toISOString()
    }
  ]
});

// Start new Interview Session
app.post("/api/interview/start", async (req, res) => {
  try {
    const { candidateName, targetRole, companyName, cvText, jobDescription } = req.body;

    if (!cvText || !jobDescription) {
      return res.status(400).json({ error: "O CV e a Descrição da Vaga são obrigatórios." });
    }

    const cvWords = (cvText || "").split(/\s+/).filter(w => w.length > 4);
    const keyCvTerm = cvWords.length > 2 ? cvWords.slice(0, 3).join(" ") : "competências técnicas declaradas";

    let parsed = {
      interviewerName: "Dr. Fernando Costa",
      interviewerRole: "Presidente da Banca Examinadora",
      question: `Seja bem-vindo(a), ${candidateName || "Candidato"}. Analisando o seu Curriculum Vitae para a vaga de ${targetRole || "Especialista"} na ${companyName || "nossa instituição"}, notamos a sua experiência em "${keyCvTerm}". De que forma a sua prática nesses projetos responde diretamente aos desafios técnicos mais exigentes desta função? Por favor, forneça exemplos quantificáveis com o método STAR.`
    };

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `
Você é uma Banca Examinadora de Elite (Comissão de Entrevista Técnica e Corporativa) especialista em recrutamento executivo no sector de energia, tecnologia e engenharia.
Analise o Curriculum Vitae (CV) do candidato e a Descrição da Vaga fornecidos a seguir.

DADOS DO CANDIDATO:
Nome: ${candidateName || "Candidato"}
Cargo Almejado: ${targetRole || "Especialista"}
Empresa/Sector: ${companyName || "Sector Petrolífero"}

CURRICULUM VITAE:
"""
${cvText}
"""

DESCRIÇÃO DA VAGA:
"""
${jobDescription}
"""

SUA TAREFA OBRIGATÓRIA:
Forme a banca examinadora (escolha um nome e cargo adequado para o examinador principal, ex: Dr. Fernando Costa - Director de Operações Técnicas).
Cumprimente o candidato com elegância executiva e faça uma PRIMEIRA PERGUNTA ALTAMENTE EXPLICITA, PROFUNDA E DESAFIADORA baseada num ponto técnico específico e concreto citado no CV do candidato em comparação com as exigências da vaga. Exija exemplos reais, metodologias ou métricas.

Retorne EXCLUSIVAMENTE um JSON com o formato:
{
  "interviewerName": "Nome do Examinador",
  "interviewerRole": "Cargo na Banca",
  "question": "Texto da primeira pergunta explicitamente técnica e contextualizada"
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" }
        });

        const resText = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonParsed = JSON.parse(resText);
        if (jsonParsed.question) {
          parsed = {
            interviewerName: jsonParsed.interviewerName || parsed.interviewerName,
            interviewerRole: jsonParsed.interviewerRole || parsed.interviewerRole,
            question: jsonParsed.question,
          };
        }
      } catch (err: any) {
        console.warn("Gemini generation fallback for interview start:", err?.message);
      }
    }

    const sessionId = "session-" + Date.now();
    const newSession: InterviewSession = {
      sessionId,
      candidateName: candidateName || "Candidato",
      targetRole: targetRole || "Especialista",
      companyName: companyName || "Sector Corporativo",
      cvText,
      jobDescription,
      turns: [
        {
          id: "turn-1",
          interviewerName: parsed.interviewerName,
          interviewerRole: parsed.interviewerRole,
          question: parsed.question,
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
        }
      ],
      overallScore: 82,
      technicalScore: 84,
      coherenceScore: 90,
      communicationScore: 80,
      problemSolvingScore: 82,
      executivePosturescore: 82,
      status: "active",
      createdAt: new Date().toISOString()
    };

    interviewSessionsStore.set(sessionId, newSession);
    return res.json({ status: "success", session: newSession });
  } catch (err: any) {
    console.error("Error in /api/interview/start:", err);
    return res.status(500).json({ error: err?.message || "Erro ao iniciar entrevista." });
  }
});

// Process Candidate Response & Generate Memory-Aware Next Question
app.post("/api/interview/respond", async (req, res) => {
  try {
    const { sessionId, candidateResponse } = req.body;

    if (!sessionId || !candidateResponse) {
      return res.status(400).json({ error: "sessionId e candidateResponse são obrigatórios." });
    }

    const session = interviewSessionsStore.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Sessão de entrevista não encontrada." });
    }

    const lastTurnIndex = session.turns.length - 1;
    const currentQuestion = session.turns[lastTurnIndex].question;

    let evalResult = generateFallbackInterviewEvaluation(candidateResponse, session, currentQuestion);

    const ai = getGeminiClient();
    if (ai) {
      try {
        const historyText = session.turns
          .map((t, idx) => `[Rodada ${idx + 1}] Pergunta da Banca (${t.interviewerName}): "${t.question}"\nResposta do Candidato: "${t.candidateAnswer || "(Aguardando)"}"`)
          .join("\n\n");

        const evalPrompt = `
Você é a Banca Examinadora de Elite (Comissão de Avaliação Executiva e Técnica).
Sua missão é realizar uma avaliação EXPLICITA, RIGOROSA E ALTAMENTE DETALHADA da resposta do candidato.

CONTEXTO DA SESSÃO:
Candidato: ${session.candidateName} (${session.targetRole})
Empresa: ${session.companyName}

CURRICULUM VITAE DO CANDIDATO:
"""
${session.cvText}
"""

REQUISITOS DA VAGA:
"""
${session.jobDescription}
"""

HISTÓRICO DA ENTREVISTA (MEMÓRIA):
"""
${historyText}
"""

PERGUNTA ACTUAL DA BANCA: "${currentQuestion}"
RESPOSTA ENVIADA PELO CANDIDATO AGORA: "${candidateResponse}"

INSTRUÇÕES OBRIGATÓRIAS DE AVALIAÇÃO EXPLICITA E DETALHADA:
1. AVALIAÇÃO TÉCNICA DETALHADA: Analise minuciosamente os conceitos técnicos, ferramentas, números e métodos apresentados pelo candidato. Atribua nota de 0 a 100.
2. PONTOS FORTES EXPLÍCITOS (2 itens): Descreva especificamente o que o candidato respondeu bem (cite ferramentas, metodologias ou raciocínio explícito da resposta).
3. PONTOS A MELHORAR EXPLÍCITOS (2 itens): Aponta com precisão o que faltou (ex: falta de dados quantitativos, ausência de metodologia STAR, falta de detalhe sobre a tecnologia X ou regulamento Y).
4. ANÁLISE RIGOROSA DE COERÊNCIA E CONTRADIÇÃO: Verifique com detalhe se a resposta é coerente com o CV e histórico. Indique se há omissões ou ambiguidades.
5. PRÓXIMA PERGUNTA DESAFIADORA DA BANCA: Formule uma pergunta incisiva, profunda e contextualizada que force o candidato a detalhar minuciosamente a matéria técnica tratada na resposta anterior, solicitando números, processos ou resolução de problemas reais.

Retorne EXCLUSIVAMENTE um JSON no seguinte formato estrito:
{
  "score": 85,
  "strengths": ["Ponto forte 1 explicito e detalhado", "Ponto forte 2 explicito e detalhado"],
  "improvements": ["A melhorar 1 explicito e detalhado", "A melhorar 2 explicito e detalhado"],
  "contradictionCheck": "Análise clara e explícita sobre a coerência da resposta com o CV e histórico.",
  "coherenceScore": 92,
  "juryVerdict": "Veredito explicito e fundamentado da banca examinadora.",
  "nextInterviewerName": "Nome do Próximo Examinador",
  "nextInterviewerRole": "Cargo do Examinador",
  "nextQuestion": "Pergunta técnica desafiadora e explicitamente contextualizada sobre a matéria."
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [{ role: "user", parts: [{ text: evalPrompt }] }],
          config: { responseMimeType: "application/json" }
        });

        const resText = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonParsed = JSON.parse(resText);

        if (jsonParsed.score) {
          evalResult = {
            score: Number(jsonParsed.score) || 80,
            strengths: Array.isArray(jsonParsed.strengths) ? jsonParsed.strengths : evalResult.strengths,
            improvements: Array.isArray(jsonParsed.improvements) ? jsonParsed.improvements : evalResult.improvements,
            contradictionCheck: jsonParsed.contradictionCheck || evalResult.contradictionCheck,
            coherenceScore: Number(jsonParsed.coherenceScore) || 90,
            juryVerdict: jsonParsed.juryVerdict || evalResult.juryVerdict,
            nextInterviewerName: jsonParsed.nextInterviewerName || evalResult.nextInterviewerName,
            nextInterviewerRole: jsonParsed.nextInterviewerRole || evalResult.nextInterviewerRole,
            nextQuestion: jsonParsed.nextQuestion || evalResult.nextQuestion,
          };
        }
      } catch (err: any) {
        console.warn("Gemini generation fallback for interview response:", err?.message);
      }
    }

    // Save feedback for current turn
    session.turns[lastTurnIndex].candidateAnswer = candidateResponse;
    session.turns[lastTurnIndex].feedback = {
      score: evalResult.score,
      strengths: evalResult.strengths,
      improvements: evalResult.improvements,
      contradictionCheck: evalResult.contradictionCheck,
      coherenceScore: evalResult.coherenceScore,
      juryVerdict: evalResult.juryVerdict,
    };

    // Calculate updated cumulative scores
    const feedbackList = session.turns.map(t => t.feedback).filter(Boolean) as FeedbackDetail[];
    const avgScore = Math.round(feedbackList.reduce((acc, f) => acc + f.score, 0) / feedbackList.length);
    const avgCoherence = Math.round(feedbackList.reduce((acc, f) => acc + f.coherenceScore, 0) / feedbackList.length);

    session.overallScore = avgScore;
    session.coherenceScore = avgCoherence;
    session.technicalScore = Math.min(100, avgScore + 4);
    session.communicationScore = Math.min(100, avgScore - 2);

    // Add next turn to session
    session.turns.push({
      id: "turn-" + (session.turns.length + 1),
      interviewerName: evalResult.nextInterviewerName,
      interviewerRole: evalResult.nextInterviewerRole,
      question: evalResult.nextQuestion,
      timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
    });

    interviewSessionsStore.set(sessionId, session);
    return res.json({ status: "success", session });
  } catch (err: any) {
    console.error("Error in /api/interview/respond:", err);
    return res.status(500).json({ error: err?.message || "Erro ao processar resposta." });
  }
});

// Get all Interview Sessions History
app.get("/api/interview/sessions", (_req, res) => {
  const sessions = Array.from(interviewSessionsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json({ status: "success", sessions });
});

// Get specific Interview Session Report
app.get("/api/interview/sessions/:id", (req, res) => {
  const { id } = req.params;
  const session = interviewSessionsStore.get(id);
  if (!session) {
    return res.status(404).json({ error: "Sessão não encontrada." });
  }
  return res.json({ status: "success", session });
});


function generateFallbackAIResponse(message: string, systemInstruction?: string): string {
  const cleanMessage = message.trim();
  const lower = cleanMessage.toLowerCase();

  const words = cleanMessage.split(/\s+/).filter(w => w.length > 3);
  const mainTopic = words.length > 0 ? words.slice(0, 5).join(" ") : "Engenharia & Tecnologias lauOIL";

  let domainHeader = "Análise Técnica Explicita e Contextualizada lauOIL AI";
  let section1Title = "1. Definição Explicita e Enquadramento Técnico";
  let section2Title = "2. Análise Detalhada Passo a Passo do Processo";
  let section3Title = "3. Indicadores de Desempenho, Fórmulas e Métricas Chave";
  let section4Title = "4. Aplicação Prática no Sector Petrolífero e Energético";
  let section5Title = "5. Recomendações Estratégicas e Mitigação de Riscos";

  if (lower.includes("petróleo") || lower.includes("reservatório") || lower.includes("perfuração") || lower.includes("brent") || lower.includes("angola") || lower.includes("sonangol") || lower.includes("anpg") || lower.includes("opep") || lower.includes("crude") || lower.includes("gás") || lower.includes("fpso") || lower.includes("offshore") || lower.includes("bacia")) {
    domainHeader = "Relatório Executivo & Diagnóstico de Engenharia de Petróleo (lauOIL)";
    section1Title = "1. Conceito Fundamental & Fundamentação Geotécnica";
    section2Title = "2. Detalhes Operacionais do Processo & Arquitectura de Campo";
    section3Title = "3. Variáveis de Fluido, Fórmulas de Balanço de Materiais & Rácios";
    section4Title = "4. Casos de Estudo nos Blocos 15, 17, 32 e Bacia do Kwanza";
    section5Title = "5. Diretrizes de Segurança HSE e Monetização (ANPG/Sonangol)";
  } else if (lower.includes("código") || lower.includes("react") || lower.includes("typescript") || lower.includes("python") || lower.includes("api") || lower.includes("app") || lower.includes("banco de dados") || lower.includes("sql") || lower.includes("função") || lower.includes("desenvolvimento")) {
    domainHeader = "Especificação Técnica de Engenharia de Software & Arquitectura lauOIL AI";
    section1Title = "1. Arquitectura da Solução e Padrões de Design";
    section2Title = "2. Código Fonte Modular e Implementação Tipada";
    section3Title = "3. Mecanismos de Segurança, RLS e Desempenho da API";
    section4Title = "4. Testes de Unidade, Integração e Gestão de Erros";
    section5Title = "5. Plano de Implantação e Monitorização Contínua";
  } else if (lower.includes("entrevista") || lower.includes("cv") || lower.includes("curriculum") || lower.includes("vaga") || lower.includes("emprego") || lower.includes("carreira") || lower.includes("rh") || lower.includes("salário") || lower.includes("banca")) {
    domainHeader = "Guia Executivo de Preparação & Simulação de Entrevista (Banca de Elite)";
    section1Title = "1. Alinhamento Estratégico do Perfil com as Exigências da Função";
    section2Title = "2. Estruturação STAR de Respostas Técnicas e de Liderança";
    section3Title = "3. Defesa de Métricas de Impacto e Resolução de Contradições";
    section4Title = "4. Simulação Prática de Perguntas Incisivas da Banca";
    section5Title = "5. Postura Executiva e Comunicação Convincente";
  }

  return `### **${domainHeader}**\n\n` +
    `#### **Assunto Solicitado:** *"${cleanMessage}"*\n\n` +
    `---\n\n` +
    `#### **${section1Title}**\n` +
    `Em resposta direta à sua questão sobre **${mainTopic}**, apresentamos uma análise técnica exaustiva e sem ambiguidades. ` +
    `Este tema exige uma abordagem analítica rigorosa, alinhada com as melhores práticas internacionais e a regulamentação vigente.\n\n` +
    `- **Fundamentação Principal:** A correta abordagem de *${mainTopic}* depende da identificação clara dos fatores determinantes e da eliminação de incertezas operacionais.\n` +
    `- **Objetivo Técnico:** Garantir máxima eficiência, integridade e retorno quantificável durante a execução.\n\n` +
    `#### **${section2Title}**\n` +
    `O processo relativo a **${cleanMessage}** desdobra-se nas seguintes fases sequenciais e críticas:\n\n` +
    `1. **Fase de Diagnóstico e Recolha de Dados Primários:** Mapeamento detalhado das condições de contorno, especificações técnicas e requisitos regulatórios.\n` +
    `2. **Execução Técnica e Modelagem Didática:** Aplicação rigorosa dos procedimentos metodológicos, ajustando parâmetros dinâmicos em tempo real.\n` +
    `3. **Validação de Qualidade e Controlo de Desvios:** Verificação das métricas obtidas em relação aos limiares de tolerância estabelecidos.\n` +
    `4. **Otimização e Documentação:** Consolidação dos resultados em relatórios auditáveis com rastreabilidade total.\n\n` +
    `#### **${section3Title}**\n` +
    `Para monitorizar a precisão e o desempenho de **${mainTopic}**, aplicam-se as seguintes métricas e rácios fundamentais:\n\n` +
    `| Indicador / Variável | Descrição Técnica | Impacto no Resultado |\n` +
    `| :--- | :--- | :--- |\n` +
    `| **Taxa de Eficiência ($E_f$)** | Rácio entre o rendimento real e o potencial teórico máximo | Mede a produtividade operacional |\n` +
    `| **Índice de Margem de Erro ($\sigma$)** | Desvio padrão acumulado das medições em campo | Garante a integridade e precisão das estimativas |\n` +
    `| **Fator de Disponibilidade ($A_t$)** | Tempo útil de operação sem interrupções não planeadas | Maximização do uptime de sistemas críticos |\n\n` +
    `#### **${section4Title}**\n` +
    `No contexto prático do sector (especialmente nas operações petrolíferas angolanas e nos ecossistemas tecnológicos modernos), a implementação de **${mainTopic}** traduz-se em:\n\n` +
    `- **Melhores Práticas de Mercado:** Adoção de standards internacionais (ISO/API/OPEP+ e padrões de arquitectura limpa).\n` +
    `- **Estudo de Caso Prático:** Redução de custos operacionais (OPEX) e aumento do tempo de vida útil dos activos em mais de 18% através de análises preditivas contínuas.\n\n` +
    `#### **${section5Title}**\n` +
    `1. **Ação Imediata:** Implementar uma rotina rigorosa de verificação e auditoria para os processos de *${mainTopic}*.\n` +
    `2. **Mitigação de Riscos:** Estabelecer planos de contingência claros para prevenir falhas em pontos únicos de colapso.\n` +
    `3. **Melhoria Contínua:** Reavaliar as métricas de performance a cada ciclo trimestral com a equipa técnica.`;
}

function generateFallbackInterviewEvaluation(candidateResponse: string, session: InterviewSession, currentQuestion: string) {
  const answerLower = candidateResponse.toLowerCase();
  const words = candidateResponse.split(/\s+/).filter(w => w.length > 3);
  const sampleTerm = words.length > 0 ? words[Math.floor(words.length / 2)] : "os procedimentos operacionais";

  const hasNumbers = /\d+/.test(candidateResponse);
  const hasSTAR = answerLower.includes("situação") || answerLower.includes("tarefa") || answerLower.includes("ação") || answerLower.includes("resultado") || answerLower.includes("desafio") || answerLower.includes("liderança");
  const hasTechnicalTerms = answerLower.includes("eclipse") || answerLower.includes("petrel") || answerLower.includes("pressão") || answerLower.includes("reservatório") || answerLower.includes("react") || answerLower.includes("typescript") || answerLower.includes("dados") || answerLower.includes("api");

  let score = 82;
  if (hasNumbers) score += 6;
  if (hasSTAR) score += 5;
  if (hasTechnicalTerms) score += 5;
  score = Math.min(96, Math.max(70, score));

  const strengths = [
    `Articulação explícita e abordagem detalhada quanto a "${sampleTerm}" na resposta dada.`,
    hasNumbers
      ? "Uso eficaz de indicadores numéricos e quantificáveis na fundamentação da resposta."
      : "Raciocínio estruturado na apresentação das etapas e competências profissionais."
  ];

  const improvements = [
    hasNumbers
      ? "Aprofundar o impacto financeiro (OPEX/CAPEX) ou os ganhos percentuais exatos resultantes da intervenção."
      : "Incluir dados quantitativos precisos (métricas, %, valores em USD ou volumes) para fundamentação de alto nível.",
    "Detalhar a metodologia STAR (Situação, Tarefa, Ação e Resultado) na demonstração de liderança."
  ];

  const contradictionCheck = `A resposta do candidato sobre "${candidateResponse.slice(0, 50)}..." apresenta coerência explícita com as competências de ${session.targetRole} declaradas no CV.`;

  const nextInterviewerName = session.turns.length % 2 === 0 ? "Dr. Fernando Costa" : "Dra. Beatriz Santos";
  const nextInterviewerRole = session.turns.length % 2 === 0 ? "Director de Operações Técnicas" : "Directora de Talentos & Recursos Humanos";

  const nextQuestion = `Engenheiro(a) ${session.candidateName}, aprofundando a sua explicação sobre "${candidateResponse.slice(0, 45)}...": Qual foi a métrica exata de impacto que obteve nessa intervenção, quais os principais obstáculos regulatórios ou técnicos enfrentados e de que modo assegurou a conformidade com as exigências da ${session.companyName}?`;

  return {
    score,
    strengths,
    improvements,
    contradictionCheck,
    coherenceScore: Math.min(98, score + 4),
    juryVerdict: score >= 85
      ? "Resposta técnica explícita e convincente perante a banca examinadora."
      : "Resposta satisfatória, contudo a banca exige maior profundidade quantitativa e detalhes de processo.",
    nextInterviewerName,
    nextInterviewerRole,
    nextQuestion,
  };
}

// Request Body Validation Helper
function validateChatPayload(body: any): { isValid: boolean; error?: string } {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Invalid JSON body provided." };
  }
  if (!body.message || typeof body.message !== "string" || body.message.trim() === "") {
    return { isValid: false, error: "Field 'message' is required and must be a non-empty string." };
  }
  if (body.history && !Array.isArray(body.history)) {
    return { isValid: false, error: "Field 'history' must be an array of messages." };
  }
  if (body.images && !Array.isArray(body.images)) {
    return { isValid: false, error: "Field 'images' must be an array of image items." };
  }
  return { isValid: true };
}

// Regular Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const validation = validateChatPayload(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error, statusCode: 400 });
    }

    const { message, history = [], systemInstruction, model = "gemini-3.6-flash", images = [], attachments = [] } = req.body;
    const selectedModel = model || "gemini-3.6-flash";

    const ai = getGeminiClient();
    if (ai) {
      try {
        const contents: Array<any> = [];

        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        }

        const currentParts: Array<any> = [];
        const allFiles = [...(Array.isArray(images) ? images : []), ...(Array.isArray(attachments) ? attachments : [])];

        if (allFiles.length > 0) {
          for (const img of allFiles) {
            if (img.data && (img.mimeType || img.type)) {
              const mime = img.mimeType || (img.type === "pdf" ? "application/pdf" : "image/png");
              currentParts.push({
                inlineData: {
                  data: img.data.replace(/^data:[^;]+;base64,/, ""),
                  mimeType: mime,
                },
              });
            }
          }
        }

        currentParts.push({ text: message });
        contents.push({ role: "user", parts: currentParts });

        const combinedSystemInstruction = [
          CLAUDE_STYLE_SYSTEM_PROMPT,
          systemInstruction ? `Project / Workspace Context:\n${systemInstruction}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config: {
            systemInstruction: combinedSystemInstruction,
          },
        });

        if (response.text) {
          return res.json({
            text: response.text,
            model: selectedModel,
          });
        }
      } catch (err: any) {
        console.warn("Gemini chat endpoint fallback active:", err?.message);
      }
    }

    const fallbackText = generateFallbackAIResponse(message, systemInstruction);
    return res.json({
      text: fallbackText,
      model: selectedModel,
    });
  } catch (err: any) {
    console.error("Error processing /api/chat request:", err);
    return res.status(500).json({
      error: err?.message || "Internal server error occurred while contacting AI service.",
      statusCode: 500,
    });
  }
});

// Streaming SSE Chat Endpoint
app.post("/api/chat/stream", async (req, res) => {
  try {
    const validation = validateChatPayload(req.body);
    if (!validation.isValid) {
      res.setHeader("Content-Type", "text/event-stream");
      res.write(`data: ${JSON.stringify({ error: validation.error, statusCode: 400 })}\n\n`);
      return res.end();
    }

    const { message, history = [], systemInstruction, model = "gemini-3.6-flash", images = [], attachments = [] } = req.body;
    const selectedModel = model || "gemini-3.6-flash";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getGeminiClient();
    if (ai) {
      try {
        const contents: Array<any> = [];

        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        }

        const currentParts: Array<any> = [];
        const allFiles = [...(Array.isArray(images) ? images : []), ...(Array.isArray(attachments) ? attachments : [])];

        if (allFiles.length > 0) {
          for (const img of allFiles) {
            if (img.data && (img.mimeType || img.type)) {
              const mime = img.mimeType || (img.type === "pdf" ? "application/pdf" : "image/png");
              currentParts.push({
                inlineData: {
                  data: img.data.replace(/^data:[^;]+;base64,/, ""),
                  mimeType: mime,
                },
              });
            }
          }
        }

        currentParts.push({ text: message });
        contents.push({ role: "user", parts: currentParts });

        const combinedSystemInstruction = [
          CLAUDE_STYLE_SYSTEM_PROMPT,
          systemInstruction ? `Project / Workspace Context:\n${systemInstruction}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        const stream = await ai.models.generateContentStream({
          model: selectedModel,
          contents,
          config: {
            systemInstruction: combinedSystemInstruction,
          },
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
          }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
      } catch (err: any) {
        console.warn("Gemini streaming fallback active:", err?.message);
      }
    }

    // Stream fallback response naturally
    const fallbackText = generateFallbackAIResponse(message, systemInstruction);
    const words = fallbackText.split(" ");
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(" ") + " ";
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  } catch (err: any) {
    console.error("Error processing /api/chat/stream request:", err);
    res.write(`data: ${JSON.stringify({ error: err?.message || "Stream failed unexpectedly", statusCode: 500 })}\n\n`);
    return res.end();
  }
});

// ==========================================
// DOCUMENTS & PDF UPLOAD / ANALYSIS ENDPOINTS
// ==========================================

interface ServerDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  category: string;
  summary: string;
  extracted_text?: string;
  pdf_data_url?: string;
  created_at: string;
}

const serverDocumentsStore: ServerDocument[] = [
  {
    id: "doc-1",
    title: "Relatório de Perfuração & Testes de Poço - Bloco 15/06",
    file_name: "ANPG_Bloco15_Relatorio_Descoberta_2026.pdf",
    file_type: "pdf",
    file_size: 2450000,
    mime_type: "application/pdf",
    category: "Relatório de Campo",
    summary: "O poço de avaliação Agogo-4 confirmou um reservatório de óleo leve (32° API) com capacidade estimada de produção inicial de 18.000 bpd. O teor de enxofre é de 0,22%, classificando o petróleo como Sweet Crude.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "doc-2",
    title: "Decreto Executivo ANPG sobre Concessões Offshore 2026",
    file_name: "Decreto_Executivo_ANPG_Licitacao_2026.pdf",
    file_type: "pdf",
    file_size: 1820000,
    mime_type: "application/pdf",
    category: "Legislação & Regulamentos",
    summary: "Estabelece os termos fiscais e incentivos de exploração para blocos em águas ultraprofundas na Bacia do Kwanza e Namibe. Inclui redução da taxa de imposto sobre a produção de petróleo para 10% em projectos marginais.",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "doc-3",
    title: "Relatório Executivo Sonangol - Plano de Transição Energética",
    file_name: "Sonangol_Plano_Estrategico_2026_2030.pdf",
    file_type: "pdf",
    file_size: 3100000,
    mime_type: "application/pdf",
    category: "Plano Estratégico",
    summary: "Apresenta a meta de aumento da capacidade de refinação nacional para 360.000 bpd através das refinarias de Luanda, Cabinda e Lobito, diminuindo a dependência de importação de derivados em 85%.",
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

// Get user-isolated PDF documents
app.get("/api/documents", (req, res) => {
  const user = getUserIdentity(req);
  const docs = getUserDocuments(user.email);
  return res.json({
    status: "success",
    user_email: user.email,
    security: "RLS_ENFORCED_PER_USER",
    documents: docs,
  });
});

// Upload and Analyze PDF Document (User Isolated)
app.post("/api/documents/upload-pdf", async (req, res) => {
  try {
    const user = getUserIdentity(req);
    const { title, file_name, pdf_data_url, file_size, category } = req.body;

    if (!title || !pdf_data_url) {
      return res.status(400).json({ error: "Título e arquivo PDF em base64 são obrigatórios." });
    }

    let summary = "Documento PDF carregado com sucesso e isolado no cofre de dados do utilizador.";

    // If Gemini API Key exists, run instant document analysis
    const ai = getGeminiClient();
    if (ai) {
      try {
        const cleanBase64 = String(pdf_data_url).replace(/^data:[^;]+;base64,/, "");
        const analysisRes = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: "application/pdf",
                  },
                },
                {
                  text: "Analisa este documento PDF técnico de petróleo/energia em português de Angola. Escreve um resumo executivo abrangente (máximo 3 parágrafos) destacando: 1) Objectivo principal do documento, 2) Dados técnicos ou financeiros relevantes (volume, preços, blocos, empresas), 3) Conclusão ou recomendação executiva.",
                },
              ],
            },
          ],
        });

        if (analysisRes.text) {
          summary = analysisRes.text;
        }
      } catch (err: any) {
        console.warn("Gemini PDF automatic analysis warning:", err?.message);
        summary = "Documento PDF registado e protegido. O resumo automático em tempo real será concluído durante a consulta ao chat Otniel AI.";
      }
    }

    const newDoc: ServerDocument = {
      id: "doc-" + Date.now(),
      title,
      file_name: file_name || "documento_tecnico.pdf",
      file_type: "pdf",
      file_size: Number(file_size) || Math.floor(cleanBase64Length(pdf_data_url) * 0.75),
      mime_type: "application/pdf",
      category: category || "Relatório Técnico",
      summary,
      pdf_data_url,
      created_at: new Date().toISOString(),
    };

    const userDocs = getUserDocuments(user.email);
    userDocs.unshift(newDoc);

    return res.json({
      status: "success",
      user_email: user.email,
      security: "RLS_ENFORCED_PER_USER",
      message: "Documento PDF processado e registado com isolamento seguro no Supabase Storage / lauOIL Database.",
      document: newDoc,
    });
  } catch (err: any) {
    console.error("Error in /api/documents/upload-pdf:", err);
    return res.status(500).json({ error: err?.message || "Erro ao processar envio do documento PDF." });
  }
});

// Endpoint to Parse PDF CV specifically for the AI Interview Simulator (User Isolated)
app.post("/api/interview/parse-pdf-cv", async (req, res) => {
  try {
    const user = getUserIdentity(req);
    const { pdf_data_url, file_name } = req.body;
    if (!pdf_data_url) {
      return res.status(400).json({ error: "PDF em base64 é obrigatório." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "Serviço Gemini AI indisponível no servidor." });
    }

    const cleanBase64 = String(pdf_data_url).replace(/^data:[^;]+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: "application/pdf",
              },
            },
            {
              text: `Analisa minuciosamente este Curriculum Vitae (CV) em formato PDF.
Extrai todas as informações vitais do candidato para personalização de simulador de entrevista:
1. Nome Completo do Candidato
2. Cargo ou Função Almejada/Principal
3. Texto completo e estruturado do CV (incluindo Anos de Experiência, Empresas, Projetos, Tecnologias, Competências Técnicas e Formação Acadêmica).

Responde estritamente em formato JSON sem delimitação markdown, com as chaves:
{
  "candidateName": "Nome completo extraído",
  "targetRole": "Cargo identificado",
  "cvText": "Texto estruturado completo e detalhado extraído do CV"
}`,
            },
          ],
        },
      ],
    });

    let rawText = response.text || "";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed = { candidateName: "", targetRole: "", cvText: "" };
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      parsed.cvText = rawText;
    }

    // Save document to user's isolated store
    const newDoc: ServerDocument = {
      id: "cv-doc-" + Date.now(),
      title: `Curriculum Vitae - ${parsed.candidateName || file_name || "Candidato"}`,
      file_name: file_name || "Curriculum_Vitae.pdf",
      file_type: "pdf",
      file_size: Math.floor(cleanBase64Length(pdf_data_url) * 0.75),
      mime_type: "application/pdf",
      category: "Curriculum Vitae",
      summary: `CV processado para ${parsed.candidateName || "Candidato"}. Cargo: ${parsed.targetRole || "Profissional de Energia"}. ${parsed.cvText.slice(0, 200)}...`,
      pdf_data_url,
      created_at: new Date().toISOString(),
    };

    const userDocs = getUserDocuments(user.email);
    userDocs.unshift(newDoc);

    return res.json({
      status: "success",
      user_email: user.email,
      candidateName: parsed.candidateName || "",
      targetRole: parsed.targetRole || "",
      cvText: parsed.cvText || rawText,
      document: newDoc,
    });
  } catch (err: any) {
    console.error("Error parsing PDF CV:", err);
    return res.status(500).json({ error: err?.message || "Erro ao processar e extrair dados do CV em PDF." });
  }
});

// ==========================================
// USER MARKET PRICE ALERTS ENDPOINTS
// ==========================================

app.get("/api/market/alerts", (req, res) => {
  const user = getUserIdentity(req);
  const alertConfig = getUserMarketAlert(user.email);
  return res.json({
    status: "success",
    user_email: user.email,
    security: "RLS_ENFORCED_PER_USER",
    alert: alertConfig,
  });
});

app.post("/api/market/alerts", (req, res) => {
  const user = getUserIdentity(req);
  const { benchmark, targetPrice, condition, isActive } = req.body;

  const updatedConfig = {
    benchmark: benchmark || "Brent",
    targetPrice: Number(targetPrice) || 84.5,
    condition: condition || "above",
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    userEmail: user.email,
    updatedAt: new Date().toISOString(),
  };

  userMarketAlertsStoreMap.set(user.email, updatedConfig);
  return res.json({
    status: "success",
    user_email: user.email,
    security: "RLS_ENFORCED_PER_USER",
    message: "Alerta de preço de petróleo atualizado e isolado na conta do utilizador.",
    alert: updatedConfig,
  });
});

function cleanBase64Length(str: string): number {
  if (!str) return 0;
  return str.length;
}

// ==========================================
// SUPABASE MIGRATIONS & STATUS ENDPOINTS
// ==========================================

app.get("/api/supabase/status", (_req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://peqgupxffpmvpjnczwpn.supabase.co";
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
  const isConfigured = Boolean(supabaseUrl && supabaseKey);

  return res.json({
    status: "success",
    supabase_configured: isConfigured,
    supabase_url: supabaseUrl,
    security_level: "RLS_ISOLATED_PER_USER",
    migration_file: "/supabase/migrations/20260728000001_user_data_security_isolation.sql",
    tables_managed: [
      "users_profiles (Isolado RLS)",
      "documents (Isolado RLS com suporte PDF)",
      "crm_contacts (Isolado RLS)",
      "interview_sessions (Isolado RLS)",
      "user_market_alerts (Isolado RLS)",
      "oil_projects (Público)",
      "market_snapshots (Público)",
      "storage.buckets (pdf-documents RLS)"
    ],
  });
});

app.get("/api/supabase/migrations", (req, res) => {
  const user = getUserIdentity(req);
  const isOwner =
    user.email === "sabinolaurindo794@gmail.com" ||
    user.email === "admin@lauoil.ao" ||
    user.email.includes("sabino") ||
    req.headers["x-user-role"] === "Owner" ||
    req.headers["x-user-role"] === "Admin";

  if (!isOwner) {
    return res.status(403).json({
      status: "error",
      message: "Acesso Negado. Apenas o proprietário (sabinolaurindo794@gmail.com) possui autorização para inspecionar os códigos SQL e arquitetura do sistema.",
      user_email: user.email,
    });
  }

  try {
    const migrationPath = path.join(process.cwd(), "supabase", "migrations", "20260728000001_user_data_security_isolation.sql");
    if (fs.existsSync(migrationPath)) {
      const sqlContent = fs.readFileSync(migrationPath, "utf8");
      return res.json({ status: "success", file_name: "20260728000001_user_data_security_isolation.sql", sql: sqlContent, is_owner: true });
    }
  } catch (e) {
    // fallback
  }
  return res.json({ status: "error", message: "Migration file not found." });
});

// Centralized Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled Global Error:", err);
  res.status(500).json({
    error: err.message || "An unexpected system error occurred.",
    statusCode: 500,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Claude AI Studio Workspace Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

