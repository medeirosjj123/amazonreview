# Instalador para Windows - Gerador Reviews Amazon
# Executar com: powershell -ExecutionPolicy Bypass -File install.ps1

# Cores
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Banner
Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║     Instalador - Gerador Reviews Amazon    ║" -ForegroundColor Blue
Write-Host "║           Versão Automática 1.0           ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Função para verificar comandos
function Check-Command {
    param($command, $url)
    
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        Write-Host "✓ $command instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ $command não está instalado!" -ForegroundColor Red
        Write-Host "Por favor, instale $command primeiro:" -ForegroundColor Yellow
        Write-Host $url -ForegroundColor Blue
        Write-Host ""
        Write-Host "Pressione qualquer tecla para sair..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

# Verificar pré-requisitos
Write-Host "📋 Verificando pré-requisitos..." -ForegroundColor Yellow
Write-Host ""

Check-Command "git" "https://git-scm.com/"
Check-Command "node" "https://nodejs.org/"
Check-Command "npm" "https://nodejs.org/"

Write-Host ""
Write-Host "✅ Todos os pré-requisitos estão instalados!" -ForegroundColor Green
Write-Host ""

# Clonar repositório
Write-Host "📦 Baixando o projeto..." -ForegroundColor Yellow

# Verificar se já existe a pasta
if (Test-Path "amazonreview") {
    $response = Read-Host "A pasta 'amazonreview' já existe. Deseja removê-la e baixar novamente? (s/n)"
    if ($response -match "^[sS]") {
        Remove-Item -Path "amazonreview" -Recurse -Force
    } else {
        Write-Host "Entrando na pasta existente..." -ForegroundColor Blue
        Set-Location "amazonreview"
        git pull origin main
    }
}

# Clonar se necessário
if (-not (Test-Path "amazonreview")) {
    git clone https://github.com/medeirosjj123/amazonreview.git
    Set-Location "amazonreview"
}

Write-Host ""
Write-Host "✅ Projeto baixado com sucesso!" -ForegroundColor Green
Write-Host ""

# Instalar dependências
Write-Host "📥 Instalando dependências..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
Write-Host ""

# Configurar APIs
Write-Host "🔑 Configuração das Chaves de API" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "Você precisará de pelo menos a chave do Google Gemini (GRATUITA)." -ForegroundColor Yellow
Write-Host "Se não tem ainda, acesse: https://aistudio.google.com/app/apikey" -ForegroundColor Blue
Write-Host ""

# Função para ler chaves
function Read-ApiKey {
    param(
        [string]$prompt,
        [string]$varName,
        [bool]$required = $false
    )
    
    Write-Host $prompt -ForegroundColor Yellow
    if ($required) {
        Write-Host "(OBRIGATÓRIA)" -ForegroundColor Red
    } else {
        Write-Host "(Opcional - pressione ENTER para pular)" -ForegroundColor Green
    }
    
    $apiKey = Read-Host
    
    if ($required -and [string]::IsNullOrWhiteSpace($apiKey)) {
        Write-Host "❌ Esta chave é obrigatória! Por favor, insira a chave." -ForegroundColor Red
        return Read-ApiKey -prompt $prompt -varName $varName -required $required
    }
    
    return $apiKey
}

# Coletar chaves
$geminiKey = Read-ApiKey -prompt "Digite sua chave do Google Gemini (começa com AIza...):" -varName "GEMINI_KEY" -required $true
Write-Host ""

$firecrawlKey = Read-ApiKey -prompt "Digite sua chave do Firecrawl:" -varName "FIRECRAWL_KEY" -required $false
Write-Host ""

$openaiKey = Read-ApiKey -prompt "Digite sua chave da OpenAI:" -varName "OPENAI_KEY" -required $false
Write-Host ""

# Criar arquivo .env
Write-Host "📝 Criando arquivo de configuração..." -ForegroundColor Yellow

@"
GEMINI_API_KEY=$geminiKey
FIRECRAWL_API_KEY=$firecrawlKey
OPENAI_API_KEY=$openaiKey
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host ""

# Iniciar servidor
Write-Host "🚀 Iniciando o servidor..." -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ O servidor será iniciado em alguns segundos..." -ForegroundColor Green
Write-Host "🌐 O navegador abrirá automaticamente em: http://localhost:3005" -ForegroundColor Green
Write-Host ""
Write-Host "Para parar o servidor, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

# Aguardar e abrir navegador
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3005"
} | Out-Null

# Iniciar servidor
npm start