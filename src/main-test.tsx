import React from 'react'
import ReactDOM from 'react-dom/client'

function SimpleTest() {
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: '#f0f0f0', 
      color: '#333',
      fontSize: '24px',
      textAlign: 'center'
    }}>
      <h1>🎯 TESTE SIMPLES</h1>
      <p>Se você vê esta mensagem, o React está funcionando!</p>
      <p>Hora atual: {new Date().toLocaleTimeString()}</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<SimpleTest />)
