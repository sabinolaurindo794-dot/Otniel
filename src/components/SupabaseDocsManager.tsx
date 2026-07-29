import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  FileText,
  Upload,
  CheckCircle2,
  Copy,
  Terminal,
  Sparkles,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Brain,
  Trash2,
  Download,
  Check,
  RefreshCw,
  FolderOpen
} from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  category: string;
  summary: string;
  pdf_data_url?: string;
  created_at: string;
}

interface SupabaseStatus {
  supabase_configured: boolean;
  supabase_url: string;
  migration_file: string;
  tables_managed: string[];
}

interface SupabaseDocsManagerProps {
  onAskAI: (prompt: string) => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
    company: string;
  } | null;
}

export const SupabaseDocsManager: React.FC<SupabaseDocsManagerProps> = ({ onAskAI, currentUser }) => {
  const [activeTab, setActiveTab] = useState<"docs" | "supabase" | "migration">("docs");
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [sqlMigration, setSqlMigration] = useState<string>("");
  const [copiedSql, setCopiedSql] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Upload State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Relatório Técnico");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedPdfPreviewUrl, setSelectedPdfPreviewUrl] = useState<string | null>(null);
  const [selectedDocForView, setSelectedDocForView] = useState<DocumentItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userHeaders = {
    "x-user-email": currentUser?.email || "guest@lauoil.ao",
    "x-user-id": currentUser?.id || "usr-guest",
  };

  // Fetch Supabase Status & Documents safely
  const fetchData = async () => {
    setLoadingDocs(true);
    const safeFetchJson = async (url: string, init?: RequestInit) => {
      try {
        const r = await fetch(url, init);
        const ct = r.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const txt = await r.text();
          console.warn(`Response from ${url} was not JSON (${r.status}):`, txt.slice(0, 100));
          return { status: "error", message: `Formato de resposta inválido (${r.status})` };
        }
        return await r.json();
      } catch (err: any) {
        console.warn(`Fetch exception for ${url}:`, err);
        return { status: "error", message: err?.message || "Erro de ligação ao servidor." };
      }
    };

    try {
      const [statusRes, docsRes, migRes] = await Promise.all([
        safeFetchJson("/api/supabase/status"),
        safeFetchJson("/api/documents", { headers: userHeaders }),
        safeFetchJson("/api/supabase/migrations", { headers: userHeaders }),
      ]);

      if (statusRes && statusRes.status === "success") {
        setStatus(statusRes);
      }
      if (docsRes && docsRes.status === "success" && Array.isArray(docsRes.documents)) {
        setDocuments(docsRes.documents);
      }
      if (migRes && migRes.status === "success" && migRes.sql) {
        setSqlMigration(migRes.sql);
      } else if (migRes && migRes.status === "error") {
        setSqlMigration(`-- ${migRes.message || "Acesso restrito ao proprietário para visualização de código SQL."}`);
      }
    } catch (e) {
      console.error("Failed to load Supabase / Documents data:", e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser?.email]);

  const handleCopySql = () => {
    if (!sqlMigration) return;
    navigator.clipboard.writeText(sqlMigration);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Por favor selecione um documento em formato PDF (.pdf).");
      return;
    }

    setSelectedPdfFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.pdf$/i, "").replace(/_/g, " "));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setSelectedPdfPreviewUrl(reader.result as string);
    };
  };

  const handleUploadPdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdfFile || !selectedPdfPreviewUrl) {
      alert("Por favor selecione um arquivo PDF para carregar.");
      return;
    }

    setUploadingFile(true);
    setUploadProgressMsg("Processando PDF e gerando análise técnica com Gemini AI...");

    try {
      const res = await fetch("/api/documents/upload-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userHeaders,
        },
        body: JSON.stringify({
          title: uploadTitle || selectedPdfFile.name,
          file_name: selectedPdfFile.name,
          file_size: selectedPdfFile.size,
          category: uploadCategory,
          pdf_data_url: selectedPdfPreviewUrl,
        }),
      });

      const ct = res.headers.get("content-type") || "";
      let data: any = {};
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Resposta do servidor em formato inválido (${res.status}): ${text.slice(0, 100)}`);
      }

      if (data.status === "success") {
        setDocuments((prev) => [data.document, ...prev]);
        setSelectedDocForView(data.document);
        setUploadTitle("");
        setSelectedPdfFile(null);
        setSelectedPdfPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        alert("✅ Documento PDF enviado e analisado com sucesso no Supabase!");
      } else {
        alert("Erro ao enviar PDF: " + (data.error || "Tente novamente."));
      }
    } catch (err: any) {
      alert("Erro ao enviar arquivo: " + err.message);
    } finally {
      setUploadingFile(false);
      setUploadProgressMsg("");
    }
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="w-48 h-48 text-amber-500" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Supabase PostgreSQL &amp; PDF Engine</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                Relational Schema Active
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              Gestão de Supabase &amp; Documentos PDF
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Integração completa com PostgreSQL Supabase, gestão de migrações relacionais (DDL/DML) e motor de análise inteligente de relatórios e contratos em formato PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeTab === "docs"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "bg-stone-800 text-stone-300 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Documentos PDF ({documents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("supabase")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeTab === "supabase"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "bg-stone-800 text-stone-300 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Status Supabase</span>
            </button>

            <button
              onClick={() => setActiveTab("migration")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeTab === "migration"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "bg-stone-800 text-stone-300 hover:text-white"
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>SQL Migrations</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: DOCUMENTS PDF & UPLOAD */}
      {activeTab === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PDF Upload Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    <Upload className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-stone-100">Enviar Documento PDF</h3>
                    <p className="text-[11px] text-stone-400">Carregue contratos, decretos ou relatórios de perfuração</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-stone-950 px-2.5 py-1 rounded-full text-stone-400 border border-stone-800">
                  Supabase Bucket
                </span>
              </div>

              <form onSubmit={handleUploadPdfSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Título do Documento
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Ex: Contrato de Partilha Bloco 15/06"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Categoria do Documento
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Relatório Técnico">Relatório Técnico / Campo</option>
                    <option value="Legislação & Regulamentos">Legislação &amp; Decretos ANPG</option>
                    <option value="Contrato / Concessão">Contrato / Concessão E&amp;P</option>
                    <option value="Plano Estratégico">Plano Estratégico Sonangol</option>
                    <option value="Análise de Mercado">Análise de Mercado / OPEP</option>
                  </select>
                </div>

                {/* Dropzone Area */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Arquivo PDF (.pdf)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-stone-800 hover:border-amber-500/50 bg-stone-950/60 transition cursor-pointer text-center space-y-2 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="application/pdf,.pdf"
                      onChange={handlePdfFileSelect}
                      className="hidden"
                    />

                    {selectedPdfFile ? (
                      <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-xs">
                        <FileText className="w-5 h-5 text-red-500" />
                        <span className="truncate max-w-[200px]">{selectedPdfFile.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          ({(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-semibold text-stone-300">
                          Clique para selecionar ou arraste o PDF
                        </div>
                        <p className="text-[10px] text-stone-500 font-mono">
                          Suporta arquivos PDF de até 50MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {uploadingFile && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{uploadProgressMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadingFile || !selectedPdfFile}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    selectedPdfFile && !uploadingFile
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20"
                      : "bg-stone-800 text-stone-500 cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{uploadingFile ? "Processando..." : "Enviar e Analisar PDF com AI"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* PDF Documents List & Detailed Viewer */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-stone-900/90 p-2.5 rounded-2xl border border-stone-800">
              <Search className="w-4 h-4 text-stone-400 ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por título, categoria ou conteúdo dos PDFs..."
                className="w-full bg-transparent text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
              />
            </div>

            {/* Document Card Grid */}
            <div className="space-y-3">
              {filteredDocs.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-stone-900/50 border border-stone-800 text-stone-400 space-y-2">
                  <FolderOpen className="w-10 h-10 mx-auto text-stone-600" />
                  <p className="text-xs font-semibold">Nenhum documento PDF encontrado para esta busca.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocForView(doc)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 ${
                      selectedDocForView?.id === doc.id
                        ? "bg-stone-900 border-amber-500/60 shadow-xl"
                        : "bg-stone-900/70 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-100 line-clamp-1">{doc.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400 font-mono">
                            <span className="text-amber-400 font-semibold">{doc.category}</span>
                            <span>•</span>
                            <span>{doc.file_name}</span>
                            <span>•</span>
                            <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-stone-500 bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800">
                        {new Date(doc.created_at).toLocaleDateString("pt-PT")}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 line-clamp-2 bg-stone-950/60 p-3 rounded-xl border border-stone-800/60 leading-relaxed">
                      {doc.summary}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAI(
                            `Explicar e resumir o documento PDF "${doc.title}" (${doc.file_name}). Resumo actual: ${doc.summary}. Quais são os principais destaques regulatórios ou operacionais para Angola?`
                          );
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition text-[11px]"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        <span>Consultar Otniel AI sobre este PDF →</span>
                      </button>

                      <span className="text-[10px] text-stone-500 font-mono">
                        Armazenado no Supabase DB
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPABASE INTEGRATION STATUS */}
      {activeTab === "supabase" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-100">Estado da Conexão Supabase</h3>
                <p className="text-xs text-stone-400">Credenciais &amp; Configuração de Ambiente</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Status da Integração:</span>
                <span
                  className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    status?.supabase_configured
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {status?.supabase_configured ? "CONECTADO AO SUPABASE" : "MOTOR EM MEMÓRIA & PRONTO P/ SUPABASE"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-stone-400">URL do Projecto Supabase:</span>
                <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 truncate">
                  {status?.supabase_url || "VITE_SUPABASE_URL"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-stone-400">Ficheiro de Migração Principal:</span>
                <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-emerald-400 font-mono">
                  {status?.migration_file || "/supabase/migrations/20260728000000_initial_schema.sql"}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>Como conectar seu próprio Supabase Cloud:</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-stone-300 text-[11px] leading-relaxed">
                <li>Crie um projecto gratuito em <strong>supabase.com</strong>.</li>
                <li>Adicione as variáveis no arquivo <strong>.env.example</strong> ou no painel de Secrets:</li>
                <li className="font-mono text-amber-300">VITE_SUPABASE_URL="https://seu-id.supabase.co"</li>
                <li className="font-mono text-amber-300">VITE_SUPABASE_ANON_KEY="sua-chave-anon"</li>
                <li>Execute a migração SQL na aba <strong>SQL Migrations</strong> para criar as tabelas instantaneamente.</li>
              </ol>
            </div>
          </div>

          {/* Managed Tables Card */}
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-100">Tabelas Relacionais Mapeadas</h3>
                <p className="text-xs text-stone-400">Esquema PostgreSQl &amp; Regras de Segurança (RLS)</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { name: "users_profiles", desc: "Perfis de utilizadores, funções e empresas do setor petróleo", icon: ShieldCheck },
                { name: "oil_projects", desc: "Projectos E&P, blocos offshore, operadores e orçamentos em USD", icon: Database },
                { name: "documents", desc: "Documentos e relatórios em PDF com resumos e vetores AI", icon: FileText },
                { name: "crm_contacts", desc: "Contactos corporativos, pipeline de negócios e estágios do CRM", icon: Layers },
                { name: "interview_sessions", desc: "Sessões de simulador de entrevista e pontuações do júri", icon: Brain },
                { name: "market_snapshots", desc: "Histórico diário de preços Brent, Cabinda e WTI", icon: CheckCircle2 },
                { name: "storage.buckets (pdf-documents)", desc: "Bucket público de armazenamento de PDFs até 50MB", icon: Upload },
              ].map((t) => (
                <div
                  key={t.name}
                  className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center gap-3"
                >
                  <t.icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-stone-100 font-mono truncate">{t.name}</div>
                    <div className="text-[11px] text-stone-400 truncate">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SQL MIGRATIONS VIEWER & COPIER */}
      {activeTab === "migration" && (
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Migração SQL Automatizada (Supabase DDL/DML)
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Ficheiro: <strong className="font-mono text-emerald-400">/supabase/migrations/20260728000001_user_data_security_isolation.sql</strong>
              </p>
            </div>

            {currentUser?.email?.toLowerCase() === "sabinolaurindo794@gmail.com" ||
            currentUser?.email?.toLowerCase() === "admin@lauoil.ao" ||
            currentUser?.email?.toLowerCase().includes("sabino") ||
            currentUser?.role?.toLowerCase() === "owner" ||
            currentUser?.role?.toLowerCase() === "admin" ? (
              <button
                onClick={handleCopySql}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-600/20"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? "SQL Copiado para a Área de Transferência!" : "Copiar SQL da Migração"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Proteção de Código Ativa</span>
              </div>
            )}
          </div>

          <div className="relative">
            {currentUser?.email?.toLowerCase() === "sabinolaurindo794@gmail.com" ||
            currentUser?.email?.toLowerCase() === "admin@lauoil.ao" ||
            currentUser?.email?.toLowerCase().includes("sabino") ||
            currentUser?.role?.toLowerCase() === "owner" ||
            currentUser?.role?.toLowerCase() === "admin" ? (
              <pre className="p-5 rounded-2xl bg-stone-950 border border-stone-800 text-stone-300 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
                {sqlMigration || "-- Carregando código da migração SQL..."}
              </pre>
            ) : (
              <div className="p-8 rounded-2xl bg-stone-950 border border-amber-500/30 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Código de Migração SQL Protegido</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                  A visualização, cópia e inspeção direta do código fonte SQL e da arquitetura da base de dados são restritas exclusivamente ao Proprietário do Sistema (<span className="text-amber-400 font-bold">Sabino Laurindo - sabinolaurindo794@gmail.com</span>).
                </p>
                <div className="inline-block px-4 py-2 bg-stone-900 rounded-xl border border-stone-800 text-xs text-stone-400 font-mono">
                  Status: 🔒 RLS & Code Inspection Security Shield Active
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
