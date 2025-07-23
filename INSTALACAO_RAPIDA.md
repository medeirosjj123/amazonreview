# 🚀 Instalação Rápida - Gerador de Reviews Amazon

## Instalação com 1 comando!

### 🍎 macOS / Linux

Abra o Terminal e execute:

```bash
curl -sSL https://raw.githubusercontent.com/medeirosjj123/amazonreview/main/install.sh | bash
```

Ou baixe e execute localmente:
```bash
wget https://raw.githubusercontent.com/medeirosjj123/amazonreview/main/install.sh
chmod +x install.sh
./install.sh
```

### 🪟 Windows

Abra o PowerShell como Administrador e execute:

```powershell
irm https://raw.githubusercontent.com/medeirosjj123/amazonreview/main/install.ps1 | iex
```

Ou baixe e execute localmente:
1. Baixe o arquivo `install.ps1`
2. Clique com botão direito e escolha "Executar com PowerShell"

## O que o script faz?

1. ✅ Verifica se você tem Git, Node.js e npm instalados
2. 📥 Baixa o projeto do GitHub
3. 📦 Instala todas as dependências
4. 🔑 Solicita suas chaves de API (apenas Gemini é obrigatória)
5. 📝 Cria o arquivo .env automaticamente
6. 🚀 Inicia o servidor
7. 🌐 Abre o navegador automaticamente

## Pré-requisitos

Antes de executar o script, você precisa ter instalado:

- **Node.js** (v14+): https://nodejs.org/
- **Git**: https://git-scm.com/
- **Chave API do Google Gemini** (gratuita): https://aistudio.google.com/app/apikey

## Problemas comuns

### "comando não encontrado" ou "não é reconhecido"

Você precisa instalar os pré-requisitos listados acima primeiro.

### "Permissão negada" (macOS/Linux)

Execute com `sudo`:
```bash
sudo bash install.sh
```

### "Não pode ser carregado porque a execução de scripts foi desabilitada" (Windows)

Execute este comando primeiro:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Uso após instalação

Após a instalação, o projeto estará na pasta `amazonreview`. Para usar novamente:

```bash
cd amazonreview
npm start
```

O navegador abrirá automaticamente em http://localhost:3005

## Suporte

Se encontrar problemas, abra uma issue em: https://github.com/medeirosjj123/amazonreview/issues