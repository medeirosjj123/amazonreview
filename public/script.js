document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const productUrlInput = document.getElementById('productUrl');
    const loader = document.getElementById('loader');
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');
    const reviewContent = document.getElementById('reviewContent');

    generateBtn.addEventListener('click', async () => {
        const url = productUrlInput.value.trim();

        if (!url) {
            showError('Por favor, insira uma URL válida.');
            return;
        }

        showLoader();
        hideError();
        hideResult();

        try {
            const response = await fetch('/api/generate-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao gerar review');
            }

            displayReview(data.review);
        } catch (error) {
            showError(error.message || 'Erro ao processar a requisição. Tente novamente.');
        } finally {
            hideLoader();
        }
    });

    function showLoader() {
        loader.classList.remove('hidden');
        generateBtn.disabled = true;
    }

    function hideLoader() {
        loader.classList.add('hidden');
        generateBtn.disabled = false;
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    function hideError() {
        errorDiv.classList.add('hidden');
    }

    function displayReview(reviewHTML) {
        reviewContent.innerHTML = reviewHTML;
        
        // Adicionar botão de copiar
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar Conteúdo';
        copyButton.className = 'copy-button';
        copyButton.onclick = async () => {
            try {
                await navigator.clipboard.writeText(reviewHTML);
                copyButton.textContent = 'Copiado!';
                copyButton.style.backgroundColor = '#28a745';
                
                setTimeout(() => {
                    copyButton.textContent = 'Copiar Conteúdo';
                    copyButton.style.backgroundColor = '';
                }, 2000);
            } catch (err) {
                console.error('Erro ao copiar:', err);
                copyButton.textContent = 'Erro ao copiar';
                copyButton.style.backgroundColor = '#dc3545';
            }
        };
        
        reviewContent.appendChild(copyButton);
        resultDiv.classList.remove('hidden');
    }

    function hideResult() {
        resultDiv.classList.add('hidden');
    }
});