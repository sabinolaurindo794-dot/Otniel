import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Upload,
  FileText,
  Briefcase,
  User,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  History,
  RefreshCw,
  Send,
  Bot,
  Brain,
  ShieldCheck,
  Zap,
  ChevronRight,
  BarChart2,
  Clock,
  ArrowRight,
  Download,
  Plus,
  X,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Language, translations } from "../data/translations";

interface AIInterviewSimulatorProps {
  currentLanguage?: Language;
  onAskAI?: (prompt: string) => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
    company: string;
  } | null;
}

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
  interviewerAvatar?: string;
  question: string;
  candidateAnswer?: string;
  feedback?: FeedbackDetail;
  timestamp: string;
}

interface InterviewSessionData {
  sessionId: string;
  candidateName: string;
  targetRole: string;
  companyName: string;
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

const SAMPLE_CVS = [
  {
    title: "Engenheiro de Reservatórios Sénior (Petróleo & Gás)",
    role: "Engenheiro de Reservatórios Sénior",
    company: "Sonangol / Operadoras Offshore",
    cv: `NOME: Eng. Manuel Silva
EXPERIÊNCIA: 12 anos em Engenharia de Reservatórios e Simulação Numérica no Offshore de Angola (Blocos 15, 17 e 32).
COMPETÊNCIAS: Eclipse, Petrel, Análise de Declínio de Produção, Recuperação Avançada EOR (Injecção de Água e Gás), Cálculo de Reservas STOOIP.
HISTÓRICO PROFISSIONAL:
- 2020-Presente: Lead Reservoir Engineer na Sonangol P&P. Liderança de equipa na optimização da recuperação do Bloco 32.
- 2015-2020: Senior Reservoir Engineer na TotalEnergies Angola. Modelagem de reservatórios em águas profundas.
FORMAÇÃO: Mestrado em Engenharia de Petróleos pela Universidade Agostinho Neto / Imperial College London.`,
    job: `VAGA: Gestor / Líder de Equipa de Engenharia de Reservatórios (Offshore Deepwater)
EXIGÊNCIAS:
- Mínimo de 10 anos de experiência comprovada no sector petrolífero angolano.
- Domínio em simulação dinâmica (ECLIPSE / CMG) e gestão de reservatórios maduros.
- Experiência em apresentação de relatórios de reservas à ANPG e consórcios.
- Capacidade demonstrada de gestão de conflitos e liderança de equipas multidisciplinares.`,
  },
  {
    title: "Director de TI & Cibersegurança Corporativa",
    role: "Director de TI & Cibersegurança",
    company: "Multinacional de Energia",
    cv: `NOME: Dra. Beatriz Santos
EXPERIÊNCIA: 10 anos de liderança em Infraestrutura de TI, Nuvem Privada e Segurança da Informação.
COMPETÊNCIAS: ISO 27001, Arquitectura Cloud, Protecção de Infraestruturas Críticas SCADA/ICS, SIEM, Gestão de Risco.
HISTÓRICO:
- 2021-Presente: Head of Cybersecurity & Infrastructure em empresa petrolífera internacional em Luanda.
- 2016-2021: Senior Security Architect. Implementação de SOC e conformidade com regulamentos do BNA e MIREMPET.
FORMAÇÃO: Licenciatura em Ciência da Computação, Certificação CISM & CISSP.`,
    job: `VAGA: Director Executivo de Tecnologia e Cibersegurança (CIO/CISO)
EXIGÊNCIAS:
- Liderança de equipas de TI e protecção de activos críticos de exploração e refinação.
- Experiência em mitigação de ameaças cibernéticas contra sistemas industriais IoT e servidores corporativos.
- Visão estratégica de investimento em TI e governação corporativa.`,
  },
  {
    title: "Analista Financeiro & Modelagem de Activos Petrolíferos",
    role: "Analista Financeiro Sénior",
    company: "ANPG / Sector Financeiro",
    cv: `NOME: Dr. Carlos Neto
EXPERIÊNCIA: 8 anos em Avaliação Económica de Projectos E&P, Avaliação de Risco Fiscal Petrolífero (PSA/Concessões).
COMPETÊNCIAS: Modelagem Financeira Avançada em Excel/Python, NPV, IRR, Valuation, Análise de Sensibilidade do Preço do Brent.
HISTÓRICO:
- 2019-Presente: Analista Financeiro Sénior de Activos Petrolíferos.
FORMAÇÃO: Licenciatura em Economia pela UAN, CFA Level 2 Candidate.`,
    job: `VAGA: Especialista em Modelagem Económica e Concessões Petrolíferas
EXIGÊNCIAS:
- Avaliação de viabilidade financeira de blocos petrolíferos onshore e offshore em Angola.
- Domínio do regime fiscal petrolífero angolano (Lei das Operações Petrolíferas).`,
  },
];

export const AIInterviewSimulator: React.FC<AIInterviewSimulatorProps> = ({
  currentLanguage = "pt",
  onAskAI,
  currentUser,
}) => {
  const t = translations[currentLanguage] || translations.pt;

  const userHeaders = {
    "x-user-email": currentUser?.email || "guest@lauoil.ao",
    "x-user-id": currentUser?.id || "usr-guest",
  };

  const [activeTab, setActiveTab] = useState<"setup" | "interview" | "history">("setup");

  // Setup Form State
  const [candidateName, setCandidateName] = useState("Eng. Manuel Silva");
  const [targetRole, setTargetRole] = useState("Engenheiro de Reservatórios Sénior");
  const [companyName, setCompanyName] = useState("Sonangol E.P. / Consórcio Offshore");
  const [cvText, setCvText] = useState(SAMPLE_CVS[0].cv);
  const [jobDescription, setJobDescription] = useState(SAMPLE_CVS[0].job);

  // Session State
  const [currentSession, setCurrentSession] = useState<InterviewSessionData | null>(null);
  const [pastSessions, setPastSessions] = useState<InterviewSessionData[]>([]);
  const [candidateResponseText, setCandidateResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  // Voice Controls State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load past sessions from API (Isolated per User)
  const fetchPastSessions = async () => {
    try {
      const res = await fetch("/api/interview/sessions", {
        headers: userHeaders,
      });
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.sessions)) {
        setPastSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to load past sessions", err);
    }
  };

  useEffect(() => {
    fetchPastSessions();
  }, [currentUser?.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.turns, isSubmittingResponse]);

  // Voice Recognition (Speech-To-Text) Setup
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("O seu navegador não suporta a API de Reconhecimento de Voz (Web Speech API). Por favor digite a sua resposta.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage === "en" ? "en-US" : "pt-PT";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateResponseText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setIsListening(false);
    }
  };

