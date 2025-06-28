import React from 'react'

function TestComponent() {
  console.log('TestComponent está renderizando!')
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'lightblue', 
      color: 'black',
      minHeight: '100vh',
      fontSize: '18px'
    }}>
      <h1>🔧 Teste de Renderização</h1>
      <p>Se você está vendo esta mensagem, a aplicação React está funcionando!</p>
      <p>Timestamp: {new Date().toLocaleString()}</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid black' }}>
        <h2>Debug Info:</h2>
        <ul>
          <li>React: ✅ Carregado</li>
          <li>ReactDOM: ✅ Carregado</li>
          <li>CSS: ✅ Aplicado</li>
          <li>JavaScript: ✅ Executando</li>
        </ul>
      </div>
    </div>
  )
}

export default TestComponent
