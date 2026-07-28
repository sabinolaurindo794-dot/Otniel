import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Retrieve Supabase config from client environment variables with fallback to linked credentials
const metaEnv = (import.meta as any).env || {};
const supabaseUrl =
  metaEnv.VITE_SUPABASE_URL ||
  metaEnv.SUPABASE_URL ||
  "https://peqgupxffpmvpjnczwpn.supabase.co";

const supabaseAnonKey =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_YWMtxta699qsMch7tamSuQ_ZbyOHUS9";

// Check if credentials are present
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Lazy initialized Supabase client
let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn("Failed to initialize Supabase client:", err);
      return null;
    }
  }
  return clientInstance;
};

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface SupabaseDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  summary?: string;
  extracted_text?: string;
  category?: string;
  pdf_data_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Database helper functions with fallback to local state
export async function uploadDocumentToSupabase(doc: Omit<SupabaseDocument, "id" | "created_at">): Promise<SupabaseDocument> {
  const sb = getSupabase();
  const newDoc: SupabaseDocument = {
    ...doc,
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
  };

  if (sb) {
    try {
      const { data, error } = await sb.from("documents").insert([
        {
          title: doc.title,
          file_name: doc.file_name,
          file_type: doc.file_type,
          file_size: doc.file_size,
          mime_type: doc.mime_type,
          summary: doc.summary,
          extracted_text: doc.extracted_text,
          category: doc.category || "Relatório Técnico",
          metadata: doc.metadata || {},
        },
      ]).select().single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          file_name: data.file_name,
          file_type: data.file_type,
          file_size: data.file_size,
          mime_type: data.mime_type,
          summary: data.summary,
          extracted_text: data.extracted_text,
          category: data.category,
          pdf_data_url: doc.pdf_data_url,
          metadata: data.metadata,
          created_at: data.created_at,
        };
      }
    } catch (err) {
      console.warn("Supabase insert document fallback to memory:", err);
    }
  }

  return newDoc;
}

export async function fetchSupabaseDocuments(): Promise<SupabaseDocument[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("documents").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        return data as SupabaseDocument[];
      }
    } catch (err) {
      console.warn("Error fetching Supabase documents:", err);
    }
  }
  return [];
}
