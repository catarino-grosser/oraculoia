const mockCardsDeck = [
    { name: "A Matriz Oculta", icon: "🌐" }, { name: "Frequência de Despertar", icon: "📡" },
    { name: "Dimensões Paralelas", icon: "🌀" }, { name: "Controle das Elites", icon: "👁️" },
    { name: "Tecnologia Proibida", icon: "💻" }, { name: "O Véu de Ilusão", icon: "🌫️" }
];
// ... (mantenha a lógica de PIX existente)

async function iniciarLeitura(question) {
    const selected = [...mockCardsDeck].sort(() => 0.5 - Math.random()).slice(0, 3);
    const nomes = selected.map(s => s.name).join(", ");
    
    selected.forEach((s, i) => {
        const el = document.getElementById(`card-${i+1}`);
        el.querySelector('.card-title').innerText = s.name;
        el.querySelector('.card-illustration').innerText = s.icon;
        setTimeout(() => el.classList.add('flipped'), i * 300);
    });

    const res = await fetch('/.netlify/functions/gerar-leitura', {
        method: 'POST',
        body: JSON.stringify({ pergunta: question, cartas: nomes })
    });
    const data = await res.json();
    document.getElementById('reading-text').innerHTML = `<p>${data.leitura.replace(/\n/g, '<br>')}</p>`;
    document.getElementById('reading-result').classList.remove('hidden');
}
