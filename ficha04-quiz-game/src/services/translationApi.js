const MYMEMORY_API_URL = "https://api.mymemory.translated.net/get";
const SOURCE_LANGUAGE = "en";
const TARGET_LANGUAGE = "pt-PT";

/**
 * Propósito: traduzir um texto de inglês para português através da API MyMemory.
 * Produz/Devolve: um texto traduzido sempre que possível ou o texto original como fallback se a tradução falhar.
 * @param {string} text - texto em inglês que será enviado para tradução.
 * @param {AbortSignal} signal - permite cancelar o pedido de tradução se ele já não é necessário.
 * @returns {Promise<string>} devolve uma Promise com o texto traduzido ou, em caso de fallback, o texto original.
 */
async function translateTextToPortuguese(text, signal) {
    // Proteção simples: se o texto estiver vazio, não vale a pena chamar a API.
    // Evita pedidos inúteis e reduz o risco de atingir limites gratuitos.
    if (!text.trim()) return text;

    // A MyMemory usa query string, por isso URLSearchParams ajuda a codificar o texto.
    // Isto é importante porque perguntas podem ter espaços, símbolos e pontuação.
    const params = new URLSearchParams({
        q: text,
        langpair: `${SOURCE_LANGUAGE}|${TARGET_LANGUAGE}`,
    });

    // Cada tradução é um pedido GET.
    // O signal segue junto para permitir cancelar traduções pendentes se o jogo mudar.
    const response = await fetch(`${MYMEMORY_API_URL}?${params}`, { signal });

    if (!response.ok) {
        throw new Error("Não foi possível traduzir o texto.");
    }

    const data = await response.json();

    // responseData.translatedText é o campo principal usado pela API.
    // Se ele não existir, devolvemos o texto original como fallback local.
    // O objetivo é melhorar a experiência, não impedir o jogo por causa da tradução.
    return data.responseData?.translatedText || text;
}

/**
 * Propósito: traduzir os textos de uma pergunta mantendo o formato interno usado pela aplicação.
 * Produz/Devolve: uma nova pergunta com pergunta e respostas traduzidas para português sempre que possível.
 * @param {object} question - pergunta normalizada recebida do serviço de perguntas.
 * @param {AbortSignal} signal - permite cancelar traduções pendentes quando o jogo muda de estado.
 * @returns {Promise<object>} devolve uma Promise com a pergunta traduzida ou a pergunta original em caso de falha.
 */
export async function translateQuestionToPortuguese(question, signal) {
    try {
        // Juntamos todos os textos da pergunta numa lista.
        // Traduzir pergunta e respostas em conjunto mantém o formato interno fácil de reconstruir.
        const textsToTranslate = [
            question.question,
            question.correctAnswer,
            ...question.incorrectAnswers,
        ];

        // Traduzimos os textos da mesma pergunta em paralelo.
        // Isto torna cada pergunta mais rápida do que traduzir pergunta, certa e erradas uma a uma.
        const translatedTexts = await Promise.all(
            textsToTranslate.map((text) =>
                translateTextToPortuguese(text, signal),
            ),
        );

        const [
            translatedQuestion,
            translatedCorrectAnswer,
            ...translatedIncorrectAnswers
        ] = translatedTexts;

        return {
            ...question,
            question: translatedQuestion,
            correctAnswer: translatedCorrectAnswer,
            incorrectAnswers: translatedIncorrectAnswers,
        };
    } catch (error) {
        // AbortError deve continuar a subir para o useEffect cancelar corretamente.
        // Se engolíssemos este erro, a app poderia tratar um cancelamento como tradução falhada normal.
        if (error.name === "AbortError") throw error;

        // Coloquei isto porqu no console aparecia o erro 429 (Too Many Requests).
        if (error?.status === 429) {
            return text;
        }

        // Se a tradução falhar, mantemos a pergunta original em inglês.
        // Este fallback preserva o jogo mesmo quando a segunda API está indisponível.
        return question;
    }
}

/**
 * Propósito: traduzir uma lista completa de perguntas depois da normalização dos dados da API.
 * Produz/Devolve: uma lista final de perguntas pronta para ser usada pelo jogo em português sempre que possível.
 * @param {object[]} questions - lista de perguntas normalizadas antes da tradução.
 * @param {AbortSignal} signal - permite cancelar traduções pendentes para evitar pedidos desnecessários.
 * @returns {Promise<object[]>} devolve uma Promise com a lista de perguntas traduzidas ou parcialmente traduzidas.
 */
export async function translateQuestionsToPortuguese(questions, signal) {
    const translatedQuestions = [];

    // Usamos ciclo sequencial para ser mais simpático com a API gratuita.
    // Dentro de cada pergunta, os 5 textos continuam a ser traduzidos em paralelo.
    // É um compromisso: menos pressão sobre a API, mas ainda com alguma velocidade por pergunta.
    for (const question of questions) {
        const translatedQuestion = await translateQuestionToPortuguese(
            question,
            signal,
        );

        translatedQuestions.push(translatedQuestion);
    }

    return translatedQuestions;
}