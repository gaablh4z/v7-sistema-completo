import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('🔧 Main.tsx carregando...')

function SimpleApp() {
  console.log('🔧 SimpleApp renderizando...')
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333' }}>✅ React Funcionando!</h1>
      <p>Modo desenvolvimento funcionando na porta {window.location.port}</p>
      <p>Timestamp: {new Date().toLocaleString()}</p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
console.log('🔧 Criando root...')

root.render(<SimpleApp />)
console.log('🔧 App renderizado!')
