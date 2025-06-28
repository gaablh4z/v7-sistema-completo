import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { WeatherProvider } from './contexts/WeatherContext'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import '../styles/globals.css'

console.log('🚀 [DEV MODE] Iniciando aplicação...')

// Função para capturar erros
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false)
  
  React.useEffect(() => {
    const handleError = (error: any) => {
      console.error('🔥 Erro capturado:', error)
      setHasError(true)
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])
  
  if (hasError) {
    return (
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#ffebee', 
        color: '#c62828',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh'
      }}>
        <h1>🔥 Erro Detectado no Modo Dev</h1>
        <p>Verifique o console para mais detalhes.</p>
        <button onClick={() => setHasError(false)}>Tentar Novamente</button>
      </div>
    )
  }
  
  return <>{children}</>
}

try {
  console.log('🔧 Renderizando aplicação...')
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <NotificationProvider>
              <WeatherProvider>
                <App />
                <Toaster />
              </WeatherProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
  
  console.log('✅ Aplicação renderizada com sucesso!')
} catch (error) {
  console.error('❌ Erro ao renderizar:', error)
  
  // Renderização de fallback
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#fff3e0', 
      color: '#e65100',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1>⚠️ Modo Debug - Erro na Inicialização</h1>
      <p>A aplicação encontrou um erro ao inicializar.</p>
      <pre>{String(error)}</pre>
    </div>
  )
}
