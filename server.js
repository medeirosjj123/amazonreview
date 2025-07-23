require('dotenv').config();
const express = require('express');
const FirecrawlApp = require('@mendable/firecrawl-js').default;
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

console.log('\n🚀 Iniciando servidor...\n');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${req.method} ${req.url}`);
  console.log(`   Headers: ${JSON.stringify(req.headers['user-agent'])}`);
  next();
});

// Servir arquivos estáticos ANTES de outros middlewares
const publicPath = path.join(__dirname, 'public');
console.log(`📁 Servindo arquivos estáticos de: ${publicPath}`);
app.use(express.static(publicPath));

app.use(express.json());

// Rota específica para a raiz
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  console.log(`🏠 Servindo index.html de: ${indexPath}`);
  res.sendFile(indexPath);
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY
});

app.post('/api/generate-review', async (req, res) => {
  console.log('\n🔄 Nova requisição para gerar review');
  
  try {
    const { url } = req.body;
    console.log(`📎 URL recebida: ${url}`);

    if (!url) {
      console.log('❌ Erro: URL não fornecida');
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    console.log('🕷️  Iniciando scraping da URL...');
    
    let scrapedData;
    let retries = 3;
    
    while (retries > 0) {
      try {
        scrapedData = await firecrawl.scrapeUrl(url, {
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 2000
        });
        
        if (scrapedData.success) {
          break;
        }
      } catch (error) {
        console.log(`⚠️  Tentativa ${4 - retries} falhou: ${error.message}`);
        retries--;
        
        if (retries === 0) {
          console.log('❌ Todas as tentativas de scraping falharam');
          throw new Error(`Não foi possível fazer o scraping da página após 3 tentativas. Erro: ${error.message}`);
        }
        
        console.log(`🔄 Aguardando 2 segundos antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!scrapedData || !scrapedData.success) {
      console.log('❌ Falha no scraping');
      throw new Error('Falha ao fazer scraping da página');
    }

    console.log('✅ Scraping concluído (mas bloqueado pela Amazon)');
    
    // Extrair informações da URL
    console.log('🔍 Analisando URL do produto...');
    
    // Tentar extrair informações diretamente da URL
    const urlParts = url.split('/');
    let productInfo = '';
    
    // Procurar pela parte que contém o nome do produto (geralmente após /dp/ ou antes dele)
    for (let i = 0; i < urlParts.length; i++) {
      if (urlParts[i].includes('Bebedouro') || urlParts[i].includes('BBE12P') || urlParts[i].includes('Brit')) {
        productInfo = decodeURIComponent(urlParts[i]);
        break;
      }
    }
    
    console.log(`📊 Informações extraídas da URL: ${productInfo}`);
    
    // Usar Gemini 1.5 Flash para interpretar melhor o produto
    const extractPrompt = `Com base nestas informações de uma URL da Amazon, identifique o produto completo:
    
URL: ${url}
Trecho identificado: ${productInfo}

Analise a URL e retorne o nome COMPLETO do produto incluindo marca e modelo principal. Por exemplo:
- Se for "Bebedouro-Britânia-BBE12P", retorne "Bebedouro Britânia BBE12P"
- Se for "Notebook-Dell-Inspiron-15", retorne "Notebook Dell Inspiron 15"

Retorne APENAS o nome completo do produto, nada mais.`;

    console.log('🤖 Usando Gemini 1.5 Flash para extração...');
    
    let productName;
    try {
      const modelExtract = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('📡 Chamando API do Gemini 1.5...');
      const extractResult = await modelExtract.generateContent(extractPrompt);
      productName = extractResult.response.text().trim();
      console.log('✅ Extração concluída com Gemini');
    } catch (error) {
      console.log(`❌ Erro no Gemini 1.5: ${error.message}`);
      console.log('🔄 Usando fallback - extraindo direto da URL');
      // Fallback: usar o productInfo diretamente
      productName = productInfo.replace(/-/g, ' ').replace(/Britânia/g, 'Britânia');
    }
    console.log(`📦 Produto identificado pela IA: "${productName}"`);
    console.log(`📝 Prompt usado para extração: ${extractPrompt.substring(0, 200)}...`);
    
    // Agora gerar a review com o modelo menor
    const reviewPrompt = `Você está escrevendo UM ITEM de uma lista de "Melhores Produtos". Este NÃO é um artigo completo sobre o produto, mas sim uma entrada em uma lista comparativa.

Produto: ${productName}

Crie uma review CONCISA para este item da lista, em português brasileiro:

1. **Título (<h2>):** Simples e direto - apenas o nome do produto

2. **Descrição:** 2-3 parágrafos (<p>) sobre o produto, totalizando aproximadamente 120 palavras (não conte as palavras das tabelas)

3. **Tabelas lado a lado (USE EXATAMENTE ESTE HTML):**
<div style="display:flex; gap:20px; margin-top:20px;">
  <table style="width:48%; border-collapse:collapse;">
    <thead>
      <tr>
        <th style="background-color:#28a745; color:white; padding:10px; text-align:left;">Prós</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:10px; border:1px solid #ddd; background-color:#f8f9fa;">[Ponto positivo 1 - seja específico]</td></tr>
      <tr><td style="padding:10px; border:1px solid #ddd; background-color:#f8f9fa;">[Ponto positivo 2 - seja específico]</td></tr>
      <tr><td style="padding:10px; border:1px solid #ddd; background-color:#f8f9fa;">[Ponto positivo 3 - seja específico]</td></tr>
    </tbody>
  </table>
  
  <table style="width:48%; border-collapse:collapse;">
    <thead>
      <tr>
        <th style="background-color:#dc3545; color:white; padding:10px; text-align:left;">Contras</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:10px; border:1px solid #ddd; background-color:#f8f9fa;">[Ponto negativo 1 - seja realista]</td></tr>
      <tr><td style="padding:10px; border:1px solid #ddd; background-color:#f8f9fa;">[Ponto negativo 2 - seja realista]</td></tr>
    </tbody>
  </table>
</div>

IMPORTANTE:
- Este é APENAS UM ITEM de uma lista maior
- A descrição deve ter aproximadamente 120 palavras (SEM contar prós e contras)
- Use EXATAMENTE o HTML das tabelas fornecido
- Substitua [Ponto...] por pontos reais e específicos
- Não adicione conclusão - é apenas um item da lista
- Foque em características, funcionalidades e diferenciais do produto

Retorne APENAS o HTML.`;

    console.log('🤖 Gerando review com Gemini 2.0 Flash...');
    console.log(`📄 Prompt da review (primeiros 300 chars): ${reviewPrompt.substring(0, 300)}...`);
    
    let reviewHTML;
    try {
      const modelReview = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
        }
      });
      
      console.log('📡 Chamando API do Gemini 2.0...');
      const reviewResult = await modelReview.generateContent(reviewPrompt);
      console.log('✅ Resposta recebida do Gemini 2.0');
      
      reviewHTML = reviewResult.response.text();
      console.log('📄 Texto extraído da resposta');
    } catch (error) {
      console.log(`❌ Erro no Gemini 2.0: ${error.message}`);
      
      // Tentar com modelo diferente se falhar
      try {
        console.log('🔄 Tentando com Gemini 1.5 Flash como fallback...');
        const modelFallback = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const fallbackResult = await modelFallback.generateContent(reviewPrompt);
        reviewHTML = fallbackResult.response.text();
        console.log('✅ Fallback bem-sucedido');
      } catch (fallbackError) {
        console.log(`❌ Fallback também falhou: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
    
    // Remover delimitadores de código se existirem
    reviewHTML = reviewHTML.replace(/^```html\n?/, '').replace(/\n?```$/, '');
    
    console.log('✅ Review gerada com sucesso!');
    console.log(`📝 Tamanho da review: ${reviewHTML.length} caracteres`);
    console.log(`🔍 Preview da review (primeiros 200 chars): ${reviewHTML.substring(0, 200)}...`);
    console.log(`🔍 Preview final (últimos 200 chars): ...${reviewHTML.substring(reviewHTML.length - 200)}`);

    res.json({ review: reviewHTML });

  } catch (error) {
    console.error('❌ Erro ao gerar review:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao gerar review. Verifique se as chaves API estão configuradas corretamente.' 
    });
  }
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  console.log(`⚠️  Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).send('Rota não encontrada');
});

app.listen(PORT, () => {
  console.log('\n✨ Servidor iniciado com sucesso!');
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📂 Diretório de trabalho: ${__dirname}`);
  console.log(`📁 Arquivos públicos em: ${publicPath}\n`);
});