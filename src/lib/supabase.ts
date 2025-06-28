import { createClient } from "@supabase/supabase-js"

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Usar valores de fallback para desenvolvimento local se as variáveis não estiverem definidas
const fallbackUrl = "https://xyzcompany.supabase.co"
const fallbackKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGd0cXBrY3Bib2FwdnRqeWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM0MDQwMDAsImV4cCI6MjAwODk4MDAwMH0.fallback-key"

// Criar cliente com valores reais ou fallback
export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseAnonKey || fallbackKey)

// Verificar se as variáveis estão definidas e mostrar aviso se não estiverem
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variáveis de ambiente do Supabase não encontradas. Usando valores de fallback para desenvolvimento.")
}

// Server-side client (usando service role key quando disponível)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackKey
  return createClient(supabaseUrl || fallbackUrl, serviceRoleKey)
}
