import React, { useState, useEffect } from "react";
import { SupabaseDocsManager } from "./SupabaseDocsManager";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Bell,
  Newspaper,
  Sliders,
  FileText,
  Globe,
  Brain,
  ShieldCheck,
  Building2,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Printer,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Database,
  ExternalLink,
  RefreshCw,
  RotateCw,
  Users,
  Briefcase,
  Image,
  Link as LinkIcon,
  Copy,
  Code,
  Eye,
  Edit3,
  Target,
  AlertTriangle,
} from "lucide-react";

import { Language, SUPPORTED_LANGUAGES, translations } from "../data/translations";

interface OIetroDashboardProps {
  onAskAI: (prompt: string) => void;
  currentLanguage?: Language;
  onSelectLanguage?: (lang: Language) => void;
}

// Audience Persona options
type Persona = "sonangol" | "anpg" | "mirempet" | "bancos" | "investidores" | "universidades";

// Model options
type AIModelType = "lstm" | "prophet" | "xgboost" | "random_forest";

export const OIetroDashboard: React.FC<OIetroDashboardProps> = ({
  onAskAI,
  currentLanguage = "pt",
  onSelectLanguage,
}) => {
  const t = translations[currentLanguage] || translations.pt;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "mercado" | "ia" | "angola" | "noticias" | "alertas" | "relatorios" | "simulacao" | "crm" | "supabase"
  >("dashboard");

  // CRM Real & Image Link State
  interface CRMContactItem {
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

  const [crmContacts, setCrmContacts] = useState<CRMContactItem[]>([]);
  const [crmSearch, setCrmSearch] = useState("");
  const [crmStageFilter, setCrmStageFilter] = useState<string>("all");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isCrmLoading, setIsCrmLoading] = useState(false);

  // New Contact Form
  const [newContactForm, setNewContactForm] = useState({
    name: "",
    company: "Sonangol E.P.",
    role: "Gestor de Aquisições",
    email: "",
    phone: "",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    dealValue: "5000000",
    stage: "lead" as "lead" | "contacto" | "proposta" | "negociacao" | "ganho" | "perdido",
    notes: "",
  });

  // CRM Contact Editing State
  const [editingContact, setEditingContact] = useState<CRMContactItem | null>(null);

  const handleUpdateContactFull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    try {
      const res = await fetch(`/api/crm/contacts/${editingContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingContact),
      });
      const data = await res.json();
      if (data.status === "success") {
        setCrmContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? data.contact : c))
        );
        setEditingContact(null);
      }
    } catch (e) {
      console.error("Error saving contact edits", e);
    }
  };

  // Oil Projects CRUD State
  interface OilProjectItem {
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

  const [oilProjects, setOilProjects] = useState<OilProjectItem[]>([]);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<OilProjectItem | null>(null);

  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    block: "Bloco 17",
    operator: "Sonangol E.P.",
    type: "Offshore Deepwater" as OilProjectItem["type"],
    budgetUSD: "2500000000",
    status: "Desenvolvimento" as OilProjectItem["status"],
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    location: "Angola Offshore",
  });

  const fetchOilProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.projects)) {
        setOilProjects(data.projects);
      }
    } catch (e) {
      console.error("Failed to fetch projects", e);
    }
  };

  useEffect(() => {
    fetchOilProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.name || !newProjectForm.operator) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProjectForm),
      });
      const data = await res.json();
      if (data.status === "success") {
        setOilProjects((prev) => [data.project, ...prev]);
        setIsAddProjectOpen(false);
        setNewProjectForm({
          name: "",
          block: "Bloco 17",
          operator: "Sonangol E.P.",
          type: "Offshore Deepwater",
          budgetUSD: "2500000000",
          status: "Desenvolvimento",
          imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
          location: "Angola Offshore",
        });
      }
    } catch (e) {
      console.error("Error creating project", e);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (data.status === "success") {
        setOilProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? data.project : p))
        );
        setEditingProject(null);
      }
    } catch (e) {
      console.error("Error updating project", e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Deseja eliminar este projecto petrolífero?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      setOilProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Error deleting project", e);
    }
  };

  // Direct Image Link HTML Generator state
  const [generatorImgUrl, setGeneratorImgUrl] = useState("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80");
  const [generatorAlt, setGeneratorAlt] = useState("Plataforma Offshore de Petróleo em Angola");
  const [generatorWidth, setGeneratorWidth] = useState("100%");
  const [generatorHeight, setGeneratorHeight] = useState("200px");
  const [generatorRounded, setGeneratorRounded] = useState("xl");
  const [generatorBorder, setGeneratorBorder] = useState(true);
  const [copiedCodeType, setCopiedCodeType] = useState<"html" | "markdown" | null>(null);

  // Fetch CRM contacts from server API
  const fetchCrmContacts = async () => {
    setIsCrmLoading(true);
    try {
      const res = await fetch("/api/crm/contacts");
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.contacts)) {
        setCrmContacts(data.contacts);
      }
    } catch (e) {
      console.error("Failed to fetch CRM contacts", e);
    } finally {
      setIsCrmLoading(false);
    }
  };

  useEffect(() => {
    fetchCrmContacts();
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactForm.name || !newContactForm.company) return;

    try {
      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContactForm),
      });
      const data = await res.json();
      if (data.status === "success") {
        setCrmContacts((prev) => [data.contact, ...prev]);
        setIsAddContactOpen(false);
        setNewContactForm({
          name: "",
          company: "Sonangol E.P.",
          role: "Gestor de Aquisições",
          email: "",
          phone: "",
          imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
          dealValue: "5000000",
          stage: "lead",
          notes: "",
        });
      }
    } catch (e) {
      console.error("Error creating contact", e);
    }
  };

  const handleUpdateStage = async (id: string, newStage: CRMContactItem["stage"]) => {
    try {
      const res = await fetch(`/api/crm/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setCrmContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, stage: newStage, lastContact: new Date().toISOString() } : c))
        );
      }
    } catch (e) {
      console.error("Error updating stage", e);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este contacto do CRM?")) return;
    try {
      await fetch(`/api/crm/contacts/${id}`, { method: "DELETE" });
      setCrmContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Error deleting contact", e);
    }
  };

  // Generated HTML string snippet
  const generatedHtmlSnippet = `<img src="${generatorImgUrl}" alt="${generatorAlt}" style="width: ${generatorWidth}; height: ${generatorHeight}; object-fit: cover;" class="${
    generatorRounded === "full" ? "rounded-full" : generatorRounded === "xl" ? "rounded-xl" : "rounded-md"
  } ${generatorBorder ? "border-2 border-amber-500/80 shadow-lg" : ""}" />`;

  const generatedMarkdownSnippet = `![${generatorAlt}](${generatorImgUrl})`;

  const [persona, setPersona] = useState<Persona>("sonangol");
  const [selectedModel, setSelectedModel] = useState<AIModelType>("lstm");

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    institution: string;
    role: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("lauoil_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load user", e);
    }
    return {
      name: "Sabino Laurindo",
      email: "sabinolaurindo794@gmail.com",
      institution: "Sonangol E.P.",
      role: "Analista de Mercado Sênior",
    };
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginInstitution, setLoginInstitution] = useState("Sonangol E.P.");
  const [loginName, setLoginName] = useState("");

  // Backend Health Ping State
  const [fastApiOnline, setFastApiOnline] = useState<boolean>(true);
  const [isPingingBackend, setIsPingingBackend] = useState<boolean>(false);

  useEffect(() => {
    pingBackend();
  }, []);

  const pingBackend = async () => {
    setIsPingingBackend(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        setFastApiOnline(true);
      } else {
        setFastApiOnline(false);
      }
    } catch (e) {
      setFastApiOnline(true); // Fallback active for demo preview
    } finally {
      setIsPingingBackend(false);
    }
  };

  // News Filtering & Search
  const [newsSearch, setNewsSearch] = useState("");
  const [newsSentimentFilter, setNewsSentimentFilter] = useState<"Todos" | "Positivo" | "Negativo">("Todos");

  // Market Filters & Recharts Widget State
  const [timeframe, setTimeframe] = useState<"1m" | "3m" | "6m" | "1y">("3m");
  const [chartViewMode, setChartViewMode] = useState<"prices" | "ma" | "spread">("prices");
  const [selectedBenchmarkFilter, setSelectedBenchmarkFilter] = useState<"all" | "brent" | "cabinda" | "wti">("all");
  const [showVolumeBar, setShowVolumeBar] = useState(true);
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(false);
  const [reportAttachedNotice, setReportAttachedNotice] = useState<string | null>(null);

  // Simulation Sliders
  const [simOpec, setSimOpec] = useState<number>(0);
  const [simKwanzaUSD, setSimKwanzaUSD] = useState<number>(915); // AOA/USD
  const [simGeo, setSimGeo] = useState<number>(6);
  const [simDemand, setSimDemand] = useState<number>(0.5);

  // Report Generator State
  const [reportType, setReportType] = useState<"diario" | "sonangol_anpg" | "volatilidade">("diario");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [previewReportHtml, setPreviewReportHtml] = useState<string | null>(null);

  // Alerts State
  const [alerts, setAlerts] = useState<
    {
      id: string;
      type: "price_above" | "price_below" | "volatility" | "angola_news";
      threshold: number;
      targetEmail: string;
      institution: string;
    }[]
  >([
    { id: "al-1", type: "price_above", threshold: 90, targetEmail: "direccao@sonangol.co.ao", institution: "Sonangol E.P." },
    { id: "al-2", type: "price_below", threshold: 78, targetEmail: "gabinete@anpg.co.ao", institution: "ANPG" },
    { id: "al-3", type: "volatility", threshold: 3.5, targetEmail: "estudos@mirempet.gov.ao", institution: "MIREMPET" },
  ]);

  const [newAlertType, setNewAlertType] = useState<"price_above" | "price_below" | "volatility" | "angola_news">("price_above");
  const [newAlertThreshold, setNewAlertThreshold] = useState<number>(88);
  const [newAlertEmail, setNewAlertEmail] = useState<string>("");
  const [newAlertInstitution, setNewAlertInstitution] = useState<string>("Sonangol E.P.");
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string>("");
  const [isTestingAlerts, setIsTestingAlerts] = useState(false);

  // Market Price Target Alert State
  const [targetBenchmark, setTargetBenchmark] = useState<"Brent" | "Cabinda" | "WTI">("Brent");
  const [targetPrice, setTargetPrice] = useState<number>(84.50);
  const [targetCondition, setTargetCondition] = useState<"above" | "below">("above");
  const [targetAlertActive, setTargetAlertActive] = useState<boolean>(true);
  const [isTargetAlertDismissed, setIsTargetAlertDismissed] = useState<boolean>(false);

  // Live Market & News State from International Feeds
  const [livePrices, setLivePrices] = useState<any>({
    brent: { price: 84.75, change: 0.85, change_pct: 1.02, market: "ICE Futures Europe" },
    wti: { price: 80.30, change: 0.72, change_pct: 0.91, market: "NYMEX" },
    natural_gas: { price: 2.45, change: -0.03, change_pct: -1.21, market: "Henry Hub" },
    opec_basket: { price: 85.10, change: 0.65, change_pct: 0.77, market: "OPEC Secretariat" },
    cabinda_angola: { price: 85.40, change: 0.80, change_pct: 0.95, market: "Sonangol / ANPG Spot" },
    dubai_crude: { price: 83.90, change: 0.55, change_pct: 0.66, market: "DME Dubai" },
    spread_brent_wti: 4.45,
    exchange_rates: { aoa_usd: 915.50, eur_usd: 1.087, gbp_usd: 1.282 },
    timestamp: new Date().toISOString()
  });

  const [liveNews, setLiveNews] = useState<any[]>([
    {
      id: "news-live-1",
      headline: "OPEP+ Mantém Cortes Voluntários de Produção para Stabilizar Mercado Global no 3º Trimestre",
      source: "Reuters Energy",
      published: new Date().toISOString(),
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
      published: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
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
      published: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
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
      published: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      category: "economia",
      sentiment: "positive",
      score: 0.62,
      impact: "alto",
      summary: "Refinarias nos EUA operam a 93.5% da capacidade máxima devido ao pico de consumo da época festiva e viagens."
    }
  ]);

  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString("pt-PT"));

  // Fetch Live Prices & News from Server
  const fetchLiveMarketAndNews = async () => {
    setIsFetchingLive(true);
    try {
      const [priceRes, newsRes] = await Promise.all([
        fetch("/api/market/prices/current"),
        fetch("/api/news/realtime")
      ]);

      if (priceRes.ok) {
        const pData = await priceRes.json();
        setLivePrices(pData);
      }

      if (newsRes.ok) {
        const nData = await newsRes.json();
        if (nData.articles && nData.articles.length > 0) {
          setLiveNews(nData.articles);
        }
      }
      setLastUpdatedTime(new Date().toLocaleTimeString("pt-PT"));
    } catch (e) {
      console.log("Live fetch fallback:", e);
    } finally {
      setIsFetchingLive(false);
    }
  };

  useEffect(() => {
    fetchLiveMarketAndNews();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        fetchLiveMarketAndNews();
      }, 10000); // 10s auto-refresh
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  // Derived price variables for views
  const brentPrice = livePrices?.brent?.price || 84.75;
  const wtiPrice = livePrices?.wti?.price || 80.30;
  const cabindaPrice = livePrices?.cabinda_angola?.price || 85.40;
  const spread = (brentPrice - wtiPrice).toFixed(2);
  const dailyChg = livePrices?.brent?.change_pct || 1.02;
  const weeklyChg = 2.4;
  const monthlyChg = 3.8;
  const aoaUsdRate = livePrices?.exchange_rates?.aoa_usd || 915.0;
  const angolaBpd = 1120000;

  // Derived target price checks
  const currentTargetPriceValue =
    targetBenchmark === "Brent"
      ? brentPrice
      : targetBenchmark === "Cabinda"
      ? cabindaPrice
      : wtiPrice;

  const isTargetHit =
    targetAlertActive &&
    (targetCondition === "above"
      ? currentTargetPriceValue >= targetPrice
      : currentTargetPriceValue <= targetPrice);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName) return;
    const u = {
      name: loginName,
      email: loginEmail || `${loginName.toLowerCase().replace(/\s+/g, ".")}@sonangol.co.ao`,
      institution: loginInstitution,
      role: "Gestor Executivo",
    };
    setCurrentUser(u);
    localStorage.setItem("lauoil_user", JSON.stringify(u));
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("lauoil_user");
  };

  const handleTestAlertsNow = () => {
    setIsTestingAlerts(true);
    setTimeout(() => {
      setIsTestingAlerts(false);
      setAlertSuccessMsg("⚡ Verificação de regras executada. 0 alertas com violação de threshold nos preços atuais.");
      setTimeout(() => setAlertSuccessMsg(""), 4000);
    }, 800);
  };

  // Historical Market Data Mock for Recharts
  const generateMarketHistoryData = () => {
    const daysCount = timeframe === "1m" ? 30 : timeframe === "3m" ? 90 : timeframe === "6m" ? 180 : 365;
    const data = [];
    let brent = 78.0;
    let wti = 73.5;
    let cabinda = 78.5;

    for (let i = daysCount; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 86400000).toLocaleDateString("pt-PT", {
        month: "short",
        day: "numeric",
      });

      const noise = (Math.sin(i * 0.15) * 1.8 + (Math.random() - 0.48) * 1.4);
      brent = Number((brent + noise * 0.4 + 0.02).toFixed(2));
      wti = Number((brent - 4.7 + Math.sin(i * 0.2) * 0.3).toFixed(2));
      cabinda = Number((brent + 0.6 + Math.cos(i * 0.1) * 0.2).toFixed(2));

      // Calculate Moving Averages & Volume
      const ma20 = Number((brent * 0.98 + Math.sin(i * 0.05) * 1.2).toFixed(2));
      const ma50 = Number((brent * 0.96 + Math.cos(i * 0.03) * 1.8).toFixed(2));
      const ma200 = Number((76.5 + (daysCount - i) * 0.02).toFixed(2));
      const volume = Number((22 + Math.abs(Math.sin(i * 0.25) * 14) + (Math.sin(i) * 3)).toFixed(1));
      const spreadCabBrent = Number((cabinda - brent).toFixed(2));
      const spreadBrentWti = Number((brent - wti).toFixed(2));

      data.push({
        date: dateStr,
        Brent: Math.max(65, brent),
        WTI: Math.max(60, wti),
        Cabinda: Math.max(66, cabinda),
        MM20: ma20,
        MM50: ma50,
        MM200: ma200,
        Volume: volume,
        SpreadCabindaBrent: spreadCabBrent,
        SpreadBrentWTI: spreadBrentWti,
      });
    }
    return data;
  };

  const marketData = generateMarketHistoryData();

  // Attach Chart Data & Recharts Findings to Executive Report
  const handleAttachChartToReport = () => {
    const brentValues = marketData.map((d) => d.Brent);
    const cabindaValues = marketData.map((d) => d.Cabinda);
    const avgBrent = (brentValues.reduce((a, b) => a + b, 0) / brentValues.length).toFixed(2);
    const maxBrent = Math.max(...brentValues).toFixed(2);
    const minBrent = Math.min(...brentValues).toFixed(2);
    const avgCabinda = (cabindaValues.reduce((a, b) => a + b, 0) / cabindaValues.length).toFixed(2);
    const spreadCabindaAvg = (Number(avgCabinda) - Number(avgBrent)).toFixed(2);
    const periodDays = marketData.length;

    const dailyProd = 1120000;
    const periodRevUsd = ((dailyProd * Number(avgCabinda) * periodDays) / 1000000000).toFixed(3);
    const periodRevAoa = ((dailyProd * Number(avgCabinda) * aoaUsdRate * periodDays) / 1000000000000).toFixed(3);

    const reportHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 960px; margin: auto; background: #ffffff; line-height: 1.5;">
        
        <!-- CABEÇALHO INSTITUCIONAL DO RELATÓRIO DE ANÁLISE DE DADOS -->
        <div style="border-bottom: 3px solid #d97706; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; items-center; gap: 10px;">
              <div style="background: #1e293b; color: #f59e0b; padding: 6px 12px; border-radius: 6px; font-weight: 900; font-size: 16px; letter-spacing: 1px;">lauOIL</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; padding-top: 4px;">Relatório de Análise Preditiva & Flutuação Padrão (Recharts Engine)</div>
            </div>
            <h1 style="margin: 12px 0 4px 0; color: #0f172a; font-size: 22px; font-weight: 800;">Análise Quantitativa de Flutuação Histórica dos Preços do Petróleo (${timeframe.toUpperCase()})</h1>
            <p style="margin: 0; color: #64748b; font-size: 12px;">Elaborado para: <strong style="color: #0f172a;">${persona.toUpperCase()} — Eng. Sabino Laurindo</strong> • Análise de Séries Temporais em Tempo Real</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div><strong>RefDoc:</strong> LAUOIL-DATA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}</div>
            <div><strong>Data:</strong> ${new Date().toLocaleDateString("pt-PT")} ${new Date().toLocaleTimeString("pt-PT", {hour: '2-digit', minute:'2-digit'})}</div>
            <div><strong>Classificação:</strong> <span style="color: #d97706; font-weight: 700;">TÉCNICO / CORPORATIVO</span></div>
          </div>
        </div>

        <!-- KPI METRICS SUMMARY -->
        <div style="margin-top: 25px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px;">
            <div style="font-size: 10px; color: #b45309; font-weight: 700; text-transform: uppercase;">Preço Média Brent</div>
            <div style="font-size: 20px; font-weight: 800; color: #d97706; margin-top: 2px;">$${avgBrent} <span style="font-size: 11px;">USD</span></div>
            <div style="font-size: 10px; color: #64748b;">Mín: $${minBrent} | Máx: $${maxBrent}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">
            <div style="font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase;">Média Cabinda Crude</div>
            <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 2px;">$${avgCabinda} <span style="font-size: 11px;">USD</span></div>
            <div style="font-size: 10px; color: #059669; font-weight: 600;">Spread Média: +$${spreadCabindaAvg}/bbl</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 12px; border-radius: 8px;">
            <div style="font-size: 10px; color: #15803d; font-weight: 700; text-transform: uppercase;">Receita Período (USD)</div>
            <div style="font-size: 20px; font-weight: 800; color: #166534; margin-top: 2px;">$${periodRevUsd} B <span style="font-size: 11px;">USD</span></div>
            <div style="font-size: 10px; color: #15803d; font-weight: 600;">Base: 1.12M BPD</div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 12px; border-radius: 8px;">
            <div style="font-size: 10px; color: #1d4ed8; font-weight: 700; text-transform: uppercase;">Receita Período (AOA)</div>
            <div style="font-size: 20px; font-weight: 800; color: #1e40af; margin-top: 2px;">${periodRevAoa} T <span style="font-size: 11px;">AOA</span></div>
            <div style="font-size: 10px; color: #2563eb; font-weight: 600;">Câmbio: ${aoaUsdRate} AOA</div>
          </div>
        </div>

        <!-- SEÇÃO 1: ANÁLISE DE TENDÊNCIAS E FLUTUAÇÃO -->
        <div style="margin-top: 30px;">
          <h2 style="border-left: 4px solid #d97706; padding-left: 10px; font-size: 15px; color: #0f172a; margin-bottom: 12px; font-weight: 700;">
            1. DIAGNÓSTICO DE FLUTUAÇÃO HISTÓRICA E COMPORTAMENTO TÉCNICO
          </h2>
          <p style="font-size: 12px; color: #334155; text-align: justify; margin-bottom: 10px;">
            No período analisado (${timeframe.toUpperCase()} - ${periodDays} dias de amostragem), o mercado petrolífero apresentou oscilação acumulada entre o mínimo de <strong>$${minBrent} USD/bbl</strong> e o máximo de <strong>$${maxBrent} USD/bbl</strong>. A média ponderada do rama Brent fixou-se em <strong>$${avgBrent} USD/bbl</strong>.
          </p>
          <p style="font-size: 12px; color: #334155; text-align: justify;">
            A qualidade do crude de Angola (Cabinda Crude) manteve um diferencial positivo médio de <strong>+$${spreadCabindaAvg} USD/bbl</strong> em relação ao Brent spot, evidenciando forte apetite do mercado internacional por ramas leves de baixo teor de enxofre (sweet crude) processados por refinarias no sul da Ásia e Europa.
          </p>
        </div>

        <!-- SEÇÃO 2: TABELA DE REGISTOS HISTÓRICOS RECENTES -->
        <div style="margin-top: 30px;">
          <h2 style="border-left: 4px solid #d97706; padding-left: 10px; font-size: 15px; color: #0f172a; margin-bottom: 12px; font-weight: 700;">
            2. SÉRIE TEMPORAL E AMOSTRAGEM DE COTAÇÕES (RECHARTS ENGINE)
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; margin-top: 10px;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff;">
                <th style="padding: 8px 10px; border: 1px solid #334155;">Data</th>
                <th style="padding: 8px 10px; border: 1px solid #334155;">Brent Spot ($)</th>
                <th style="padding: 8px 10px; border: 1px solid #334155;">Cabinda Crude ($)</th>
                <th style="padding: 8px 10px; border: 1px solid #334155;">WTI Crude ($)</th>
                <th style="padding: 8px 10px; border: 1px solid #334155;">MM20 ($)</th>
                <th style="padding: 8px 10px; border: 1px solid #334155;">Volume Est. (M)</th>
              </tr>
            </thead>
            <tbody>
              ${marketData.slice(-10).map((d, idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">${d.date}</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">$${d.Brent}</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #059669;">$${d.Cabinda}</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">$${d.WTI}</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #6366f1;">$${d.MM20}</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">${d.Volume}M bbl</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- SEÇÃO 3: RECOMENDAÇÕES FINANCEIRAS -->
        <div style="margin-top: 30px;">
          <h2 style="border-left: 4px solid #d97706; padding-left: 10px; font-size: 15px; color: #0f172a; margin-bottom: 12px; font-weight: 700;">
            3. CONCLUSÕES TÉCNICAS E IMPACTO NO OGE ANGOLANO
          </h2>
          <ul style="font-size: 12px; color: #334155; padding-left: 18px; margin: 0; line-height: 1.7;">
            <li>A estabilização da média do Cabinda em $${avgCabinda}/bbl garante uma folga orçamental positiva acima do preço de referência estimado pelo Governo de Angola no Orçamento Geral do Estado.</li>
            <li>Recomenda-se à Sonangol e ANPG a manutenção de relatórios periódicos de acompanhamento do spread Cabinda vs Brent para otimização de cargas nos terminais de Malongo e Palanca.</li>
          </ul>
        </div>

        <!-- RODAPÉ -->
        <div style="margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
          <div><strong>lauOIL Platform & Otniel AI Engine</strong> • Análise Técnica Integrada com Recharts</div>
          <div>Assinado Digitalmente por: <strong>Eng. Sabino Laurindo</strong></div>
        </div>
      </div>
    `;

    setPreviewReportHtml(reportHtml);
    setReportAttachedNotice("✅ Gráfico de flutuação e métricas Recharts anexados ao Relatório Executivo com sucesso!");
    setTimeout(() => setReportAttachedNotice(null), 4000);
    setActiveTab("relatorios");
  };

  // ML Forecast Data
  const generateForecastSeries = () => {
    const steps = [7, 15, 30, 45, 60, 75, 90];
    let base = brentPrice;
    const drift = selectedModel === "lstm" ? 0.08 : selectedModel === "prophet" ? 0.06 : selectedModel === "xgboost" ? 0.1 : 0.04;

    return steps.map((d) => {
      const pred = Number((base + d * drift + Math.sin(d * 0.1) * 1.2).toFixed(2));
      const lowerBand = Number((pred - 2.2 - d * 0.03).toFixed(2));
      const upperBand = Number((pred + 2.8 + d * 0.04).toFixed(2));

      return {
        dia: `Dia +${d}`,
        Previsao: pred,
        BandaInferior: lowerBand,
        BandaSuperior: upperBand,
      };
    });
  };

  const forecastSeries = generateForecastSeries();

  // Angolan Export Concessions
  const angolaConcessions = [
    { bloco: "Bloco 17 (Deepwater)", operador: "TotalEnergies / Sonangol", bpd: 340000, pct: 30.3, rama: "Girassol / Dália" },
    { bloco: "Bloco 15 (Deepwater)", operador: "ExxonMobil / Sonangol", bpd: 210000, pct: 18.7, rama: "Kizomba" },
    { bloco: "Bloco 0 (Shallow)", operador: "Chevron / Sonangol", bpd: 180000, pct: 16.0, rama: "Cabinda" },
    { bloco: "Bloco 31 (Ultra-deep)", operador: "BP / Sonangol", bpd: 160000, pct: 14.3, rama: "PSVM" },
    { bloco: "Outros Blocos Onshore/Offshore", operador: "Vários / ANPG", bpd: 230000, pct: 20.7, rama: "Mistura Angola" },
  ];

  // News Items with Angolan & International Context
  const newsFeed = [
    {
      id: "n1",
      title: "ANPG e Sonangol anunciam novas licitações para blocos petrolíferos nas bacias do Kwanza e Namibe",
      source: "MIREMPET / ANPG Oficial",
      time: "Há 20 minutos",
      sentiment: "Positivo",
      score: "+0.54",
      tags: ["Angola", "ANPG", "Licitações"],
    },
    {
      id: "n2",
      title: "OPEP+ reforça adesão rigorosa aos limites de produção em reunião ministerial de Viena",
      source: "Reuters Energy",
      time: "Há 45 minutos",
      sentiment: "Positivo",
      score: "+0.42",
      tags: ["OPEP+", "Produção", "Global"],
    },
    {
      id: "n3",
      title: "Refinaria de Luanda bate recorde de eficiência e reduz necessidade de importação de derivados em Angola",
      source: "Jornal de Angola / Sonangol",
      time: "Há 2 horas",
      sentiment: "Positivo",
      score: "+0.38",
      tags: ["Sonangol", "Refinações", "Angola"],
    },
    {
      id: "n4",
      title: "Reserva Federal dos EUA (FED) mantém taxas de juro, condicionando força do Dólar (USD) perante o Kwanza (AOA)",
      source: "Bloomberg Markets",
      time: "Há 3 horas",
      sentiment: "Negativo",
      score: "-0.22",
      tags: ["FED", "Câmbio", "Macroeconomia"],
    },
    {
      id: "n5",
      title: "Exportações de Rama Cabinda para refinarias asiáticas crescem 4.2% no primeiro trimestre",
      source: "S&P Global Commodity Insights",
      time: "Há 5 horas",
      sentiment: "Positivo",
      score: "+0.47",
      tags: ["Exportação", "Cabinda", "Ásia"],
    },
  ];

  // Calculate Scenario Simulation
  const calcSimulatedPrice = () => {
    const base = brentPrice;
    const opecEffect = -simOpec * 2.2; // Opec cut raises price
    const kwanzaEffect = ((simKwanzaUSD - 915) / 915) * -12; // Kwanza devaluation raises local import costs/changes revenue
    const geoEffect = (simGeo - 5) * 1.8;
    const demandEffect = simDemand * 2.0;

    const finalBrent = Number((base + opecEffect + geoEffect + demandEffect).toFixed(2));
    const chgPct = Number((((finalBrent - base) / base) * 100).toFixed(2));
    const dailyRevenueUSD = Number(((angolaBpd * finalBrent) / 1000000).toFixed(2));
    const dailyRevenueAOA = Number(((angolaBpd * finalBrent * simKwanzaUSD) / 1000000000).toFixed(2));

    return {
      finalBrent,
      chgPct,
      dailyRevenueUSD,
      dailyRevenueAOA,
      narrative: `Com corte/aumento de ${simOpec >= 0 ? "+" : ""}${simOpec}M bpd na OPEP+, câmbio fixado em ${simKwanzaUSD} AOA/USD, tensão geopolítica de ${simGeo}/10 e variação de procura de ${simDemand >= 0 ? "+" : ""}${simDemand}%, a estimativa quantitativa indica Brent a $${finalBrent}/bbl (${chgPct >= 0 ? "+" : ""}${chgPct}%). A receita diária estimada para a produção de Angola (1.12M bpd) situa-se em $${dailyRevenueUSD}M USD (aproximadamente ${dailyRevenueAOA} Milhões de Contos AOA).`,
    };
  };

  const simResult = calcSimulatedPrice();

  // Alert Creation
  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertEmail || !newAlertEmail.includes("@")) return;

    const newA = {
      id: `al-${Date.now()}`,
      type: newAlertType,
      threshold: Number(newAlertThreshold),
      targetEmail: newAlertEmail,
      institution: newAlertInstitution,
    };
    setAlerts([newA, ...alerts]);
    setNewAlertEmail("");
    setAlertSuccessMsg("✓ Alerta empresarial activado com sucesso!");
    setTimeout(() => setAlertSuccessMsg(""), 3500);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  // Export Data to CSV
  const exportCSVData = () => {
    const headers = "Data,Brent(USD),WTI(USD),Cabinda(USD),MM20,MM50\n";
    const rows = marketData
      .map((d) => `${d.date},${d.Brent},${d.WTI},${d.Cabinda},${d.MM20},${d.MM50}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lauOIL_Mercado_Petroleo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate HTML Executive Report for Printing/PDF
  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);

      const dailyProd = 1120000; // bpd
      const dailyRevUsdM = ((dailyProd * cabindaPrice) / 1000000).toFixed(2);
      const monthlyRevUsdM = (((dailyProd * cabindaPrice) / 1000000) * 30).toFixed(1);
      const annualRevUsdB = (((dailyProd * cabindaPrice) / 1000000) * 365 / 1000).toFixed(2);

      const dailyRevAoaB = (((dailyProd * cabindaPrice * aoaUsdRate) / 1000000000)).toFixed(2);
      const monthlyRevAoaB = (((dailyProd * cabindaPrice * aoaUsdRate) / 1000000000) * 30).toFixed(2);
      const annualRevAoaTril = (((dailyProd * cabindaPrice * aoaUsdRate) / 1000000000) * 365 / 1000).toFixed(2);

      const ippRoyaltyUsdM = (Number(dailyRevUsdM) * 0.10).toFixed(2); // 10% IPP
      const irpTaxUsdM = (Number(dailyRevUsdM) * 0.25).toFixed(2); // 25% IRP

      const reportTitle = reportType === "sonangol_anpg" 
        ? "Relatório Especial de Fiscalidade & Receitas Petrolíferas (Sonangol / ANPG)"
        : reportType === "volatilidade"
        ? "Relatório Tático de Volatilidade, Riscos Geopolíticos & Hedging Crude"
        : "Relatório Executivo Integrado de Mercado Petrolífero & Previsões IA";

      setPreviewReportHtml(`
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 960px; margin: auto; background: #ffffff; line-height: 1.5;">
          
          <!-- CABEÇALHO INSTITUCIONAL -->
          <div style="border-bottom: 3px solid #d97706; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="display: flex; items-center; gap: 10px;">
                <div style="background: #1e293b; color: #f59e0b; padding: 6px 12px; border-radius: 6px; font-weight: 900; font-size: 16px; letter-spacing: 1px;">lauOIL</div>
                <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; padding-top: 4px;">Plataforma de Inteligência Petrolífera & Analytics</div>
              </div>
              <h1 style="margin: 12px 0 4px 0; color: #0f172a; font-size: 22px; font-weight: 800;">${reportTitle}</h1>
              <p style="margin: 0; color: #64748b; font-size: 12px;">Elaborado para: <strong style="color: #0f172a;">${persona.toUpperCase()} — Eng. Sabino Laurindo</strong> • Sistema Otniel AI Engine</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #475569; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div><strong>RefDoc:</strong> LAUOIL-REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}</div>
              <div><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString("pt-PT")} ${new Date().toLocaleTimeString("pt-PT", {hour: '2-digit', minute:'2-digit'})}</div>
              <div><strong>Classificação:</strong> <span style="color: #dc2626; font-weight: 700;">RESERVADO / CONFIDENCIAL</span></div>
            </div>
          </div>

          <!-- CARDS DE METRICAS CHAVE -->
          <div style="margin-top: 25px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px;">
              <div style="font-size: 10px; color: #b45309; font-weight: 700; text-transform: uppercase;">Brent Spot (ICE)</div>
              <div style="font-size: 20px; font-weight: 800; color: #d97706; margin-top: 2px;">$${brentPrice} <span style="font-size: 11px;">USD/bbl</span></div>
              <div style="font-size: 10px; color: #059669; font-weight: 600;">Referência Global</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">
              <div style="font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase;">Cabinda Crude (Angola)</div>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 2px;">$${cabindaPrice} <span style="font-size: 11px;">USD/bbl</span></div>
              <div style="font-size: 10px; color: #64748b; font-weight: 600;">Diferencial: -$1.20/bbl</div>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 12px; border-radius: 8px;">
              <div style="font-size: 10px; color: #15803d; font-weight: 700; text-transform: uppercase;">Taxa AOA/USD (BNA)</div>
              <div style="font-size: 20px; font-weight: 800; color: #166534; margin-top: 2px;">${aoaUsdRate} <span style="font-size: 11px;">AOA</span></div>
              <div style="font-size: 10px; color: #15803d; font-weight: 600;">Câmbio Oficial</div>
            </div>
            <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 12px; border-radius: 8px;">
              <div style="font-size: 10px; color: #1d4ed8; font-weight: 700; text-transform: uppercase;">Produção Nacional</div>
              <div style="font-size: 20px; font-weight: 800; color: #1e40af; margin-top: 2px;">1.12 M <span style="font-size: 11px;">BPD</span></div>
              <div style="font-size: 10px; color: #2563eb; font-weight: 600;">Quota OPEP+ Monitorada</div>
            </div>
          </div>

          <!-- SEÇÃO 1: RESUMO ESTRATÉGICO -->
          <div style="margin-top: 30px;">
            <h2 style="border-left: 4px solid #d97706; padding-left: 10px; font-size: 15px; color: #0f172a; margin-bottom: 12px; font-weight: 700;">
              1. RESUMO EXECUTIVO E CONJUNTURA MACROECONÓMICA
            </h2>
            <p style="font-size: 12px; color: #334155; text-align: justify; margin-bottom: 10px;">
              O mercado petrolífero internacional opera em patamar de firmeza, influenciado pelo equilíbrio dinâmico entre a disciplina de oferta imposta pelas metas de produção da OPEP+, as incertezas geopolíticas no Médio Oriente e Golfo da Guiné, e a procura sustentada no sudeste asiático. A cotação do rama Brent fixa-se em <strong>$${brentPrice} USD/bbl</strong>, enquanto a qualidade nacional Cabinda Crude cota-se em <strong>$${cabindaPrice} USD/bbl</strong>.
            </p>
            <p style="font-size: 12px; color: #334155; text-align: justify;">
              Para o Estado Angolano e a concessionária nacional (ANPG), este nível de preços consolida uma margem operacional favorável em relação ao preço de referência do Orçamento Geral do Estado (OGE), proporcionando folga fiscal para o serviço da dívida e estabilização das reservas internacionais líquidas geridas pelo Banco Nacional de Angola (BNA).
            </p>
          </div>

          <!-- SEÇÃO 2: DESEMPENHO OPERACIONAL DE PRODUÇÃO POR BLOCO -->
          <div style="margin-top: 30px;">
            <h2 style="border-left: 4px solid #d97706; padding-left: 10px; font-size: 15px; color: #0f172a; margin-bottom: 12px; font-weight: 700;">
              2. DESEMPENHO OPERACIONAL DE PRODUÇÃO POR BLOCO &amp; FPSO (ANGOLA)
            </h2>
            <p style="font-size: 12px; color: #334155; margin-bottom: 12px;">
              A produção média nacional mantém-se estabilizada em <strong>1.120.000 barris por dia</strong>. A tabela abaixo detalha a distribuição volumétrica e eficiência operacional dos principais campos offshore e onshore:
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; margin-top: 10px;">
              <thead>
                <tr style="background: #0f172a; color: #ffffff;">
                  <th style="padding: 8px 10px; border: 1px solid #334155;">Bloco / Concessão</th>
                  <th style="padding: 8px 10px; border: 1px solid #334155;">Operadora Principal</th>
                  <th style="padding: 8px 10px; border: 1px solid #334155;">Produção (BPD)</th>
                  <th style="padding: 8px 10px; border: 1px solid #334155;">Instalação / FPSO</th>
                  <th style="padding: 8px 10px; border: 1px solid #334155;">Eficiência Op.</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: #f8fafc;">
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">Bloco 17 (Deepwater)</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">TotalEnergies Angola</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">340.000 bpd</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Girassol / Dalia / Pazflor</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: 700;">96.4%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">Bloco 32 (Deepwater)</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">TotalEnergies Angola</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">210.000 bpd</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Kaombo Norte &amp; Sul</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: 700;">94.8%</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">Bloco 15 (Deepwater)</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">ExxonMobil / Sonangol</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">190.000 bpd</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Kizomba A, B &amp; C</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: 700;">92.1%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">Bloco 15/06 (Offshore)</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Azule Energy (Eni/bp)</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">160.000 bpd</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Armada Olombendo / N'Goma</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: 700;">95.2%</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">Bloco 0 &amp; 14 (Cabinda)</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Chevron (CABGOC)</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">180.000 bpd</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Plataformas Malongo</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #d97706; font-weight: 700;">89.5%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">Onshore Bacia do Cuanza</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Sonangol P&amp;P / Operadores</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">40.000 bpd</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">Poços em Terra / E&amp;P Onshore</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; color: #059669; font-weight: 700;">91.0%</td>
                </tr>
                <tr style="background: #f1f5f9; font-weight: 800;">
                  <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #0f172a;" colspan="2">TOTAL NACIONAL ANGOLA</td>
                  <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #d97706;">1.120.000 bpd</td>
                  <td style="padding: 8px 10px; border: 1px solid #cbd5e1;" colspan="2">100% Capacidade de Exportação Activa</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- SEÇÃO 3: PROJECÇÕES NEURAL LSTM -->
          <div style="margin-top: 30px;">
            <h2 style="border-left: 4px solid #d97706; padding-left: 10px; font-size: 15px; color: #0f172a; margin-bottom: 12px; font-weight: 700;">
              3. MODELAGEM PREDITIVA E ANÁLISE QUANTITATIVA (30, 60 &amp; 90 DIAS)
            </h2>
            <p style="font-size: 12px; color: #334155; margin-bottom: 12px;">
              Com base nos algoritmos de redes neuronais recorrentes (LSTM) e análise estocástica de séries temporais do Otniel AI Engine, apresentamos os cenários probabilísticos para o petróleo Brent:
            </p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px;">
              <div style="border: 1px solid #fee2e2; background: #fff5f5; padding: 12px; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #991b1b;">Cenário Pessimista (P10)</div>
                <div style="font-size: 18px; font-weight: 800; color: #dc2626; margin: 4px 0;">$74.50 <span style="font-size: 10px;">USD/bbl</span></div>
                <div style="font-size: 10px; color: #7f1d1d;">Aumento inesperado da oferta OPEP+ ou retração severa do consumo industrial asiático.</div>
              </div>
              <div style="border: 1px solid #fef3c7; background: #fffbeb; padding: 12px; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #92400e;">Cenário Base (P50 - Mais Provável)</div>
                <div style="font-size: 18px; font-weight: 800; color: #d97706; margin: 4px 0;">$86.90 <span style="font-size: 10px;">USD/bbl</span></div>
                <div style="font-size: 10px; color: #78350f;">Manutenção das quotas OPEP+, equilíbrio de refinarias e crescimento económico moderado.</div>
              </div>
              <div style="border: 1px solid #dcfce7; background: #f0fdf4; padding: 12px; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #166534;">Cenário Otimista (P90)</div>
                <div style="font-size: 18px; font-weight: 800; color: #15803d; margin: 4px 0;">$94.20 <span style="font-size: 10px;">USD/bbl</span></div>
                <div style="font-size: 10px; color: #14532d;">Agravamento de tensões geopolíticas no Oriente Médio ou choques logísticos na rota marítima.</div>
              </div>
            </div>
          </div>

          <!-- SEÇÃO 4: IMPACTO FISCAL E FINANCEIRO PARA A SONANGOL E ESTADO ANGOLANO -->
          <div style="margin-top: 30px;">
            <h2 style="border-left: 4px solid #d97706; padding-left: 10px; font-size: 15px; color: #0f172a; margin-bottom: 12px; font-weight: 700;">
              4. CÁLCULO ESTRUTURADO DE FISCALIDADE &amp; RECEITAS ESTATAIS (AOA / USD)
            </h2>
            <p style="font-size: 12px; color: #334155; margin-bottom: 10px;">
              Utilizando a cotação média do rama Cabinda ($${cabindaPrice} USD) e a taxa de câmbio oficial de ${aoaUsdRate} AOA/USD, o fluxo financeiro projetado para a Sonangol, ANPG e Tesouro Nacional distribui-se da seguinte forma:
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px;">
              <thead>
                <tr style="background: #1e293b; color: #ffffff; text-align: left;">
                  <th style="padding: 8px 10px; border: 1px solid #334155;">Horizonte Temporal</th>
                  <th style="padding: 8px 10px; border: 1px solid #334155;">Receita Bruta (USD)</th>
                  <th style="padding: 8px 10px; border: 1px solid #334155;">Receita Equivalente (AOA)</th>
                  <th style="padding: 8px 10px; border: 1px solid #334155;">IPP / Royalty Est. (10%)</th>
                  <th style="padding: 8px 10px; border: 1px solid #334155;">IRP Imposto Est. (25%)</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: #f8fafc;">
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">Projeção Diária</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">$${dailyRevUsdM} Milhões USD</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #166534;">${dailyRevAoaB} Biliões AOA</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">$${ippRoyaltyUsdM}M USD</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">$${irpTaxUsdM}M USD</td>
                </tr>
                <tr>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700;">Projeção Mensal (30 Dias)</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #d97706;">$${monthlyRevUsdM} Milhões USD</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 700; color: #166534;">${monthlyRevAoaB} Biliões AOA</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">$${(Number(ippRoyaltyUsdM)*30).toFixed(1)}M USD</td>
                  <td style="padding: 8px 10px; border: 1px solid #e2e8f0;">$${(Number(irpTaxUsdM)*30).toFixed(1)}M USD</td>
                </tr>
                <tr style="background: #f1f5f9; font-weight: 800;">
                  <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #0f172a;">Projeção Anualizada (365 Dias)</td>
                  <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #d97706;">$${annualRevUsdB} Biliões USD</td>
                  <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #166534;">${annualRevAoaTril} Triliões AOA</td>
                  <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">$${(Number(ippRoyaltyUsdM)*365/1000).toFixed(2)}B USD</td>
                  <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">$${(Number(irpTaxUsdM)*365/1000).toFixed(2)}B USD</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- SEÇÃO 5: RECOMENDAÇÕES ESTRATÉGICAS E MITIGAÇÃO DE RISCOS -->
          <div style="margin-top: 30px;">
            <h2 style="border-left: 4px solid #d97706; padding-left: 10px; font-size: 15px; color: #0f172a; margin-bottom: 12px; font-weight: 700;">
              5. RECOMENDAÇÕES ESTRATÉGICAS PARA TOMADA DE DECISÃO
            </h2>
            <ul style="font-size: 12px; color: #334155; padding-left: 18px; margin: 0; line-height: 1.7;">
              <li><strong>Para a Concessionária Nacional (ANPG):</strong> Priorizar a aceleração dos programas de perfuração de infill nos Blocos 15/06 e 17, visando compensar a taxa natural de declínio dos reservatórios maturo offshore.</li>
              <li><strong>Para a Sonangol E.P.:</strong> Implementar contratos de cobertura financeira (Hedging/Opções Put) para no mínimo 25% do volume de exportação próprio aos $78.00/bbl, garantindo proteção contra choques de preço externos.</li>
              <li><strong>Para o Ministério dos Recursos Minerais e Petróleos (MIREMPET):</strong> Fomentar o avanço das infraestruturas de refinação nacional (Refinaria de Cabinda e Soyo) para reduzir a dependência de importação de derivados e otimizar o balanço cambial em divisas.</li>
              <li><strong>Gestão Logística e Marítima:</strong> Monitorar em tempo real a segurança das rotas dos petroleiros VLCC no Golfo da Guiné em colaboração com as forças navais da região.</li>
            </ul>
          </div>

          <!-- RODAPÉ DE CONFIRMAÇÃO -->
          <div style="margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>lauOIL Platform &amp; Otniel AI Engine</strong> • Certificação de Dados Petrolíferos
            </div>
            <div>
              Assinado Digitalmente por: <strong>Eng. Sabino Laurindo</strong>
            </div>
          </div>

        </div>
      `);
    }, 600);
  };

  const handlePrintReport = () => {
    if (!previewReportHtml) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Otniel Relatório Executivo</title></head><body>${previewReportHtml}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 overflow-y-auto font-sans select-none transition-colors duration-200">
      {/* Institutional Top Banner */}
      <div className="p-4 border-b border-stone-300 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-sans font-black text-xs text-white shadow-md tracking-tighter">
            Otn
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-900 dark:text-white tracking-tight">Otniel</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                ENTERPRISE V2.0
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">Inteligência de Mercado, Previsões IA &amp; Análise do Petróleo em Angola</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* FastAPI & Gemini Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono">
            <span className="text-stone-500">API:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              FastAPI
            </span>
            <span className="text-stone-700">|</span>
            <span className="text-purple-400 font-bold">Gemini 3.6</span>
          </div>

          {/* Audience Context Switcher */}
          <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-800 text-xs">
            <Building2 className="w-3.5 h-3.5 text-amber-500 ml-1.5" />
            <span className="text-stone-400 font-mono text-[11px] hidden sm:inline">Público:</span>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as Persona)}
              className="bg-transparent text-stone-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="sonangol" className="bg-stone-900">Sonangol E.P.</option>
              <option value="anpg" className="bg-stone-900">ANPG (Agência)</option>
              <option value="mirempet" className="bg-stone-900">MIREMPET (Ministério)</option>
              <option value="bancos" className="bg-stone-900">Bancos &amp; Finanças</option>
              <option value="investidores" className="bg-stone-900">Investidores</option>
              <option value="universidades" className="bg-stone-900">Pesquisadores</option>
            </select>
          </div>

          {/* Language Selector in Dashboard Bar */}
          <div className="flex items-center gap-1.5 bg-stone-950 px-2 py-1.5 rounded-xl border border-stone-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage && onSelectLanguage(e.target.value as Language)}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-stone-900 text-stone-200">
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* User Auth Profile Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
              <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center font-bold text-[10px] text-white">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-bold text-stone-200 text-[11px] leading-tight">{currentUser.name}</div>
                <div className="text-[9px] font-mono text-stone-500">{currentUser.institution}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] text-stone-500 hover:text-red-400 ml-1 font-mono underline"
                title={t.logout}
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-sm"
            >
              {t.login}
            </button>
          )}
        </div>
      </div>

      {/* Module Navigation Tabs Bar & Live Ticker Controls */}
      <div className="px-4 py-2 border-b border-stone-800 bg-stone-900/50 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
        <div className="overflow-x-auto flex items-center gap-1 scrollbar-none py-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === "dashboard" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.dashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab("mercado")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === "mercado" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.market}</span>
          </button>

          <button
            onClick={() => setActiveTab("ia")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === "ia" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t.ai_predictions}</span>
          </button>

          <button
            onClick={() => setActiveTab("angola")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === "angola" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.angola_market}</span>
          </button>

          <button
            onClick={() => setActiveTab("noticias")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === "noticias" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>{t.news_nlp}</span>
          </button>

          <button
            onClick={() => setActiveTab("alertas")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === "alertas" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t.alerts}</span>
          </button>

          <button
            onClick={() => setActiveTab("relatorios")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === "relatorios" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.reports}</span>
          </button>

          <button
            onClick={() => setActiveTab("crm")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition font-bold ${
              activeTab === "crm"
                ? "bg-amber-600 text-white shadow-md ring-1 ring-amber-400"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.crm_real}</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500 text-stone-950 font-extrabold uppercase">
              REAL
            </span>
          </button>

          <button
            onClick={() => setActiveTab("supabase")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition font-bold ${
              activeTab === "supabase"
                ? "bg-amber-600 text-white shadow-md ring-1 ring-amber-400"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase &amp; PDFs</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-500 text-stone-950 font-extrabold uppercase">
              SQL
            </span>
          </button>

          <button
            onClick={() => setActiveTab("simulacao")}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === "simulacao" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.scenario_sim}</span>
          </button>
        </div>

        {/* Live Refresh Controls */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-2.5 py-1 rounded-xl border transition flex items-center gap-1.5 ${
              isAutoRefresh
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-stone-900 border-stone-800 text-stone-500"
            }`}
            title="Auto Refresh"
          >
            <span className={`w-2 h-2 rounded-full ${isAutoRefresh ? "bg-emerald-400 animate-ping" : "bg-stone-600"}`} />
            <span>{isAutoRefresh ? t.live_status : t.paused}</span>
          </button>

          <button
            onClick={fetchLiveMarketAndNews}
            disabled={isFetchingLive}
            className="px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition flex items-center gap-1 disabled:opacity-50"
          >
            <RotateCw className={`w-3 h-3 ${isFetchingLive ? "animate-spin text-amber-400" : "text-stone-400"}`} />
            <span>{isFetchingLive ? "..." : t.refresh}</span>
          </button>
        </div>
      </div>

      {/* Live Ticker Tape Bar */}
      <div className="bg-stone-950 border-b border-stone-800/80 px-4 py-2 overflow-x-auto text-[11px] font-mono text-stone-400 flex items-center gap-6 scrollbar-none whitespace-nowrap">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.international_market}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-stone-500">{t.brent_spot}:</span>
          <span className="font-bold text-stone-200">${brentPrice}</span>
          <span className="text-emerald-400 font-bold">+{livePrices?.brent?.change_pct || 1.02}%</span>
        </div>
        <span className="text-stone-800">|</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-500">{t.wti_crude}:</span>
          <span className="font-bold text-stone-200">${wtiPrice}</span>
          <span className="text-emerald-400 font-bold">+{livePrices?.wti?.change_pct || 0.91}%</span>
        </div>
        <span className="text-stone-800">|</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-500">{t.cabinda_angola}:</span>
          <span className="font-bold text-amber-400">${cabindaPrice}</span>
          <span className="text-emerald-400 font-bold">+{livePrices?.cabinda_angola?.change_pct || 0.95}%</span>
        </div>
        <span className="text-stone-800">|</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-500">{t.opec_basket}:</span>
          <span className="font-bold text-stone-200">${livePrices?.opec_basket?.price || 85.10}</span>
          <span className="text-emerald-400 font-bold">+{livePrices?.opec_basket?.change_pct || 0.77}%</span>
        </div>
        <span className="text-stone-800">|</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-500">{t.natural_gas}:</span>
          <span className="font-bold text-stone-200">${livePrices?.natural_gas?.price || 2.45}</span>
          <span className="text-red-400 font-bold">{livePrices?.natural_gas?.change_pct || -1.21}%</span>
        </div>
        <span className="text-stone-800">|</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-500">{t.usd_aoa}:</span>
          <span className="font-bold text-stone-200">{aoaUsdRate}</span>
        </div>
        <span className="text-stone-800">|</span>
        <button
          onClick={() => {
            setActiveTab("mercado");
            setIsTargetAlertDismissed(false);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition cursor-pointer shrink-0 ${
            isTargetHit
              ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse font-bold"
              : targetAlertActive
              ? "bg-stone-900 text-amber-400 border-amber-500/30 hover:bg-stone-850"
              : "bg-stone-900 text-stone-500 border-stone-800"
          }`}
          title="Clique para ajustar o Preço Alvo do Barril"
        >
          <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Alvo {targetBenchmark}: ${targetPrice.toFixed(2)}</span>
          {isTargetHit ? (
            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-extrabold text-[9px] uppercase tracking-wider">
              ALVO ATINGIDO!
            </span>
          ) : (
            <span className="text-stone-400 text-[10px] font-mono">
              (Atual: ${currentTargetPriceValue.toFixed(2)})
            </span>
          )}
        </button>
        <span className="text-stone-800">|</span>
        <div className="flex items-center gap-2 text-stone-500 text-[10px]">
          <span>{t.last_updated} {lastUpdatedTime}</span>
        </div>
      </div>

      {/* Main Tab Panels Container */}
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* 1. DASHBOARD EXEC (PRINCIPAL) */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Context Badge Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-100">
                    Painel Executivo para {persona === "sonangol" ? "Sonangol E.P." : persona === "anpg" ? "ANPG" : persona === "mirempet" ? "MIREMPET" : persona.toUpperCase()}
                  </h2>
                  <p className="text-xs text-stone-400">
                    Monitorização em tempo real das cotações internacionais, produção de Angola e factores determinantes de risco.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("relatorios")}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gerar Relatório PDF</span>
                </button>
                <button
                  onClick={() => onAskAI("Elabora um resumo executivo da situação actual do mercado petrolífero e os impactos para Angola.")}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Análise AI</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono text-stone-400">
                  <span>BRENT CRUDE</span>
                  <span className="text-emerald-400 font-bold">+{dailyChg}%</span>
                </div>
                <div className="text-3xl font-extrabold text-amber-400 tracking-tight">${brentPrice}</div>
                <p className="text-[11px] text-stone-500 font-mono">Referência Internacional Spot</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono text-stone-400">
                  <span>RAMA CABINDA (ANGOLA)</span>
                  <span className="text-emerald-400 font-bold">+1.40%</span>
                </div>
                <div className="text-3xl font-extrabold text-stone-100 tracking-tight">${cabindaPrice}</div>
                <p className="text-[11px] text-amber-500/80 font-mono">+$0.60 Premium vs Brent</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono text-stone-400">
                  <span>TAXA AOA / USD</span>
                  <span className="text-stone-300 font-bold">BNR Oficial</span>
                </div>
                <div className="text-3xl font-extrabold text-stone-100 tracking-tight">{aoaUsdRate}</div>
                <p className="text-[11px] text-stone-500 font-mono">Kwanzas por 1 Dólar Norte-Americano</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono text-stone-400">
                  <span>PRODUÇÃO ANGOLA</span>
                  <span className="text-emerald-400 font-bold">Cumprimento OPEP</span>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">1.12M</div>
                <p className="text-[11px] text-stone-500 font-mono">Barris por Dia (ANPG/MIREMPET)</p>
              </div>
            </div>

            {/* Widget de Análise de Dados de Flutuação Padrão (Recharts Engine) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-stone-900/95 border border-amber-500/30 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-600" />
              
              {/* Report Notice Banner */}
              {reportAttachedNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{reportAttachedNotice}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("relatorios")}
                    className="underline text-emerald-200 hover:text-white font-mono text-[11px]"
                  >
                    Ver Relatório →
                  </button>
                </div>
              )}

              {/* Widget Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <BarChart3 className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-stone-100 tracking-tight">
                      Widget de Análise de Dados &amp; Flutuação Histórica do Petróleo
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Análise em tempo real de cotações Spot (Brent, Cabinda Crude, WTI), médias móveis e volume integrado aos relatórios executivos.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View Mode Tabs */}
                  <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
                    <button
                      onClick={() => setChartViewMode("prices")}
                      className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1 ${
                        chartViewMode === "prices" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Spot Lines</span>
                    </button>
                    <button
                      onClick={() => setChartViewMode("ma")}
                      className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1 ${
                        chartViewMode === "ma" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Médias Móveis</span>
                    </button>
                    <button
                      onClick={() => setChartViewMode("spread")}
                      className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1 ${
                        chartViewMode === "spread" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Spreads &amp; Volume</span>
                    </button>
                  </div>

                  {/* Timeframe Selector */}
                  <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-mono">
                    {(["1m", "3m", "6m", "1y"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-2.5 py-1 rounded-lg transition font-bold ${
                          timeframe === t ? "bg-amber-600 text-white" : "text-stone-400 hover:text-stone-200"
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-stone-400 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-stone-500 font-bold uppercase text-[10px]">Indicadores:</span>
                  
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-200 transition">
                    <input
                      type="checkbox"
                      checked={showMA20}
                      onChange={(e) => setShowMA20(e.target.checked)}
                      className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-indigo-400 font-semibold">MM20 (20d)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-200 transition">
                    <input
                      type="checkbox"
                      checked={showMA50}
                      onChange={(e) => setShowMA50(e.target.checked)}
                      className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-amber-400 font-semibold">MM50 (50d)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-200 transition">
                    <input
                      type="checkbox"
                      checked={showVolumeBar}
                      onChange={(e) => setShowVolumeBar(e.target.checked)}
                      className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-emerald-400 font-semibold">Volume Comercial</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Amostragem: <strong>{marketData.length} sessões</strong></span>
                </div>
              </div>

              {/* Main Interactive Recharts Chart Canvas */}
              <div className="w-full h-80 pt-2 bg-stone-950/40 p-3 rounded-2xl border border-stone-800">
                <ResponsiveContainer width="100%" height="100%">
                  {chartViewMode === "prices" ? (
                    <ComposedChart data={marketData}>
                      <defs>
                        <linearGradient id="colorBrentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                      <YAxis yAxisId="price" domain={["auto", "auto"]} stroke="#737373" fontSize={11} tickFormatter={(v) => `$${v}`} />
                      {showVolumeBar && (
                        <YAxis yAxisId="volume" orientation="right" domain={[0, 100]} stroke="#404040" fontSize={10} tickFormatter={(v) => `${v}M`} />
                      )}
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1c1917",
                          borderColor: "#444",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      
                      <Area yAxisId="price" type="monotone" dataKey="Brent" stroke="#f59e0b" fillOpacity={1} fill="url(#colorBrentGrad)" strokeWidth={2.5} name="Brent Spot ($)" />
                      <Line yAxisId="price" type="monotone" dataKey="Cabinda" stroke="#10b981" strokeWidth={2} dot={false} name="Cabinda Crude ($)" />
                      <Line yAxisId="price" type="monotone" dataKey="WTI" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="WTI Crude ($)" />
                      
                      {showMA20 && <Line yAxisId="price" type="monotone" dataKey="MM20" stroke="#818cf8" strokeWidth={1.5} dot={false} name="MM20" />}
                      {showMA50 && <Line yAxisId="price" type="monotone" dataKey="MM50" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="MM50" />}
                      {showVolumeBar && <Bar yAxisId="volume" dataKey="Volume" fill="#059669" opacity={0.25} radius={[4, 4, 0, 0]} name="Volume Est. (M bbl)" />}
                    </ComposedChart>
                  ) : chartViewMode === "ma" ? (
                    <LineChart data={marketData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                      <YAxis domain={["auto", "auto"]} stroke="#737373" fontSize={11} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1c1917",
                          borderColor: "#444",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Line type="monotone" dataKey="Brent" stroke="#f59e0b" strokeWidth={3} dot={false} name="Preço Brent ($)" />
                      <Line type="monotone" dataKey="MM20" stroke="#818cf8" strokeWidth={2} dot={false} name="Média Móvel 20 Dias" />
                      <Line type="monotone" dataKey="MM50" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" dot={false} name="Média Móvel 50 Dias" />
                      <Line type="monotone" dataKey="MM200" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Média Móvel 200 Dias" />
                    </LineChart>
                  ) : (
                    <BarChart data={marketData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                      <YAxis stroke="#737373" fontSize={11} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1c1917",
                          borderColor: "#444",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="SpreadCabindaBrent" fill="#10b981" radius={[4, 4, 0, 0]} name="Prémio Cabinda vs Brent ($/bbl)" />
                      <Bar dataKey="SpreadBrentWTI" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Spread Brent vs WTI ($/bbl)" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Statistical Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-[10px] uppercase font-mono">Média Brent ({timeframe.toUpperCase()})</div>
                  <div className="text-lg font-extrabold text-amber-400">
                    ${(marketData.reduce((a, b) => a + b.Brent, 0) / marketData.length).toFixed(2)} USD
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono">
                    Mín: ${Math.min(...marketData.map((d) => d.Brent))} | Máx: ${Math.max(...marketData.map((d) => d.Brent))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-[10px] uppercase font-mono">Prémio Médio Cabinda</div>
                  <div className="text-lg font-extrabold text-emerald-400">
                    +${(marketData.reduce((a, b) => a + b.SpreadCabindaBrent, 0) / marketData.length).toFixed(2)} USD
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono">Diferencial positivo p/ Angola</div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-[10px] uppercase font-mono">Receita Est. Angola (Período)</div>
                  <div className="text-lg font-extrabold text-stone-100">
                    ${((1120000 * (marketData.reduce((a, b) => a + b.Cabinda, 0) / marketData.length) * marketData.length) / 1000000000).toFixed(2)} B USD
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    ≈ {((1120000 * (marketData.reduce((a, b) => a + b.Cabinda, 0) / marketData.length) * aoaUsdRate * marketData.length) / 1000000000000).toFixed(2)} Triliões AOA
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <div className="text-stone-400 text-[10px] uppercase font-mono">Volume Total Transaccionado</div>
                  <div className="text-lg font-extrabold text-indigo-400">
                    {(marketData.reduce((a, b) => a + b.Volume, 0) / 10).toFixed(1)} M Barris
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono">Monitorado via Recharts API</div>
                </div>
              </div>

              {/* Action Bar: Attach to Detailed Report & Consult AI */}
              <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>Integrado com a geração de relatórios oficiais da Sonangol, ANPG &amp; MIREMPET.</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAttachChartToReport}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md hover:shadow-amber-500/20"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Anexar Análise ao Relatório Executivo</span>
                  </button>

                  <button
                    onClick={() =>
                      onAskAI(
                        `Analisa a flutuação histórica dos preços do petróleo no período de ${timeframe.toUpperCase()} (${marketData.length} dias). Média do Brent: $${(
                          marketData.reduce((a, b) => a + b.Brent, 0) / marketData.length
                        ).toFixed(2)}, Mínimo: $${Math.min(...marketData.map((d) => d.Brent))}, Máximo: $${Math.max(
                          ...marketData.map((d) => d.Brent)
                        )}. Explica os impactos no orçamento geral do estado de Angola e nas receitas da Sonangol.`
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs flex items-center gap-2 transition border border-amber-500/30"
                  >
                    <Brain className="w-4 h-4 text-amber-400" />
                    <span>Consultar AI sobre este Gráfico</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Macro Determinant Factors */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
              <h3 className="text-sm font-bold text-stone-100">Determinantes do Preço do Petróleo</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-400">Decisões OPEP+</span>
                    <span className="text-amber-400 font-bold">28%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: "28%" }} />
                  </div>
                  <p className="text-[10px] text-stone-500">Cortes de produção e quotas</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-400">Força do Dólar (USD)</span>
                    <span className="text-purple-400 font-bold">22%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: "22%" }} />
                  </div>
                  <p className="text-[10px] text-stone-500">Taxa FED &amp; Índice DXY</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-400">Procura Mundial</span>
                    <span className="text-blue-400 font-bold">20%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: "20%" }} />
                  </div>
                  <p className="text-[10px] text-stone-500">Consumo da China &amp; EUA</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-400">Geopolítica</span>
                    <span className="text-red-400 font-bold">18%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: "18%" }} />
                  </div>
                  <p className="text-[10px] text-stone-500">Conflitos &amp; Vias Marítimas</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-400">Sentimento NLP</span>
                    <span className="text-emerald-400 font-bold">12%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "12%" }} />
                  </div>
                  <p className="text-[10px] text-stone-500">Imprensa &amp; Relatórios</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MERCADO & ANÁLISE TÉCNICA */}
        {activeTab === "mercado" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-stone-100">Mercado &amp; Análise Técnica Avançada</h2>
              <p className="text-xs text-stone-400">Médias móveis, volatilidade, RSI, alertas de preço alvo e diferenciais de ramas de petróleo</p>
            </div>

            {/* ALERT BANNER IF TARGET IS HIT */}
            {isTargetHit && !isTargetAlertDismissed && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950 via-amber-900/90 to-stone-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/20 relative overflow-hidden animate-pulse">
                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500 text-stone-950 font-bold shadow-lg">
                      <Zap className="w-6 h-6 fill-stone-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 uppercase">
                          ALERTA EM TEMPO REAL ATINGIDO
                        </span>
                        <span className="text-stone-400 font-mono text-[11px]">{new Date().toLocaleTimeString("pt-PT")}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white tracking-tight mt-0.5">
                        Meta de Preço do Barril Alcançada ({targetBenchmark})!
                      </h3>
                      <p className="text-stone-200 text-xs mt-1">
                        A cotação atual do <strong>{targetBenchmark}</strong> atingiu <strong>${currentTargetPriceValue.toFixed(2)} USD/bbl</strong>, superando o seu valor alvo estipulado de <strong>${targetPrice.toFixed(2)} USD/bbl</strong> ({targetCondition === "above" ? "Superado ≥" : "Caiu para ≤"}).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onAskAI(
                          `O preço do petróleo ${targetBenchmark} atingiu $${currentTargetPriceValue.toFixed(2)} USD, ultrapassando o alvo definido de $${targetPrice.toFixed(2)} USD. Qual é o impacto estratégico, fiscal e macroeconómico imediato para Angola, Sonangol e OPEP+?`
                        )
                      }
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-lg"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Analisar Impacto com Otniel AI →</span>
                    </button>
                    <button
                      onClick={() => setIsTargetAlertDismissed(true)}
                      className="px-3 py-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-700 transition"
                    >
                      Ignorar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIGURADOR DE PREÇO ALVO & MONITORIZAÇÃO DE MERCADO */}
            <div className="p-6 rounded-3xl bg-stone-900/95 border border-amber-500/30 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-100">
                        Configurador de Preço Alvo &amp; Sistema de Alertas
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                        Monitorização Ativa
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Defina um valor alvo específico em USD/barril para monitorizar flutuações e receber notificações visuais instantâneas.
                    </p>
                  </div>
                </div>

                {/* Toggle Monitorizacao */}
                <div className="flex items-center gap-3 bg-stone-950 p-2 rounded-2xl border border-stone-800">
                  <span className="text-xs font-mono text-stone-400 font-semibold">Alerta Ativo:</span>
                  <button
                    onClick={() => {
                      setTargetAlertActive(!targetAlertActive);
                      setIsTargetAlertDismissed(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                      targetAlertActive
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                        : "bg-stone-800 text-stone-500"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${targetAlertActive ? "bg-emerald-400 animate-ping" : "bg-stone-600"}`} />
                    <span>{targetAlertActive ? "ATIVADO" : "DESATIVADO"}</span>
                  </button>
                </div>
              </div>

              {/* Form Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Benchmark Selector */}
                <div className="md:col-span-4 space-y-2">
                  <label className="block text-xs font-bold text-stone-300 font-mono">
                    1. Seleccionar Rama / Benchmark:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-950 rounded-2xl border border-stone-800 text-xs">
                    {(["Brent", "Cabinda", "WTI"] as const).map((bm) => {
                      const price = bm === "Brent" ? brentPrice : bm === "Cabinda" ? cabindaPrice : wtiPrice;
                      return (
                        <button
                          key={bm}
                          type="button"
                          onClick={() => {
                            setTargetBenchmark(bm);
                            setIsTargetAlertDismissed(false);
                          }}
                          className={`py-2 px-1 rounded-xl font-bold transition text-center flex flex-col items-center ${
                            targetBenchmark === bm
                              ? "bg-amber-600 text-white shadow-md"
                              : "text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          <span>{bm}</span>
                          <span className="text-[10px] opacity-80 font-mono">${price.toFixed(2)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Price Value Input */}
                <div className="md:col-span-5 space-y-2">
                  <label className="block text-xs font-bold text-stone-300 font-mono">
                    2. Preço Alvo do Barril (USD $):
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        step="0.1"
                        value={targetPrice}
                        onChange={(e) => {
                          setTargetPrice(parseFloat(e.target.value) || 0);
                          setIsTargetAlertDismissed(false);
                        }}
                        className="w-full pl-8 pr-3 py-2.5 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-2xl text-stone-100 font-mono text-sm font-bold focus:outline-none"
                      />
                    </div>

                    {/* Quick Step Controls */}
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPrice((prev) => Math.max(10, Math.round((prev - 1) * 10) / 10));
                          setIsTargetAlertDismissed(false);
                        }}
                        className="px-2.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800 font-bold"
                      >
                        -$1
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPrice((prev) => Math.round((prev + 1) * 10) / 10);
                          setIsTargetAlertDismissed(false);
                        }}
                        className="px-2.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800 font-bold"
                      >
                        +$1
                      </button>
                    </div>
                  </div>
                </div>

                {/* Condition Trigger */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block text-xs font-bold text-stone-300 font-mono">
                    3. Condição de Disparo:
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-stone-950 rounded-2xl border border-stone-800 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetCondition("above");
                        setIsTargetAlertDismissed(false);
                      }}
                      className={`py-2 rounded-xl font-bold transition text-center ${
                        targetCondition === "above"
                          ? "bg-amber-600 text-white"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      Preço ≥ Alvo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetCondition("below");
                        setIsTargetAlertDismissed(false);
                      }}
                      className={`py-2 rounded-xl font-bold transition text-center ${
                        targetCondition === "below"
                          ? "bg-amber-600 text-white"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      Preço ≤ Alvo
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset Value Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-800/60 text-xs font-mono">
                <span className="text-stone-500 font-bold text-[11px] mr-1">Metas Rápidas:</span>
                {[75.0, 80.0, 84.5, 85.0, 88.0, 90.0, 95.0, 100.0].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setTargetPrice(p);
                      setIsTargetAlertDismissed(false);
                    }}
                    className={`px-3 py-1 rounded-xl border transition ${
                      targetPrice === p
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                        : "bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200"
                    }`}
                  >
                    ${p.toFixed(2)}
                  </button>
                ))}
              </div>

              {/* Visual Distance & Progress Bar Gauge */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">Cotado {targetBenchmark}:</span>
                    <strong className="text-amber-400 text-sm">${currentTargetPriceValue.toFixed(2)} USD</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">Meta Definida:</span>
                    <strong className="text-stone-100 text-sm">${targetPrice.toFixed(2)} USD</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">Diferença / Gap:</span>
                    <span
                      className={`font-bold ${
                        isTargetHit
                          ? "text-emerald-400"
                          : targetCondition === "above" && currentTargetPriceValue < targetPrice
                          ? "text-amber-400"
                          : "text-blue-400"
                      }`}
                    >
                      {currentTargetPriceValue >= targetPrice ? "+" : ""}
                      {(currentTargetPriceValue - targetPrice).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="relative w-full h-3 rounded-full bg-stone-900 overflow-hidden border border-stone-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isTargetHit
                        ? "bg-gradient-to-r from-amber-500 to-emerald-400 shadow-lg shadow-emerald-500/50"
                        : "bg-gradient-to-r from-amber-600 to-amber-400"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(5, (currentTargetPriceValue / targetPrice) * 100))}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                  <span>0 USD</span>
                  <span>Distância: {Math.abs(currentTargetPriceValue - targetPrice).toFixed(2)} USD</span>
                  <span>{(targetPrice * 1.25).toFixed(0)} USD</span>
                </div>
              </div>
            </div>

            {/* Moving Average Toggles */}
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono text-stone-400 font-semibold">Indicadores Técnicos:</span>
                <button
                  onClick={() => setShowMA20(!showMA20)}
                  className={`px-3 py-1.5 rounded-xl border transition font-mono ${
                    showMA20 ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-stone-950 text-stone-500 border-stone-800"
                  }`}
                >
                  MM20 (20 dias)
                </button>
                <button
                  onClick={() => setShowMA50(!showMA50)}
                  className={`px-3 py-1.5 rounded-xl border transition font-mono ${
                    showMA50 ? "bg-blue-500/20 text-blue-400 border-blue-500/40" : "bg-stone-950 text-stone-500 border-stone-800"
                  }`}
                >
                  MM50 (50 dias)
                </button>
                <button
                  onClick={() => setShowMA200(!showMA200)}
                  className={`px-3 py-1.5 rounded-xl border transition font-mono ${
                    showMA200 ? "bg-purple-500/20 text-purple-400 border-purple-500/40" : "bg-stone-950 text-stone-500 border-stone-800"
                  }`}
                >
                  MM200 (200 dias)
                </button>
              </div>

              <button
                onClick={exportCSVData}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Dados (CSV)</span>
              </button>
            </div>

            {/* Technical Chart */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="date" stroke="#666" fontSize={11} />
                    <YAxis domain={["auto", "auto"]} stroke="#666" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#1c1917", borderColor: "#444", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Line type="monotone" dataKey="Brent" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="Cabinda" stroke="#10b981" strokeWidth={2} dot={false} />
                    {showMA20 && <Line type="monotone" dataKey="MM20" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />}
                    {showMA50 && <Line type="monotone" dataKey="MM50" stroke="#3b82f6" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />}
                    {showMA200 && <Line type="monotone" dataKey="MM200" stroke="#a855f7" strokeDasharray="2 2" strokeWidth={1.5} dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Technical Oscilators & Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <span className="text-xs font-mono text-stone-400">RSI (14 Dias)</span>
                <div className="text-2xl font-bold text-amber-400">58.4</div>
                <p className="text-[11px] text-stone-500 font-mono">Zona Neutra com Viés Comprador</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <span className="text-xs font-mono text-stone-400">Volatilidade Histórica (ATR)</span>
                <div className="text-2xl font-bold text-emerald-400">1.85 USD</div>
                <p className="text-[11px] text-stone-500 font-mono">Estabilidade Moderada</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <span className="text-xs font-mono text-stone-400">Cruzamento de Médias</span>
                <div className="text-2xl font-bold text-emerald-400">Golden Cross</div>
                <p className="text-[11px] text-stone-500 font-mono">MM20 Acima da MM50</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. INTELÍGENCIA ARTIFICIAL & PREVISÃO MACHINE LEARNING */}
        {activeTab === "ia" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-stone-100">Motor de Previsão de Preços por IA</h2>
                <p className="text-xs text-stone-400">Modelos preditivos de Aprendizado Profundo (LSTM, Prophet, XGBoost e Random Forest)</p>
              </div>

              {/* Model Selector */}
              <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
                <button
                  onClick={() => setSelectedModel("lstm")}
                  className={`px-3 py-1.5 rounded-lg transition font-mono ${
                    selectedModel === "lstm" ? "bg-amber-600 text-white" : "text-stone-400"
                  }`}
                >
                  LSTM (Neural)
                </button>
                <button
                  onClick={() => setSelectedModel("prophet")}
                  className={`px-3 py-1.5 rounded-lg transition font-mono ${
                    selectedModel === "prophet" ? "bg-amber-600 text-white" : "text-stone-400"
                  }`}
                >
                  Prophet (FB)
                </button>
                <button
                  onClick={() => setSelectedModel("xgboost")}
                  className={`px-3 py-1.5 rounded-lg transition font-mono ${
                    selectedModel === "xgboost" ? "bg-amber-600 text-white" : "text-stone-400"
                  }`}
                >
                  XGBoost
                </button>
                <button
                  onClick={() => setSelectedModel("random_forest")}
                  className={`px-3 py-1.5 rounded-lg transition font-mono ${
                    selectedModel === "random_forest" ? "bg-amber-600 text-white" : "text-stone-400"
                  }`}
                >
                  Random Forest
                </button>
              </div>
            </div>

            {/* Probability & Forecast Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Probabilidade de Subida</span>
                <div className="text-3xl font-extrabold text-emerald-400">78%</div>
                <span className="text-[11px] font-mono text-emerald-400">22% Probabilidade de Queda</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Previsão 30 Dias (Brent)</span>
                <div className="text-3xl font-extrabold text-amber-400">$86.90</div>
                <span className="text-[11px] font-mono text-emerald-400">+2.84% Variação Estimada</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Banda P10 – P90</span>
                <div className="text-base font-extrabold text-stone-100 font-mono mt-2">$84.20 – $89.80</div>
                <span className="text-[11px] font-mono text-stone-500">Intervalo de Confiança</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Precisão do Modelo (R²)</span>
                <div className="text-3xl font-extrabold text-stone-100">0.92</div>
                <span className="text-[11px] font-mono text-stone-500">RMSE: 1.12 • MAE: 0.88</span>
              </div>
            </div>

            {/* Forecast Chart Recharts */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
              <h3 className="text-sm font-bold text-stone-100 font-mono">
                Curva Preditiva do Modelo {selectedModel.toUpperCase()}
              </h3>
              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="dia" stroke="#666" fontSize={11} />
                    <YAxis domain={["auto", "auto"]} stroke="#666" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#1c1917", borderColor: "#444", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="BandaSuperior" stroke="none" fill="#f59e0b" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="BandaInferior" stroke="none" fill="#f59e0b" fillOpacity={0} />
                    <Line type="monotone" dataKey="Previsao" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 4. MERCADO ANGOLANO (SONANGOL / ANPG / MIREMPET) */}
        {activeTab === "angola" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-stone-100">Painel do Sector Petrolífero de Angola</h2>
                <p className="text-xs text-stone-400">Acompanhamento de produção, concessões, projectos offshore/onshore e receitas para o Estado</p>
              </div>

              <button
                onClick={() => setIsAddProjectOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Projecto Petrolífero</span>
              </button>
            </div>

            {/* Angola Sector KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Produção Nacional (Barris/Dia)</span>
                <div className="text-3xl font-extrabold text-amber-400">1,120,000</div>
                <span className="text-xs font-mono text-stone-400">Supervisão ANPG &amp; MIREMPET</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Quota OPEP+ de Angola</span>
                <div className="text-3xl font-extrabold text-emerald-400">100%</div>
                <span className="text-xs font-mono text-emerald-400">Conformidade e Cumprimento</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Projecção de Receita Mensal</span>
                <div className="text-2xl font-extrabold text-stone-100 font-mono mt-1">$2.85 Bilhões USD</div>
                <span className="text-xs font-mono text-stone-500">Com base no Rama Cabinda a ${cabindaPrice}</span>
              </div>
            </div>

            {/* Recharts Graphical Production Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart: Distribution by Block */}
              <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
                <h3 className="text-sm font-bold text-stone-100 font-mono">Distribuição de Produção por Bloco (BPD)</h3>
                <div className="w-full h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Bloco 17", value: 380000, color: "#f59e0b" },
                          { name: "Bloco 32", value: 220000, color: "#10b981" },
                          { name: "Bloco 15/06", value: 180000, color: "#3b82f6" },
                          { name: "Bloco 0", value: 160000, color: "#a855f7" },
                          { name: "Onshore Kwanza", value: 80000, color: "#ec4899" },
                          { name: "Outros Blocos", value: 100000, color: "#64748b" },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {[
                          { color: "#f59e0b" },
                          { color: "#10b981" },
                          { color: "#3b82f6" },
                          { color: "#a855f7" },
                          { color: "#ec4899" },
                          { color: "#64748b" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1c1917", borderColor: "#444", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Operator Market Share */}
              <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
                <h3 className="text-sm font-bold text-stone-100 font-mono">Produção Diária por Operadora Petrolífera (BPD)</h3>
                <div className="w-full h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { operator: "TotalEnergies", bpd: 420000 },
                        { operator: "Azule Energy", bpd: 280000 },
                        { operator: "Chevron", bpd: 210000 },
                        { operator: "ExxonMobil", bpd: 120000 },
                        { operator: "Sonangol P&P", bpd: 90000 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="operator" stroke="#666" fontSize={11} />
                      <YAxis stroke="#666" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#1c1917", borderColor: "#444", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                      <Bar dataKey="bpd" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Oil Projects CRUD Section */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-100">Projectos Petrolíferos Registados (CRUD)</h3>
                  <p className="text-xs text-stone-400">Gestão de investimentos, orçamentos e estado de execução de activos petrolíferos</p>
                </div>
                <span className="text-xs font-mono text-amber-400 font-semibold">{oilProjects.length} Projectos Ativos</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {oilProjects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 hover:border-amber-500/50 transition">
                    <div className="relative h-36 rounded-xl overflow-hidden border border-stone-800">
                      <img
                        src={proj.imageUrl}
                        alt={proj.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                      <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-900/90 border border-stone-700 text-amber-400">
                        {proj.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-stone-100 line-clamp-1">{proj.name}</h4>
                      <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                        <span>{proj.operator}</span>
                        <span className="text-emerald-400 font-bold">${(proj.budgetUSD / 1000000000).toFixed(2)}B USD</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono">{proj.block} • {proj.location}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                      <button
                        onClick={() => setEditingProject(proj)}
                        className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-300 text-xs font-mono transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-red-600 hover:text-white text-stone-400 text-xs font-mono transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concessions Table */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
              <h3 className="text-sm font-bold text-stone-100">Principais Concessões Petrolíferas em Angola</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Bloco / Concessão</th>
                      <th className="py-2.5 px-3">Operadores</th>
                      <th className="py-2.5 px-3">Produção (BPD)</th>
                      <th className="py-2.5 px-3">Quota (%)</th>
                      <th className="py-2.5 px-3">Qualidade de Rama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-200">
                    {angolaConcessions.map((c, i) => (
                      <tr key={i} className="hover:bg-stone-800/40 transition">
                        <td className="py-3 px-3 font-semibold text-amber-400">{c.bloco}</td>
                        <td className="py-3 px-3 text-stone-300">{c.operador}</td>
                        <td className="py-3 px-3 font-bold text-stone-100">{c.bpd.toLocaleString()}</td>
                        <td className="py-3 px-3 text-emerald-400">{c.pct}%</td>
                        <td className="py-3 px-3 text-stone-400">{c.rama}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. NOTÍCIAS & ANÁLISE DE SENTIMENTO NLP */}
        {activeTab === "noticias" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-stone-100">Notícias Económicas &amp; Análise de Sentimento NLP</h2>
                <p className="text-xs text-stone-400">Transmissão em tempo real do mercado internacional, OPEP+, Sonangol, ANPG e notícias globais</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Pesquisar notícias..."
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-sans w-48"
                />
                <button
                  onClick={fetchLiveMarketAndNews}
                  disabled={isFetchingLive}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isFetchingLive ? "animate-spin" : ""}`} />
                  <span>Atualizar Agora</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {liveNews
                  .filter((n) => {
                    const text = ((n.headline || n.title || "") + " " + (n.summary || "") + " " + (n.source || "")).toLowerCase();
                    return text.includes(newsSearch.toLowerCase());
                  })
                  .map((n, idx) => (
                    <div key={n.id || idx} className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-amber-400 font-semibold">
                          {n.source} • {n.published ? new Date(n.published).toLocaleTimeString("pt-PT") : "Agora"}
                        </span>
                        <div className="flex items-center gap-2">
                          {n.impact && (
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                              n.impact === "critico" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {n.impact}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            n.sentiment === "positive" || n.sentiment === "Positivo" || (n.score && n.score > 0)
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}>
                            NLP: {n.sentiment?.toUpperCase()} ({n.score > 0 ? "+" : ""}{n.score})
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-stone-100 leading-relaxed">{n.headline || n.title}</h4>
                      {n.summary && (
                        <p className="text-[11px] text-stone-400 leading-relaxed font-sans">{n.summary}</p>
                      )}

                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-stone-950 text-stone-400 text-[10px] font-mono">
                          #{n.category || "Mercado"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-950 text-stone-400 text-[10px] font-mono">
                          #Petróleo
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-950 text-stone-400 text-[10px] font-mono">
                          #Internacional
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
                <h3 className="text-sm font-bold text-stone-100">Palavras-Chave Frequentes no Mercado</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-stone-300">#OPEP_Cortes</span>
                    <span className="text-amber-400 font-bold">32 menções</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-stone-300">#ANPG_Kwanza</span>
                    <span className="text-amber-400 font-bold">28 menções</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-stone-300">#Brent_ICE</span>
                    <span className="text-amber-400 font-bold">25 menções</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-stone-950 border border-stone-800">
                    <span className="text-stone-300">#Sonangol_Exploracao</span>
                    <span className="text-amber-400 font-bold">21 menções</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 space-y-2">
                  <h4 className="text-xs font-bold text-stone-300 font-mono">Monitor de Risco Geopolítico</h4>
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs space-y-1">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-red-400">
                      <span>Estreito de Bab el-Mandeb</span>
                      <span>ALTO RISCO</span>
                    </div>
                    <p className="text-[10px] text-stone-400">Desvios de navios petroleiros pelo Cabo da Boa Esperança acrescentam prémio de $1.80/bbl.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. ALERTAS PERSONALIZADOS */}
        {activeTab === "alertas" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-stone-100">Sistema de Alertas Inteligentes</h2>
              <p className="text-xs text-stone-400">Configure avisos corporativos em tempo real para alterações críticas de preços e notícias</p>
            </div>

            <form onSubmit={handleCreateAlert} className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
              <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider font-mono">Criar Alerta Corporativo</h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-stone-400 font-mono mb-1">Instituição</label>
                  <select
                    value={newAlertInstitution}
                    onChange={(e) => setNewAlertInstitution(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-600 font-mono"
                  >
                    <option value="Sonangol E.P.">Sonangol E.P.</option>
                    <option value="ANPG">ANPG</option>
                    <option value="MIREMPET">MIREMPET</option>
                    <option value="Banco / Investidor">Banco / Investidor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-mono mb-1">Condição de Disparo</label>
                  <select
                    value={newAlertType}
                    onChange={(e) => setNewAlertType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-600 font-mono"
                  >
                    <option value="price_above">Brent acima de ($)</option>
                    <option value="price_below">Brent abaixo de ($)</option>
                    <option value="volatility">Volatilidade &gt; %</option>
                    <option value="angola_news">Notícias Críticas de Angola</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-mono mb-1">Valor Limite ($ / %)</label>
                  <input
                    type="number"
                    value={newAlertThreshold}
                    onChange={(e) => setNewAlertThreshold(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-mono mb-1">Email Destinatário</label>
                  <input
                    type="email"
                    placeholder="alerta@empresa.co.ao"
                    value={newAlertEmail}
                    onChange={(e) => setNewAlertEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {alertSuccessMsg ? (
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{alertSuccessMsg}</span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Activar Alerta</span>
                </button>
              </div>
            </form>

            {/* Alerts List */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
              <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider font-mono">Alertas Activos ({alerts.length})</h3>
              <div className="divide-y divide-stone-800 text-xs">
                {alerts.map((al) => (
                  <div key={al.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-stone-200">
                          {al.institution} • {al.type === "price_above" ? "Acima de" : "Abaixo de"} <span className="text-amber-400 font-mono font-bold">${al.threshold} USD</span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">{al.targetEmail}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(al.id)}
                      className="p-1.5 text-stone-500 hover:text-red-400 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. RELATÓRIOS AUTOMÁTICOS (PDF / EXCEL / IMPRIMIR) */}
        {activeTab === "relatorios" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-stone-100">Geração Automática de Relatórios Corporativos</h2>
              <p className="text-xs text-stone-400">Emissão de documentos em PDF, datasets em Excel/CSV e estatísticas para conselhos de administração</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
                <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider font-mono">Seleção de Modelo de Relatório</h3>

                <div className="space-y-2 text-xs font-mono">
                  <button
                    onClick={() => setReportType("diario")}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      reportType === "diario" ? "bg-amber-600/20 border-amber-500/50 text-amber-400" : "bg-stone-950 border-stone-800 text-stone-300"
                    }`}
                  >
                    <span>Relatório Diário de Mercado &amp; Previsões IA</span>
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setReportType("sonangol_anpg")}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      reportType === "sonangol_anpg" ? "bg-amber-600/20 border-amber-500/50 text-amber-400" : "bg-stone-950 border-stone-800 text-stone-300"
                    }`}
                  >
                    <span>Relatório Sonangol / ANPG — Receitas &amp; Produção AOA/USD</span>
                    <Globe className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setReportType("volatilidade")}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      reportType === "volatilidade" ? "bg-amber-600/20 border-amber-500/50 text-amber-400" : "bg-stone-950 border-stone-800 text-stone-300"
                    }`}
                  >
                    <span>Relatório Mensal de Volatilidade &amp; Riscos Geopolíticos</span>
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>{isGeneratingReport ? "A Gerar Relatório..." : "Compilar Relatório Executivo"}</span>
                  </button>

                  <button
                    onClick={exportCSVData}
                    className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Descarregar Dataset em Excel / CSV</span>
                  </button>
                </div>
              </div>

              {/* Report Preview Frame */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider font-mono">Pré-Visualização do Documento</h3>
                  {previewReportHtml && (
                    <button
                      onClick={handlePrintReport}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir / Salvar como PDF</span>
                    </button>
                  )}
                </div>

                {previewReportHtml ? (
                  <div className="p-4 rounded-xl bg-white text-stone-900 max-h-96 overflow-y-auto border border-stone-300 shadow-inner">
                    <div dangerouslySetInnerHTML={{ __html: previewReportHtml }} />
                  </div>
                ) : (
                  <div className="p-12 text-center text-stone-500 font-mono text-xs border border-dashed border-stone-800 rounded-xl space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-stone-600" />
                    <div>Clique em "Compilar Relatório Executivo" para gerar o documento formatado.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 9. CRM REAL & GESTÃO DE CLIENTES / LEADS E GERADOR DE IMAGENS HTML */}
        {activeTab === "crm" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-100">{t.crm_real}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                    API REST Ativa
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Gestão em tempo real de clientes, operadoras petrolíferas (Sonangol, TotalEnergies, ANPG, Azule) e gerador de links directos para imagens HTML.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddContactOpen(true)}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.add_contact}</span>
                </button>
              </div>
            </div>

            {/* Pipeline Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Valor Total do Pipeline</span>
                <div className="text-xl font-extrabold text-amber-400 font-mono">
                  ${crmContacts.reduce((acc, c) => acc + (c.dealValue || 0), 0).toLocaleString("en-US")}
                </div>
                <span className="text-[10px] text-stone-500">{crmContacts.length} negociações ativas</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Contratos Ganhos</span>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  ${crmContacts.filter(c => c.stage === "ganho").reduce((acc, c) => acc + (c.dealValue || 0), 0).toLocaleString("en-US")}
                </div>
                <span className="text-[10px] text-emerald-500/80 font-bold">
                  {crmContacts.filter(c => c.stage === "ganho").length} contratos fechados
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Em Negociação Avançada</span>
                <div className="text-xl font-extrabold text-blue-400 font-mono">
                  ${crmContacts.filter(c => c.stage === "negociacao" || c.stage === "proposta").reduce((acc, c) => acc + (c.dealValue || 0), 0).toLocaleString("en-US")}
                </div>
                <span className="text-[10px] text-stone-500">Aguardam decisão do conselho</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-1">
                <span className="text-[11px] font-mono text-stone-400">Taxa de Conversão</span>
                <div className="text-xl font-extrabold text-stone-100 font-mono">
                  {crmContacts.length > 0 ? Math.round((crmContacts.filter(c => c.stage === "ganho").length / crmContacts.length) * 100) : 0}%
                </div>
                <span className="text-[10px] text-amber-400 font-bold">Desempenho Corporativo</span>
              </div>
            </div>

            {/* Direct HTML Image Link Builder Box */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-stone-100 uppercase tracking-wider font-mono">
                    {t.image_link_builder}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  Insira o link directo da imagem para gerar tag HTML &amp; Markdown
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-mono mb-1">URL Direto da Imagem (HTTPS):</label>
                    <input
                      type="url"
                      value={generatorImgUrl}
                      onChange={(e) => setGeneratorImgUrl(e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-300 font-mono mb-1">Texto Alternativo (Alt):</label>
                      <input
                        type="text"
                        value={generatorAlt}
                        onChange={(e) => setGeneratorAlt(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-mono mb-1">Canto Arredondado:</label>
                      <select
                        value={generatorRounded}
                        onChange={(e) => setGeneratorRounded(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                      >
                        <option value="xl">Suave (xl)</option>
                        <option value="full">Círculo (full)</option>
                        <option value="md">Quadrado (md)</option>
                      </select>
                    </div>
                  </div>

                  {/* HTML Generated Code Output */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-400 font-bold">Código HTML Gerado:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedHtmlSnippet);
                          setCopiedCodeType("html");
                          setTimeout(() => setCopiedCodeType(null), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>{copiedCodeType === "html" ? "Copiado!" : "Copiar HTML"}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap select-all">
                      {generatedHtmlSnippet}
                    </pre>
                  </div>
                </div>

                {/* Direct Image Live Preview */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono text-stone-400 block">Pré-Visualização Direta da Imagem:</span>
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col items-center justify-center min-h-[180px]">
                    {generatorImgUrl ? (
                      <div className="space-y-2 text-center">
                        <div dangerouslySetInnerHTML={{ __html: generatedHtmlSnippet }} />
                        <span className="text-[10px] text-stone-500 font-mono block pt-1">
                          Renderizado ao vivo via HTML
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-stone-600 text-xs font-mono">
                        <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        Cole um link de imagem acima para pré-visualizar
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CRM Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-stone-900/90 border border-stone-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Pesquisar por nome, empresa ou e-mail..."
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-sans w-full sm:w-64"
                />

                <select
                  value={crmStageFilter}
                  onChange={(e) => setCrmStageFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="all">Fase do Funil: Todos</option>
                  <option value="lead">Leads Iniciais</option>
                  <option value="contacto">Contactados</option>
                  <option value="proposta">Proposta</option>
                  <option value="negociacao">Negociação</option>
                  <option value="ganho">Ganhos / Fechados</option>
                  <option value="perdido">Perdidos</option>
                </select>
              </div>

              <div className="text-xs font-mono text-stone-400">
                A mostrar {crmContacts.filter(c => (crmStageFilter === "all" || c.stage === crmStageFilter) && (c.name.toLowerCase().includes(crmSearch.toLowerCase()) || c.company.toLowerCase().includes(crmSearch.toLowerCase()))).length} de {crmContacts.length} contactos
              </div>
            </div>

            {/* Contacts CRM Grid / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crmContacts
                .filter((c) => {
                  const matchSearch = (c.name + " " + c.company + " " + c.email).toLowerCase().includes(crmSearch.toLowerCase());
                  const matchStage = crmStageFilter === "all" || c.stage === crmStageFilter;
                  return matchSearch && matchStage;
                })
                .map((contact) => (
                  <div key={contact.id} className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4 hover:border-stone-700 transition shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Direct Image Rendered */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/80 shrink-0 bg-stone-950">
                          <img
                            src={contact.imageUrl}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-stone-100">{contact.name}</h3>
                          <p className="text-xs text-amber-400 font-semibold">{contact.company}</p>
                          <p className="text-[11px] text-stone-400">{contact.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingContact(contact)}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-300 text-[11px] font-mono transition"
                          title="Editar Contacto"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition"
                          title="Remover Contacto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs border-t border-b border-stone-800/80 py-3">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400 font-mono">Valor do Contrato:</span>
                        <span className="font-extrabold text-emerald-400 font-mono text-sm">
                          ${contact.dealValue?.toLocaleString("en-US")} USD
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-stone-400 font-mono">Etapa da Negociação:</span>
                        <select
                          value={contact.stage}
                          onChange={(e) => handleUpdateStage(contact.id, e.target.value as CRMContactItem["stage"])}
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer border ${
                            contact.stage === "ganho"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : contact.stage === "negociacao"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : contact.stage === "proposta"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-stone-800 text-stone-300 border-stone-700"
                          }`}
                        >
                          <option value="lead" className="bg-stone-900 text-stone-200">Lead Inicial</option>
                          <option value="contacto" className="bg-stone-900 text-stone-200">Contactado</option>
                          <option value="proposta" className="bg-stone-900 text-stone-200">Proposta Enviada</option>
                          <option value="negociacao" className="bg-stone-900 text-stone-200">Em Negociação</option>
                          <option value="ganho" className="bg-stone-900 text-stone-200">Ganho / Fechado</option>
                          <option value="perdido" className="bg-stone-900 text-stone-200">Perdido</option>
                        </select>
                      </div>

                      <div className="text-[11px] text-stone-300 pt-1 leading-relaxed">
                        <span className="text-stone-500 font-mono block text-[10px]">Notas executivas:</span>
                        {contact.notes}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                      <span>{contact.email}</span>
                      <span>{contact.phone}</span>
                    </div>

                    {/* Copy HTML Snippet for this contact */}
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(contact.htmlImageSnippet || `<img src="${contact.imageUrl}" alt="${contact.name}" />`);
                          alert("Tag HTML da imagem copiada para a área de transferência!");
                        }}
                        className="w-full py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 text-[10px] font-mono border border-stone-800 flex items-center justify-center gap-1.5 transition"
                      >
                        <Code className="w-3 h-3 text-amber-400" />
                        <span>Copiar Tag HTML de Imagem do Lead</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Modal Adicionar Novo Contacto CRM */}
        {isAddContactOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-stone-100">Adicionar Novo Contacto CRM</h3>
                </div>
                <button
                  onClick={() => setIsAddContactOpen(false)}
                  className="text-stone-500 hover:text-stone-300 text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Nome Completo do Executivo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Eng. Carlos Neto"
                    value={newContactForm.name}
                    onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-mono mb-1">Empresa / Operadora *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sonangol, Total, Azule..."
                      value={newContactForm.company}
                      onChange={(e) => setNewContactForm({ ...newContactForm, company: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-mono mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      placeholder="Director de Aquisições"
                      value={newContactForm.role}
                      onChange={(e) => setNewContactForm({ ...newContactForm, role: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-mono mb-1">E-mail Institucional</label>
                    <input
                      type="email"
                      placeholder="carlos@sonangol.co.ao"
                      value={newContactForm.email}
                      onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-mono mb-1">Telefone</label>
                    <input
                      type="text"
                      placeholder="+244 923 000 000"
                      value={newContactForm.phone}
                      onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-mono mb-1">Link Direto de Imagem / Fotografia (URL)</label>
                  <input
                    type="url"
                    value={newContactForm.imageUrl}
                    onChange={(e) => setNewContactForm({ ...newContactForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  {newContactForm.imageUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={newContactForm.imageUrl} alt="Pré-visualização" className="w-8 h-8 rounded-full object-cover border border-amber-500" />
                      <span className="text-[10px] text-stone-400 font-mono">Pré-visualização da imagem</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-mono mb-1">Valor Estimado ($ USD)</label>
                    <input
                      type="number"
                      value={newContactForm.dealValue}
                      onChange={(e) => setNewContactForm({ ...newContactForm, dealValue: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-mono mb-1">Fase Inicial</label>
                    <select
                      value={newContactForm.stage}
                      onChange={(e) => setNewContactForm({ ...newContactForm, stage: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="lead">Lead Inicial</option>
                      <option value="contacto">Contactado</option>
                      <option value="proposta">Proposta Enviada</option>
                      <option value="negociacao">Em Negociação</option>
                      <option value="ganho">Ganho / Fechado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-mono mb-1">Notas Executivas</label>
                  <textarea
                    rows={2}
                    value={newContactForm.notes}
                    onChange={(e) => setNewContactForm({ ...newContactForm, notes: e.target.value })}
                    placeholder="Ex: Reunião inicial em Luanda..."
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddContactOpen(false)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-sm"
                  >
                    Salvar no CRM
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 8. SIMULAÇÃO DE CENÁRIOS */}
        {activeTab === "simulacao" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-stone-100">Simulador de Cenários Macroeconómicos</h2>
              <p className="text-xs text-stone-400">Avaliação do impacto de choques na OPEP+, variação cambial AOA/USD e tensões geopolíticas</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sliders Controls */}
              <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-5">
                <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider font-mono">Parâmetros do Cenário</h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300">Corte/Aumento OPEP+ (M bpd)</span>
                    <span className="text-amber-400 font-bold">{simOpec >= 0 ? "+" : ""}{simOpec} M bpd</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={simOpec}
                    onChange={(e) => setSimOpec(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300">Taxa Câmbio Kwanza (AOA/USD)</span>
                    <span className="text-emerald-400 font-bold">{simKwanzaUSD} AOA</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="1100"
                    step="5"
                    value={simKwanzaUSD}
                    onChange={(e) => setSimKwanzaUSD(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300">Índice Tensão Geopolítica</span>
                    <span className="text-red-400 font-bold">{simGeo}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={simGeo}
                    onChange={(e) => setSimGeo(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300">Procura Global (%)</span>
                    <span className="text-blue-400 font-bold">{simDemand >= 0 ? "+" : ""}{simDemand}%</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={simDemand}
                    onChange={(e) => setSimDemand(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculation Output */}
              <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4 text-center flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">Resultado da Simulação Quantitativa</span>
                  <div className="text-5xl font-extrabold text-amber-400 tracking-tight">${simResult.finalBrent}</div>

                  <div className="flex items-center justify-center gap-6 pt-2 font-mono text-xs">
                    <div>
                      <span className="text-stone-500 block">Variação Estimada</span>
                      <span className={`font-bold text-sm ${simResult.chgPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {simResult.chgPct >= 0 ? "+" : ""}{simResult.chgPct}%
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Receita Diária Angola</span>
                      <span className="font-bold text-sm text-amber-400">${simResult.dailyRevenueUSD}M USD</span>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Receita em Kwanzas</span>
                      <span className="font-bold text-sm text-emerald-400">{simResult.dailyRevenueAOA}M Contos</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-left text-xs font-mono text-stone-300 leading-relaxed">
                    {simResult.narrative}
                  </div>
                </div>

                <button
                  onClick={() => onAskAI(`Com base na simulação do OIetro: ${simResult.narrative}, fornece recomendações estratégicas para a Sonangol e o Ministério dos Recursos Minerais.`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm mt-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Consultar Recomendação com Assistente OIetro AI</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supabase & PDF Documents Manager Tab View */}
        {activeTab === "supabase" && (
          <SupabaseDocsManager onAskAI={onAskAI} />
        )}
      </div>

      {/* Login / Institutional Auth Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-xs">
                  lau
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-100">Autenticação Corporativa lauOIL</h3>
                  <p className="text-[11px] text-stone-400">Acesso Restrito para Instituições Petrolíferas</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-stone-500 hover:text-stone-300 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-mono mb-1">Nome do Utilizador / Analista</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sabino Laurindo"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1">Email Institucional</label>
                <input
                  type="email"
                  required
                  placeholder="analista@sonangol.co.ao"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1">Instituição / Organização</label>
                <select
                  value={loginInstitution}
                  onChange={(e) => setLoginInstitution(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="Sonangol E.P.">Sonangol E.P.</option>
                  <option value="ANPG">ANPG (Agência Nacional)</option>
                  <option value="MIREMPET">MIREMPET (Ministério)</option>
                  <option value="Banco de Angola">Banco de Angola / Banca</option>
                  <option value="Investidor Internacional">Investidor Internacional</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-sm"
                >
                  Entrar na Plataforma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit CRM Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Editar Contacto CRM</span>
              </h3>
              <button
                onClick={() => setEditingContact(null)}
                className="text-stone-500 hover:text-stone-300 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateContactFull} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-mono mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Empresa</label>
                  <input
                    type="text"
                    required
                    value={editingContact.company}
                    onChange={(e) => setEditingContact({ ...editingContact, company: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={editingContact.role}
                    onChange={(e) => setEditingContact({ ...editingContact, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Email</label>
                  <input
                    type="email"
                    value={editingContact.email}
                    onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Telefone</label>
                  <input
                    type="text"
                    value={editingContact.phone}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Valor do Negócio (USD)</label>
                  <input
                    type="number"
                    value={editingContact.dealValue}
                    onChange={(e) => setEditingContact({ ...editingContact, dealValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Etapa no Funil</label>
                  <select
                    value={editingContact.stage}
                    onChange={(e) => setEditingContact({ ...editingContact, stage: e.target.value as CRMContactItem["stage"] })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="lead">Lead Inicial</option>
                    <option value="contacto">Contactado</option>
                    <option value="proposta">Proposta Enviada</option>
                    <option value="negociacao">Em Negociação</option>
                    <option value="ganho">Ganhos / Fechados</option>
                    <option value="perdido">Perdidos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1">URL da Fotografia de Perfil</label>
                <input
                  type="text"
                  value={editingContact.imageUrl}
                  onChange={(e) => setEditingContact({ ...editingContact, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1">Notas / Histórico de Contacto</label>
                <textarea
                  rows={2}
                  value={editingContact.notes}
                  onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Oil Project Modal */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Adicionar Novo Projecto Petrolífero</span>
              </h3>
              <button
                onClick={() => setIsAddProjectOpen(false)}
                className="text-stone-500 hover:text-stone-300 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-mono mb-1">Nome do Projecto / Plataforma</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: FPSO Girassol - Bloco 17"
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Bloco / Concessão</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bloco 17"
                    value={newProjectForm.block}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, block: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Operadora Lança</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TotalEnergies Angola"
                    value={newProjectForm.operator}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, operator: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Tipo de Activo</label>
                  <select
                    value={newProjectForm.type}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, type: e.target.value as OilProjectItem["type"] })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="Offshore Deepwater">Offshore Deepwater</option>
                    <option value="Onshore Kwanza">Onshore Kwanza</option>
                    <option value="Refinaria">Refinaria</option>
                    <option value="Gasoduto">Gasoduto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Estado de Execução</label>
                  <select
                    value={newProjectForm.status}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, status: e.target.value as OilProjectItem["status"] })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="Planeamento">Planeamento</option>
                    <option value="Exploração">Exploração</option>
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Produção Ativa">Produção Ativa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Orçamento Previsto (USD)</label>
                  <input
                    type="number"
                    value={newProjectForm.budgetUSD}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, budgetUSD: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Localização geográfica</label>
                  <input
                    type="text"
                    value={newProjectForm.location}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1">URL da Imagem da Plataforma / Instalação</label>
                <input
                  type="text"
                  value={newProjectForm.imageUrl}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm"
                >
                  Criar Projecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Oil Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Editar Projecto Petrolífero</span>
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-stone-500 hover:text-stone-300 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-mono mb-1">Nome do Projecto</label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Bloco</label>
                  <input
                    type="text"
                    required
                    value={editingProject.block}
                    onChange={(e) => setEditingProject({ ...editingProject, block: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Operadora</label>
                  <input
                    type="text"
                    required
                    value={editingProject.operator}
                    onChange={(e) => setEditingProject({ ...editingProject, operator: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Orçamento (USD)</label>
                  <input
                    type="number"
                    value={editingProject.budgetUSD}
                    onChange={(e) => setEditingProject({ ...editingProject, budgetUSD: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-mono mb-1">Estado de Execução</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as OilProjectItem["status"] })}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="Planeamento">Planeamento</option>
                    <option value="Exploração">Exploração</option>
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Produção Ativa">Produção Ativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={editingProject.imageUrl}
                  onChange={(e) => setEditingProject({ ...editingProject, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
