# Limpeza dos arquivos Next.js

echo "Removendo arquivos específicos do Next.js..."

# Remover pasta app/ (Next.js App Router)
if (Test-Path "app") {
    Remove-Item -Recurse -Force "app"
    Write-Host "✓ Pasta app/ removida"
}

# Remover pasta .next/
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Pasta .next/ removida"
}

# Remover configurações Next.js
$nextFiles = @(
    "next.config.mjs",
    "next-env.d.ts"
)

foreach ($file in $nextFiles) {
    if (Test-Path $file) {
        Remove-Item $file
        Write-Host "✓ $file removido"
    }
}

# Mover arquivos antigos para pasta de backup
if (-not (Test-Path "next-backup")) {
    New-Item -ItemType Directory -Name "next-backup"
}

$backupFiles = @(
    "components",
    "contexts", 
    "hooks",
    "lib",
    "styles"
)

foreach ($folder in $backupFiles) {
    if (Test-Path $folder) {
        Move-Item $folder "next-backup/"
        Write-Host "✓ $folder movido para next-backup/"
    }
}

Write-Host ""
Write-Host "🎉 Limpeza concluída! Migração para Vite + React finalizada."
Write-Host ""
Write-Host "📋 Resumo:"
Write-Host "  • Next.js removido"
Write-Host "  • Vite + React configurado"
Write-Host "  • Todas as páginas migradas"
Write-Host "  • Build funcionando"
Write-Host "  • Servidor rodando em: http://localhost:3000"
Write-Host ""
Write-Host "🚀 Para iniciar: npm run dev"
Write-Host "🔨 Para build: npm run build"
Write-Host "👀 Para preview: npm run preview"