  // Text-To-Speech (TTS) Voice Readout
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window) || !ttsEnabled) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === "en" ? "en-US" : "pt-PT";
    utterance.rate = speechRate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Select Preset Sample CV
  const handleSelectSampleCv = (index: number) => {
    const sample = SAMPLE_CVS[index];
    setTargetRole(sample.role);
    setCompanyName(sample.company);
    setCvText(sample.cv);
    setJobDescription(sample.job);
  };

  const [isParsingPdfCv, setIsParsingPdfCv] = useState(false);
  const [pdfUploadNotice, setPdfUploadNotice] = useState<string | null>(null);

  // File Upload Reader (PDF & Text support)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfUploadNotice(null);

    // If PDF file, use server PDF Gemini AI parser
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setIsParsingPdfCv(true);
      setPdfUploadNotice(`Analisando documento PDF "${file.name}" com Gemini AI...`);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const res = await fetch("/api/interview/parse-pdf-cv", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...userHeaders,
            },
            body: JSON.stringify({
              pdf_data_url: reader.result as string,
              file_name: file.name,
            }),
          });

          const data = await res.json();
          if (data.status === "success") {
            if (data.cvText) setCvText(data.cvText);
            if (data.candidateName) setCandidateName(data.candidateName);
            if (data.targetRole) setTargetRole(data.targetRole);
            setPdfUploadNotice(`✅ Curriculum Vitae PDF "${file.name}" processado e extraído com sucesso!`);
          } else {
            alert("Erro ao ler PDF: " + (data.error || "Tente novamente."));
          }
        } catch (err: any) {
          alert("Falha ao enviar arquivo PDF: " + err.message);
        } finally {
          setIsParsingPdfCv(false);
        }
      };
      return;
    }

    // Fallback for TXT/MD files
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCvText(content);
        setPdfUploadNotice(`Documento de texto "${file.name}" carregado.`);
      }
    };
    reader.readAsText(file);
  };

  // Start New Interview Session with explicit custom or override params
  const handleStartInterview = async (overrideParams?: {
    candidateName?: string;
    targetRole?: string;
    companyName?: string;
    cvText?: string;
    jobDescription?: string;
  }) => {
    const finalCv = overrideParams?.cvText || cvText;
    const finalJob = overrideParams?.jobDescription || jobDescription;
    const finalName = overrideParams?.candidateName || candidateName;
    const finalRole = overrideParams?.targetRole || targetRole;
    const finalCompany = overrideParams?.companyName || companyName;

    if (!finalCv.trim() || !finalJob.trim()) {
      alert("Por favor forneça o CV e a Descrição da Vaga para personalizar a entrevista.");
      return;
    }

    setIsStartingInterview(true);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userHeaders,
        },
        body: JSON.stringify({
          candidateName: finalName,
          targetRole: finalRole,
          companyName: finalCompany,
          cvText: finalCv,
          jobDescription: finalJob,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Resposta do servidor em formato inválido (${res.status}): ${text.slice(0, 100)}`);
      }

      if (data.status === "success" && data.session) {
        setCurrentSession(data.session);
        setActiveTab("interview");
        fetchPastSessions();

        // Speak the opening question if TTS is enabled
        const firstTurn = data.session.turns[0];
        if (firstTurn && ttsEnabled) {
          speakText(`${firstTurn.interviewerName} diz: ${firstTurn.question}`);
        }
      } else {
        alert(data.error || "Erro ao iniciar sessão de entrevista.");
      }
    } catch (err: any) {
      console.error("Error starting interview", err);
      alert(err?.message || "Falha na comunicação com o servidor seguro de IA.");
    } finally {
      setIsStartingInterview(false);
    }
  };

  // Submit Candidate Answer
  const handleSubmitResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!candidateResponseText.trim() || !currentSession || isSubmittingResponse) return;

    const userText = candidateResponseText.trim();
    setCandidateResponseText("");
    setIsSubmittingResponse(true);
    stopSpeaking();

    // Stop recording if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const res = await fetch("/api/interview/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userHeaders,
        },
        body: JSON.stringify({
          sessionId: currentSession.sessionId,
          candidateResponse: userText,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Resposta inválida do servidor de avaliação (${res.status}): ${text.slice(0, 100)}`);
      }

      if (data.status === "success" && data.session) {
        setCurrentSession(data.session);
        fetchPastSessions();

        // Speak next question from the panel
        const lastTurn = data.session.turns[data.session.turns.length - 1];
        if (lastTurn && lastTurn.question && ttsEnabled) {
          speakText(`${lastTurn.interviewerName}: ${lastTurn.question}`);
        }
      } else {
        alert(data.error || "Não foi possível processar a resposta da banca.");
      }
    } catch (err: any) {
      console.error("Error submitting interview response", err);
      alert(err?.message || "Erro na ligação ao servidor de avaliação.");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Compute stats across turns
  const turnScores = (currentSession?.turns || [])
    .filter((t) => t.feedback)
    .map((t, idx) => ({
      turn: `Resp ${idx + 1}`,
      score: t.feedback?.score || 0,
      coherence: t.feedback?.coherenceScore || 0,
    }));

  const radarData = [
    { subject: "Conhecimento Técnico", score: currentSession?.technicalScore || 85 },
    { subject: "Coerência do CV", score: currentSession?.coherenceScore || 90 },
    { subject: "Comunicação", score: currentSession?.communicationScore || 80 },
    { subject: "Resolução de Problemas", score: currentSession?.problemSolvingScore || 88 },
    { subject: "Postura Executiva", score: currentSession?.executivePosturescore || 85 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Hero Title & Security Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Backend Seguro • Proteção de Chave IA
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              Memória com Verificação de Contradição
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
            Simulador de Entrevista de Alta Performance com IA
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
            Simule entrevistas corporativas e técnicas perante uma banca examinadora inteligente. Avaliações em tempo real, validação de dados do CV, detecção de contradições e suporte a voz presencial.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-950 rounded-2xl border border-stone-800 shrink-0 relative z-10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("setup")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === "setup"
                ? "bg-amber-600 text-white shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Configurar CV &amp; Vaga</span>
          </button>

          <button
            onClick={() => {
              if (!currentSession) {
                if (cvText.trim() && jobDescription.trim()) {
                  handleStartInterview();
                } else {
                  alert("Por favor selecione ou preencha o CV e a Descrição da Vaga para iniciar a entrevista.");
                }
                return;
              }
              setActiveTab("interview");
            }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === "interview"
                ? "bg-amber-600 text-white shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>2. Entrevista em Tempo Real</span>
            {currentSession && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === "history"
                ? "bg-amber-600 text-white shadow-md font-bold"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>3. Histórico &amp; Relatórios</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SETUP & CV READER */}
      {/* ======================================================== */}
      {activeTab === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Preset CV Template Selector */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
              <h3 className="text-xs font-bold text-stone-100 uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Modelos de CV e Vagas Pré-Carregados</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Clique num dos perfis para preencher instantaneamente a vaga e o Curriculum Vitae:
              </p>

              <div className="space-y-2.5 pt-1">
                {SAMPLE_CVS.map((sample, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/60 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-200">
                        {sample.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-mono line-clamp-1">{sample.company}</p>

                    <div className="flex items-center gap-2 pt-1 border-t border-stone-900">
                      <button
                        onClick={() => handleSelectSampleCv(idx)}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-[11px] text-stone-300 font-mono flex items-center gap-1 transition"
                      >
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>Preencher Form</span>
                      </button>

                      <button
                        onClick={() => {
                          handleSelectSampleCv(idx);
                          handleStartInterview({
                            candidateName: sample.title.includes("Manuel") ? "Eng. Manuel Silva" : sample.title.includes("Beatriz") ? "Dra. Beatriz Santos" : "Dr. Carlos Neto",
                            targetRole: sample.role,
                            companyName: sample.company,
                            cvText: sample.cv,
                            jobDescription: sample.job,
                          });
                        }}
                        disabled={isStartingInterview}
                        className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-[11px] text-amber-300 hover:text-white font-bold font-mono flex items-center gap-1 transition ml-auto disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Simular Já</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Custom CV Document in PDF format */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
              <h3 className="text-xs font-bold text-stone-100 uppercase tracking-wider font-mono flex items-center gap-2">
                <Upload className="w-4 h-4 text-red-400" />
                <span>Carregar Ficheiro de CV (.PDF)</span>
              </h3>
              <p className="text-xs text-stone-400">
                Importe o seu Curriculum Vitae em formato PDF para extração inteligente do nome, cargo e experiência pelo Gemini AI:
              </p>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-800 hover:border-amber-500/60 rounded-2xl bg-stone-950 cursor-pointer transition text-center space-y-2 group">
                {isParsingPdfCv ? (
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                ) : (
                  <FileText className="w-8 h-8 text-red-500 opacity-90 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-semibold text-stone-200">
                  {isParsingPdfCv ? "Extraindo dados do PDF com IA..." : "Carregar CV em PDF (.pdf)"}
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  Formato principal: PDF (com suporte opcional a TXT e MD)
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf,.txt,.md"
                  onChange={handleFileUpload}
                  disabled={isParsingPdfCv}
                  className="hidden"
                />
              </label>

              {pdfUploadNotice && (
                <div className="p-3 rounded-xl bg-stone-950 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{pdfUploadNotice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields: Role, CV Text, Job Description */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>Personalização da Banca Examinadora</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                ✓ Pronto para Inicialização
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-300 font-mono mb-1.5">Nome do Candidato *</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Ex: Eng. Manuel Silva"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1.5">Cargo Almejado *</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Ex: Lead Reservoir Engineer"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1.5">Empresa / Sector</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Sonangol / Multinacional"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-300 font-mono mb-1.5">
                  Curriculum Vitae do Candidato (CV) *
                </label>
                <textarea
                  rows={8}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Cole aqui o texto completo do seu CV..."
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500 font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1.5">
                  Descrição da Vaga &amp; Requisitos Técnicos *
                </label>
                <textarea
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Cole aqui os requisitos da vaga de emprego..."
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500 font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-stone-800">
              <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>O backend seguro processará o alinhamento antes de formar a banca.</span>
              </div>

              <button
                onClick={() => handleStartInterview()}
                disabled={isStartingInterview}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {isStartingInterview ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>A Convocar a Banca Examinadora...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Iniciar Entrevista com a Banca</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: LIVE INTERVIEW WITH VOICE & MEMORY */}
      {/* ======================================================== */}
      {activeTab === "interview" && currentSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Left Panel: Dialogue Feed & Voice Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Top Toolbar: Voice Controls & Panel Header */}
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-100 font-mono uppercase tracking-wider">
                    Banca Examinadora lauOIL AI
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Candidato: <span className="text-amber-400 font-bold">{currentSession.candidateName}</span> ({currentSession.targetRole})
                  </p>
                </div>
              </div>

              {/* TTS Voice Settings Controls */}
              <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-800 text-xs">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-1.5 rounded-lg flex items-center gap-1 transition font-mono ${
                    ttsEnabled ? "bg-amber-600 text-white font-bold" : "text-stone-500 hover:text-stone-300"
                  }`}
                  title="Ativar/Desativar Leitura em Voz Alta da Banca"
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-[10px] hidden sm:inline">Voz Ativa</span>
                </button>

                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-[10px] flex items-center gap-1"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pausar Voz</span>
                  </button>
                )}

                <div className="flex items-center gap-1 pl-1 border-l border-stone-800 text-[10px] font-mono text-stone-400">
                  <span>Velocidade:</span>
                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="bg-transparent text-amber-400 font-bold focus:outline-none"
                  >
                    <option value={0.85} className="bg-stone-900 text-stone-200">0.85x</option>
                    <option value={1.0} className="bg-stone-900 text-stone-200">1.0x Normal</option>
                    <option value={1.15} className="bg-stone-900 text-stone-200">1.15x Rápida</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conversation Turns Scroll Area */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-6 max-h-[550px] overflow-y-auto">
              {currentSession.turns.map((turn, idx) => (
                <div key={turn.id || idx} className="space-y-4">
                  {/* Panel Member Question */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-stone-800 border border-amber-500/40 flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-md">
                      AI
                    </div>

                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 font-mono">{turn.interviewerName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
                          {turn.interviewerRole}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono ml-auto">
                          Pergunta #{idx + 1}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-200 leading-relaxed space-y-2 shadow-inner">
                        <p>{turn.question}</p>

                        <button
                          onClick={() => speakText(`${turn.interviewerName}: ${turn.question}`)}
                          className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Ouvir Pergunta em Voz Alta</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Answer (if present) */}
                  {turn.candidateAnswer && (
                    <div className="flex items-start justify-end gap-3 pl-8">
                      <div className="space-y-2 max-w-2xl text-right">
                        <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-stone-400">
                          <span>{turn.timestamp}</span>
                          <span className="font-bold text-stone-200">{currentSession.candidateName}</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-stone-100 text-left leading-relaxed shadow-sm">
                          {turn.candidateAnswer}
                        </div>

                        {/* Real-Time Evaluation Feedback Card */}
                        {turn.feedback && (
                          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-left space-y-3 shadow-md border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-stone-100 font-mono uppercase">
                                  Avaliação da Resposta #{idx + 1}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-stone-400 font-mono">Nota:</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                                  turn.feedback.score >= 85
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                    : turn.feedback.score >= 70
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                    : "bg-red-500/20 text-red-400 border border-red-500/40"
                                }`}>
                                  {turn.feedback.score} / 100
                                </span>
                              </div>
                            </div>

                            {/* Veredito do Júri & Coerência */}
                            <div className="text-xs text-stone-300 font-semibold italic bg-stone-900/80 p-2.5 rounded-xl border border-stone-800/80">
                              "{turn.feedback.juryVerdict}"
                            </div>

                            {/* Contradiction / Coherence with CV */}
                            <div className="p-2.5 rounded-xl bg-stone-900/50 border border-stone-800 text-[11px] space-y-1">
                              <div className="flex items-center justify-between font-mono">
                                <span className="text-stone-400 flex items-center gap-1.5">
                                  <Brain className="w-3.5 h-3.5 text-amber-400" />
                                  Análise de Coerência com o CV &amp; Histórico:
                                </span>
                                <span className="text-emerald-400 font-bold">{turn.feedback.coherenceScore}% Coerente</span>
                              </div>
                              <p className="text-stone-300 leading-relaxed font-sans">{turn.feedback.contradictionCheck}</p>
                            </div>

                            {/* Strengths & Improvements */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                              <div className="space-y-1 p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                                <span className="text-emerald-400 font-bold font-mono flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Pontos Fortes:
                                </span>
                                <ul className="list-disc list-inside text-stone-300 space-y-0.5">
                                  {turn.feedback.strengths.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-1 p-2 rounded-xl bg-amber-950/20 border border-amber-500/20">
                                <span className="text-amber-400 font-bold font-mono flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  A Melhorar:
                                </span>
                                <ul className="list-disc list-inside text-stone-300 space-y-0.5">
                                  {turn.feedback.improvements.map((imp, i) => (
                                    <li key={i}>{imp}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs shadow-md">
                        <User className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isSubmittingResponse && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-400 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>A Banca Examinadora está a analisar a sua resposta e a verificar a coerência técnica...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Candidate Voice / Text Input Box */}
            <form onSubmit={handleSubmitResponse} className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  Pode responder por VOZ ou escrever a sua resposta técnica:
                </span>
                {isListening && (
                  <span className="text-red-400 animate-pulse font-bold flex items-center gap-1">
                    ● A gravar voz em tempo real...
                  </span>
                )}
              </div>

              <div className="relative flex items-center gap-2">
                <textarea
                  rows={3}
                  value={candidateResponseText}
                  onChange={(e) => setCandidateResponseText(e.target.value)}
                  placeholder="Responda detalhadamente à pergunta da banca (utilize a metodologia STAR e mencione dados concretos)..."
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 text-xs leading-relaxed resize-none pr-24 font-sans"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitResponse();
                    }
                  }}
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {/* Microphone Voice Recording Button */}
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-2.5 rounded-xl border transition shadow-sm ${
                      isListening
                        ? "bg-red-600 text-white border-red-500 animate-bounce"
                        : "bg-stone-800 text-amber-400 border-stone-700 hover:bg-stone-700"
                    }`}
                    title={isListening ? "Parar Gravação de Voz" : "Falar por Voz (Microfone)"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Response Button */}
                  <button
                    type="submit"
                    disabled={!candidateResponseText.trim() || isSubmittingResponse}
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition disabled:opacity-50 shadow-md"
                    title="Enviar Resposta para a Banca"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Panel: Live Performance Dashboard & Score Trend */}
          <div className="space-y-4">
            {/* Overall Score Meter */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-sm text-center">
              <h3 className="text-xs font-bold text-stone-100 uppercase tracking-wider font-mono">
                Pontuação Geral do Candidato
              </h3>

              <div className="relative w-32 h-32 mx-auto flex items-center justify-center rounded-full border-4 border-amber-500/80 bg-stone-950 shadow-inner">
                <div className="text-center">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {currentSession.overallScore}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-mono uppercase">de 100 Pts</span>
                </div>
              </div>

              <div className="text-xs text-stone-300 font-mono">
                {currentSession.turns.length > 0 ? (
                  <span>Perguntas respondidas: <strong className="text-amber-400">{currentSession.turns.filter(t => t.candidateAnswer).length}</strong></span>
                ) : (
                  <span>Aguardando primeira resposta</span>
                )}
              </div>
            </div>

            {/* Radar Chart: Competencies Breakdown */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
              <h3 className="text-xs font-bold text-stone-100 uppercase tracking-wider font-mono">
                Competências em Análise (Radar)
              </h3>

              <div className="w-full h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" stroke="#888" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#444" fontSize={9} />
                    <Radar name="Candidato" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Evolution per Turn Chart */}
            {turnScores.length > 0 && (
              <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
                <h3 className="text-xs font-bold text-stone-100 uppercase tracking-wider font-mono">
                  Evolução por Resposta (Linha)
                </h3>

                <div className="w-full h-44 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={turnScores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="turn" stroke="#666" fontSize={10} />
                      <YAxis domain={[0, 100]} stroke="#666" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#1c1917", borderColor: "#444", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                      <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} name="Nota Resposta" />
                      <Line type="monotone" dataKey="coherence" stroke="#10b981" strokeWidth={2} name="Coerência CV" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: HISTORY & PERFORMANCE STATS */}
      {/* ======================================================== */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-100">Histórico &amp; Relatórios de Entrevistas</h2>
              <p className="text-xs text-stone-400">Acompanhe a sua evolução técnica e comportamental ao longo do tempo</p>
            </div>

            <button
              onClick={() => setActiveTab("setup")}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Entrevista</span>
            </button>
          </div>

          {/* Historical List Grid */}
          {pastSessions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
              <History className="w-10 h-10 mx-auto text-stone-600" />
              <h3 className="text-sm font-bold text-stone-300">Nenhum histórico registado ainda</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Conclua a sua primeira simulação para gerar relatórios detalhados e comparar a sua pontuação com os padrões da indústria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4 hover:border-amber-500/50 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-stone-100">{session.candidateName}</h3>
                      <p className="text-xs text-amber-400 font-semibold">{session.targetRole}</p>
                      <p className="text-[10px] text-stone-500 font-mono">{session.companyName}</p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-black text-sm">
                      {session.overallScore} Pts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-b border-stone-800 py-3">
                    <div>
                      <span className="text-stone-500 block text-[10px]">Técnica:</span>
                      <strong className="text-stone-200">{session.technicalScore}%</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Coerência CV:</span>
                      <strong className="text-emerald-400">{session.coherenceScore}%</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Comunicação:</span>
                      <strong className="text-stone-200">{session.communicationScore}%</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Perguntas:</span>
                      <strong className="text-amber-400">{session.turns?.length || 0} rodadas</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                    <span>{new Date(session.createdAt).toLocaleDateString("pt-PT")}</span>
                    <button
                      onClick={() => {
                        setCurrentSession(session);
                        setActiveTab("interview");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-200 text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>Abrir Sessão</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
