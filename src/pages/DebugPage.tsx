import { ConnectionCheck } from "../components/debug/ConnectionCheck"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Página de Diagnóstico</h1>
          <p className="text-gray-600">Use esta página para verificar o status das conexões e configurações</p>
        </div>

        <ConnectionCheck />

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Instruções para .env.local</h2>
          <p className="text-sm text-blue-700 mb-2">
            Certifique-se de que seu arquivo .env.local contém as seguintes variáveis:
          </p>
          <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
            {`# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Outras configurações
VITE_AUTH_SECRET=seu-segredo
VITE_AUTH_URL=http://localhost:5173`}
          </pre>
        </div>
      </div>
    </div>
  )
}
