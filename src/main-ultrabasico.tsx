// TESTE ULTRABASICO - sem imports externos
console.log('🔥 TESTE: Script carregado!')

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 TESTE: DOM carregado!')
  
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `
      <div style="
        padding: 50px; 
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4); 
        color: white; 
        font-family: Arial; 
        text-align: center;
        min-height: 100vh;
        font-size: 24px;
      ">
        <h1>🔥 TESTE ULTRABASICO FUNCIONOU!</h1>
        <p>Se você vê este texto, o Vite está carregando JavaScript corretamente.</p>
        <p>Problema está nos imports ou dependências.</p>
        <p>Horário: ${new Date().toLocaleString()}</p>
      </div>
    `
    console.log('🔥 TESTE: HTML inserido!')
  } else {
    console.error('🔥 TESTE: Root não encontrado!')
  }
})

console.log('🔥 TESTE: Script executado até o final!')
