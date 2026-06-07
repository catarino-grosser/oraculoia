export default async (request, context) => {
    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ erro: "Método não permitido" }), { status: 405 });
    }

    try {
        const pagamentoDados = {
            transaction_amount: 1.00,
            description: "Leitura de Tarot Místico",
            payment_method_id: "pix",
            payer: { email: "cliente@9888.com" } // Email fictício obrigatório
        };

        const respostaMP = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": crypto.randomUUID()
            },
            body: JSON.stringify(pagamentoDados)
        });

        const resultado = await respostaMP.json();

        if (!respostaMP.ok) {
            throw new Error(resultado.message || "Erro ao gerar Pix");
        }

        return new Response(JSON.stringify({
            id: resultado.id,
            qr_code: resultado.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: resultado.point_of_interaction.transaction_data.qr_code_base64
        }), { 
            status: 200, 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (error) {
        return new Response(JSON.stringify({ erro: error.message }), { status: 500 });
    }
};
