#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║     Instalador - Gerador Reviews Amazon    ║"
echo "║           Versão Automática 1.0           ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Função para verificar comandos
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 não está instalado!${NC}"
        echo -e "${YELLOW}Por favor, instale $1 primeiro:${NC}"
        echo -e "${BLUE}$2${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ $1 instalado${NC}"
    fi
}

# Verificar pré-requisitos
echo -e "${YELLOW}📋 Verificando pré-requisitos...${NC}"
echo ""

check_command "git" "https://git-scm.com/"
check_command "node" "https://nodejs.org/"
check_command "npm" "https://nodejs.org/"

echo ""
echo -e "${GREEN}✅ Todos os pré-requisitos estão instalados!${NC}"
echo ""

# Clonar repositório
echo -e "${YELLOW}📦 Baixando o projeto...${NC}"

# Verificar se já existe a pasta
if [ -d "amazonreview" ]; then
    echo -e "${YELLOW}A pasta 'amazonreview' já existe. Deseja removê-la e baixar novamente? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([sS][iI]?|[yY][eE]?[sS]?)$ ]]; then
        rm -rf amazonreview
    else
        echo -e "${BLUE}Entrando na pasta existente...${NC}"
        cd amazonreview
        git pull origin main
    fi
fi

# Clonar se necessário
if [ ! -d "amazonreview" ]; then
    git clone https://github.com/medeirosjj123/amazonreview.git
    cd amazonreview
fi

echo ""
echo -e "${GREEN}✅ Projeto baixado com sucesso!${NC}"
echo ""

# Instalar dependências
echo -e "${YELLOW}📥 Instalando dependências...${NC}"
npm install

echo ""
echo -e "${GREEN}✅ Dependências instaladas!${NC}"
echo ""

# Configurar APIs
echo -e "${BLUE}🔑 Configuração das Chaves de API${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Você precisará de pelo menos a chave do Google Gemini (GRATUITA).${NC}"
echo -e "${YELLOW}Se não tem ainda, acesse: ${BLUE}https://aistudio.google.com/app/apikey${NC}"
echo ""

# Função para ler input sem mostrar (para APIs)
read_api_key() {
    local prompt=$1
    local var_name=$2
    local required=$3
    
    echo -e "${YELLOW}$prompt${NC}"
    if [ "$required" = "required" ]; then
        echo -e "${RED}(OBRIGATÓRIA)${NC}"
    else
        echo -e "${GREEN}(Opcional - pressione ENTER para pular)${NC}"
    fi
    
    read -r api_key
    
    if [ "$required" = "required" ] && [ -z "$api_key" ]; then
        echo -e "${RED}❌ Esta chave é obrigatória! Por favor, insira a chave.${NC}"
        read_api_key "$prompt" "$var_name" "$required"
    else
        eval "$var_name='$api_key'"
    fi
}

# Coletar chaves
read_api_key "Digite sua chave do Google Gemini (começa com AIza...):" GEMINI_KEY "required"
echo ""

read_api_key "Digite sua chave do Firecrawl:" FIRECRAWL_KEY "optional"
echo ""

read_api_key "Digite sua chave da OpenAI:" OPENAI_KEY "optional"
echo ""

# Criar arquivo .env
echo -e "${YELLOW}📝 Criando arquivo de configuração...${NC}"

cat > .env << EOF
GEMINI_API_KEY=$GEMINI_KEY
FIRECRAWL_API_KEY=$FIRECRAWL_KEY
OPENAI_API_KEY=$OPENAI_KEY
EOF

echo -e "${GREEN}✅ Arquivo .env criado com sucesso!${NC}"
echo ""

# Detectar sistema operacional para abrir navegador
open_browser() {
    local url=$1
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$url"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open "$url"
        elif command -v gnome-open &> /dev/null; then
            gnome-open "$url"
        fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start "$url"
    fi
}

# Iniciar servidor
echo -e "${BLUE}🚀 Iniciando o servidor...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✨ O servidor será iniciado em alguns segundos...${NC}"
echo -e "${GREEN}🌐 O navegador abrirá automaticamente em: http://localhost:3005${NC}"
echo ""
echo -e "${YELLOW}Para parar o servidor, pressione Ctrl+C${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Aguardar 3 segundos e abrir navegador
(sleep 3 && open_browser "http://localhost:3005") &

# Iniciar servidor
npm start