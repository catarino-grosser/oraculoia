const btnDraw = document.getElementById('btn-draw');
const btnReset = document.getElementById('btn-reset');
const inputQuestion = document.getElementById('user-question');
const readingResult = document.getElementById('reading-result');
const readingText = document.getElementById('reading-text');

// Elementos do Pix e Telas
const inputSection = document.getElementById('input-section');
const paymentSection = document.getElementById('payment-section');
const processingSection = document.getElementById('processing-section');
const qrCodeImg = document.getElementById('qr-code-img');
const pixCopiaCola = document.getElementById('pix-copia-cola');
const btnCopyPix = document.getElementById('btn-copy-pix');
const btnCancel = document.getElementById('btn-cancel-payment');
const progressFill = document.querySelector('.progress-fill');
const processingText = document.getElementById('processing-text');

let paymentInterval;

// === SISTEMA DE MEMÓRIA (Mesmo do original, adaptado visualmente) ===
document.addEventListener('DOMContentLoaded', () => {
    const pagamentoPendente = localStorage.getItem('matrix_sessao_pix');
    if (pagamentoPendente) {
        const dados = JSON.parse(pagamentoPendente);
        inputSection.classList.add('hidden');
        paymentSection.classList.remove('hidden');
        qrCodeImg.src = `data:image/png;base64,${dados.qr_code_base64}`;
        pixCopiaCola.value = dados.qr_code;
        paymentInterval = setInterval(() => checkPaymentStatus(dados.id, dados.question), 4000);
    }
});

btnDraw.addEventListener('click', async () => {
    const question = inputQuestion.value.trim();
    if (question === "") {
        alert("> ERRO: FORNEÇA OS PARÂMETROS DA VARREDURA ANTES DE INICIAR.");
        return;
    }

    btnDraw.disabled = true;
    btnDraw.innerText = "> GERANDO CHAVE DE ACESSO...";

    try {
        const resPix = await fetch('/.netlify/functions/gerar-pix', { method: 'POST' });
        const pixData = await resPix.json();

        if (!resPix.ok) throw new Error(pixData.erro);

        const sessao = {
            id: pixData.id,
            qr_code: pixData.qr_code,
            qr_code_base64: pixData.qr_code_base64,
            question: question
        };
        localStorage.setItem('matrix_sessao_pix', JSON.stringify(sessao));

        qrCodeImg.src = `data:image/png;base64,${pixData.qr_code_base64}`;
        pixCopiaCola.value = pixData.qr_code;
        
        inputSection.classList.add('hidden');
        paymentSection.classList.remove('hidden');

        paymentInterval = setInterval(() => checkPaymentStatus(pixData.id, question), 4000);

    } catch (erro) {
        alert("> ERRO NO SISTEMA FINANCEIRO: " + erro.message);
        btnDraw.disabled = false;
        btnDraw.innerText = "> INICIAR PROTOCOLO [Custo: 1.00 Crédito]";
    }
});

async function checkPaymentStatus(paymentId, question) {
    try {
        const res = await fetch('/.netlify/functions/verificar-pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
        });
        const data = await res.json();

        if (data.status === 'approved') {
            clearInterval(paymentInterval);
            localStorage.removeItem('matrix_sessao_pix');
            paymentSection.classList.add('hidden'); 
            iniciarLeitura(question); 
        }
    } catch (error) {
        console.error("Aguardando rede externa...");
    }
}

// === NOVA ANIMAÇÃO E CHAMADA DA IA ===
async function iniciarLeitura(question) {
    processingSection.classList.remove('hidden');
    
    // Animação de barra de progresso falsa para manter o usuário engajado
    let progresso = 0;
    const mensagens = [
        "> Sintonizando Frequência 9888...",
        "> Acessando Logs do Domo...",
        "> Descriptografando a verdade...",
        "> Preparando pacote de dados..."
    ];
    
    const loadingAnim = setInterval(() => {
        progresso += 5;
        if(progresso <= 95) progressFill.style.width = `${progresso}%`;
        
        if(progresso === 20) processingText.innerText = mensagens[0];
        if(progresso === 40) processingText.innerText = mensagens[1];
        if(progresso === 70) processingText.innerText = mensagens[2];
        if(progresso === 90) processingText.innerText = mensagens[3];
    }, 200);

    try {
        // Agora não passamos mais as 'cartas', apenas a pergunta
        const respostaServidor = await fetch('/.netlify/functions/gerar-leitura', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pergunta: question })
        });
        
        const dados = await respostaServidor.json();
        if (!respostaServidor.ok) throw new Error(dados.erro);

        clearInterval(loadingAnim);
        progressFill.style.width = `100%`;
        
        setTimeout(() => {
            processingSection.classList.add('hidden');
            const leituraFormatada = dados.leitura.replace(/\n\n/g, '</p><p>');
            readingText.innerHTML = `
                <p style="color: var(--text-muted)"><strong>> PARÂMETRO INSERIDO:</strong> "${question}"</p>
                <hr style="border: 0; border-top: 1px dashed var(--terminal-dark-green); margin: 20px 0;">
                <p>${leituraFormatada}</p>
            `;
            readingResult.classList.remove('hidden');
        }, 1000);

    } catch (erro) {
        clearInterval(loadingAnim);
        alert("> FALHA CRÍTICA NA CONEXÃO COM O ORÁCULO: " + erro.message);
    }
}

btnCopyPix.addEventListener('click', () => {
    pixCopiaCola.select();
    document.execCommand('copy');
    btnCopyPix.innerText = "> CÓDIGO COPIADO";
    setTimeout(() => { btnCopyPix.innerText = "> COPIAR CÓDIGO"; }, 2000);
});

btnCancel.addEventListener('click', () => {
    clearInterval(paymentInterval);
    localStorage.removeItem('matrix_sessao_pix');
    paymentSection.classList.add('hidden');
    inputSection.classList.remove('hidden');
    btnDraw.disabled = false;
    btnDraw.innerText = "> INICIAR PROTOCOLO [Custo: 1.00 Crédito]";
});

btnReset.addEventListener('click', () => {
    inputQuestion.value = "";
    readingResult.classList.add('hidden');
    inputSection.classList.remove('hidden');
    btnDraw.disabled = false;
    progressFill.style.width = `0%`;
    btnDraw.innerText = "> INICIAR PROTOCOLO [Custo: 1.00 Crédito]";
});
