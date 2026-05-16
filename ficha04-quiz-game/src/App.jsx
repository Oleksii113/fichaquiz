import { useEffect, useMemo, useState } from "react";
import { localQuestions } from "./data/localQuestions";

/**
 * Propósito: controlar o fluxo principal do jogo através do estado da aplicação e validar os dados introduzidos pelo jogador antes de iniciar o jogo.
 * Produz/Devolve: diferentes ecrãs da aplicação conforme o estado atual do jogo, incluindo prepar jogo, jogo em curso e fim do jogo.
 * @returns {JSX.Element} renderiza a interface correspondente aos estados "idle", "playing" ou "finished".
 */

/**
 * Propósito: criar uma nova ordem aleatória das respostas sem alterar o array original recebido pela função.
 * Produz/Devolve: uma nova lista de respostas baralhadas para apresentação no ecrã.
 * @param {string[]} items - lista de respostas da pergunta atual que será baralhada.
 * @returns {string[]} devolve um novo array com as respostas numa ordem aleatória.
 */

// Tempo inicial de cada pergunta.
// Usar uma constante evita repetir o número 15 em vários sítios.
// Se a regra mudar para 20 segundos, alteramos apenas esta linha.
const QUESTION_TIME_LIMIT = 15;

function shuffleItems(items) {
    // [...items] cria uma cópia. Assim, não alteramos o array original.
    // Isto é importante porque arrays recebidos de state ou props não devem ser mutados diretamente.
    // sort com Math.random não é perfeito para produção, mas é suficiente para este exercício didático.
    return [...items].sort(() => Math.random() - 0.5);
}

function App() {
    // Índice da pergunta atual dentro do array de perguntas.
    // Começa em 0 porque arrays em JavaScript começam no índice 0.
    // Guardar só o índice é mais simples do que duplicar a pergunta inteira em state.
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Nome escrito pelo jogador.
    // É atualizado a cada tecla e usado depois para validação e resultado final.
    const [playerName, setPlayerName] = useState("");

    // Dificuldade escolhida no select.
    // Mais tarde será enviada para a API para pedir perguntas adequadas.
    const [difficulty, setDifficulty] = useState("easy");

    // Estado que decide que "ecrã" a app mostra neste momento.
    // Guardar isto num único state evita vários booleans soltos como isPlaying, isFinished, isLoading.
    const [gameStatus, setGameStatus] = useState("idle");

    // Guarda um boolean por cada resposta:
    // true = certa, false = errada.
    // Este formato é simples de contar com filter(Boolean) e evita guardar texto desnecessário.
    const [answerResults, setAnswerResults] = useState([]);

    // Tempo restante da pergunta atual.
    // Este valor muda com o temporizador e também é reposto quando passamos para outra pergunta.
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);

    // trim remove espaços no início/fim para evitar nomes que parecem preenchidos mas não têm caracteres úteis.
    const cleanPlayerName = playerName.trim();

    // Regra simples de validação.
    // Exigir pelo menos 2 caracteres impede começar com texto vazio ou demasiado ambíguo.
    const canStartGame = cleanPlayerName.length >= 2;

    const startGame = () => {
        if (!canStartGame) return;

        setCurrentQuestionIndex(0);
        setAnswerResults([]);

        // Cada jogo começa com o tempo completo.
        // Isto evita herdar o tempo que sobrou da tentativa anterior.
        setTimeLeft(QUESTION_TIME_LIMIT);
        setGameStatus("playing");
    };

    const resetGame = () => {
        // Volta ao ecrã inicial.
        // Nesta fase ainda não limpamos tudo, porque o objetivo é apenas testar transições.
        setGameStatus("idle");
    };

    // Por agora, a fonte de perguntas é apenas o array local.
    // Mais tarde, esta variável será substituída por state vindo da API.
    // Esta etapa separa a mecânica do jogo da dificuldade adicional dos pedidos HTTP.
    const questions = localQuestions;

    // A pergunta atual é encontrada pelo índice guardado no state.
    // Se currentQuestionIndex mudar, o React recalcula esta variável no render seguinte.
    const currentQuestion = questions[currentQuestionIndex];

    // Guardamos o total numa variável para não repetir questions.length no JSX.
    // Também torna mais fácil trocar perguntas locais por perguntas externas sem mexer em vários sítios.
    const totalQuestions = questions.length;

    /**
     * Propósito: avaliar a resposta selecionada pelo jogador, guardar o resultado e avançar para a próxima pergunta ou terminar o jogo.
     * Produz/Devolve: não devolve valor diretamente mas atualiza o estado das respostas, da pergunta atual e do estado do jogo.
     * @param {string} selectedAnswer - resposta escolhida pelo jogador através dos botões de resposta da pergunta atual.
     */
    const handleAnswer = (selectedAnswer) => {
        // Compara a resposta escolhida com a resposta certa da pergunta atual.
        // A comparação é direta porque cada botão envia exatamente o texto da resposta.
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        // Criamos um novo array para respeitar a regra de imutabilidade do React.
        // Nunca fazemos answerResults.push(...), porque isso altera o array antigo e pode impedir o React de detetar a mudança.
        const updatedResults = [...answerResults, isCorrect];

        // Atualiza o histórico de respostas.
        // Depois deste setState, a próxima renderização já terá o novo resultado incluído.
        setAnswerResults(updatedResults);

        // Estamos na última pergunta se o índice atual for o último índice do array.
        // Como os índices começam em 0, o último índice é questions.length - 1.
        const isLastQuestion = currentQuestionIndex === questions.length - 1;

        if (isLastQuestion) {
            // Se era a última pergunta, o jogo termina.
            // Mudamos de ecrã em vez de tentar avançar para uma pergunta que não existe.
            setGameStatus("finished");
            return;
        }

        // Caso contrário, avança uma posição no array.
        // Usamos atualização funcional para trabalhar sempre com o índice mais recente.
        // Quando avança para a próxima pergunta, o temporizador reinicia.
        // Esta linha fica junto do avanço para manter índice e tempo sincronizados.
        setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
        setTimeLeft(QUESTION_TIME_LIMIT);
    };

    const currentAnswers = useMemo(() => {
        // Durante alguns renders, pode ainda não existir pergunta atual.
        // Nesse caso, devolvemos array vazio para evitar erros no .map().
        // Esta guarda é especialmente útil quando a app passa por loading, erro ou troca de perguntas.
        if (!currentQuestion) return [];

        // Juntamos resposta certa + erradas num único array.
        // A UI só precisa de uma lista de botões, não de saber qual resposta era certa nesta etapa.
        return shuffleItems([
            currentQuestion.correctAnswer,
            ...currentQuestion.incorrectAnswers,
        ]);
        // Só queremos baralhar quando muda a pergunta atual.
        // Se o tempo mudar, currentQuestion não muda, por isso a ordem mantém-se.
        // Isto evita uma experiência injusta em que as respostas saltam de posição a cada segundo.
    }, [currentQuestion]);

    const gameStats = useMemo(() => {
        // Conta apenas os valores true.
        // Boolean é prático aqui porque cada resposta fica registada como true/false.
        // Assim transformamos o histórico de respostas num número de respostas certas sem criar novo state.
        const correctAnswers = answerResults.filter(Boolean).length;

        // Nesta regra simples, cada resposta certa vale 100 pontos.
        // A pontuação é derivada, por isso deve ser calculada e não guardada separadamente.
        const score = correctAnswers * 100;

        // Evita divisão por zero caso ainda não existam perguntas.
        // Esta proteção torna o cálculo robusto mesmo durante loading ou falhas da API.
        const percentage =
            totalQuestions > 0
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0;

        // Regra do jogo: o jogador atinge o objetivo se acertar pelo menos 60%.
        // Separar esta regra numa variável facilita mudar o critério mais tarde.
        const victory = percentage >= 60;

        // Devolvemos um objeto para agrupar todas as estatísticas finais.
        // O ResultScreen recebe um único objeto em vez de várias props soltas.
        return {
            correctAnswers,
            totalQuestions,
            score,
            percentage,
            victory,
        };
        // O cálculo só precisa de ser refeito quando mudam as respostas ou o total.
        // Se outro state mudar, como o tema, estas estatísticas não precisam de ser recalculadas.
    }, [answerResults, totalQuestions]);

    useEffect(() => {
        // O temporizador só deve correr durante o jogo.
        // Se estivermos no menu, loading, erro ou resultado, não faz nada.
        // Esta guarda impede contagens invisíveis quando o utilizador não está a responder.
        if (gameStatus !== "playing") return;

        // Se o tempo chegou a 0, paramos de agendar novos segundos.
        // Sem esta condição, o contador poderia continuar para valores negativos.
        if (timeLeft === 0) return;

        // setTimeout espera 1 segundo e depois atualiza o state.
        // Como timeLeft está nas dependências, cada atualização agenda o próximo segundo.
        const timeoutId = setTimeout(() => {
            // Forma funcional: recebe o valor mais recente do state.
            // Isto evita bugs quando várias atualizações ficam próximas no tempo.
            setTimeLeft((currentTime) => currentTime - 1);
        }, 1000);

        // Cleanup: se o componente renderizar outra vez antes do timeout terminar,
        // cancelamos o timeout anterior para evitar contagens duplicadas.
        // Este padrão é essencial em efeitos com timers.
        return () => {
            clearTimeout(timeoutId);
        };
        // Dependências: o efeito depende do estado do jogo e do tempo atual.
        // Se um destes valores mudar, o React reavalia se deve continuar a contar.
    }, [gameStatus, timeLeft]);

    return (
        // <main> identifica o conteúdo principal da página.
        // Além de ser semanticamente correto, ajuda leitores de ecrã e mantém a estrutura HTML organizada.
        // A classe "app" concentra o fundo e o espaçamento global no CSS, evitando estilos espalhados pelo JSX.
        <main className="app">
            {/* "quiz-shell" limita a largura para que o conteúdo continue legível em ecrãs grandes. */}
            <div className="quiz-shell">
                <h1>Quiz Game</h1>

                {gameStatus === "idle" && (
                    // Renderização condicional: este bloco só aparece no estado "idle".
                    // Esta técnica mantém vários ecrãs no mesmo componente sem mostrar todos ao mesmo tempo.
                    <section className="quiz-card">
                        <h2>Preparar jogo</h2>

                        <label className="form-row">
                            Nome do jogador
                            {/*
                            Num input controlado, o value vem sempre do state.
                            O utilizador escreve, onChange recebe o novo texto, e setPlayerName sincroniza React com o input.
                            Assim, a UI nunca depende de um valor escondido apenas dentro do DOM.
                            */}
                    
                            <input
                                type="text"
                                value={playerName}
                                onChange={(event) =>
                                    setPlayerName(event.target.value)
                                }
                                placeholder="Ex.: Ana"
                            />
                        </label>

                        <label className="form-row">
                            Dificuldade
                            {/*
                            O select segue a mesma regra do input controlado.
                            event.target.value contém o value da option escolhida e passa a ser a dificuldade oficial da app.
                            */}
                            <select
                                value={difficulty}
                                onChange={(event) =>
                                    setDifficulty(event.target.value)
                                }
                            >
                                <option value="easy">Fácil</option>
                                <option value="medium">Média</option>
                                <option value="hard">Difícil</option>
                            </select>
                        </label>

                        {!canStartGame && (
                            // Feedback imediato para explicar porque o botão está bloqueado.
                            // Sem esta mensagem, o utilizador poderia pensar que o botão não funciona.
                            <p className="error-text">
                                Escreve pelo menos 2 caracteres no nome.
                            </p>
                        )}

                        <div className="button-row">
                            {/*
                              O botão fica bloqueado até o nome ser válido.
                              Isto dá feedback visual, impede cliques inválidos e reforça a mesma regra usada no handler.
                            */}
                            <button
                                type="button"
                                className="button-primary"
                                onClick={startGame}
                                disabled={!canStartGame}
                            >
                                Começar jogo
                            </button>
                        </div>
                    </section>
                )}

                {
                    gameStatus === "playing" && currentQuestion && (
                        <section className="quiz-card">
                            <p>Tempo restante: {timeLeft}s</p>
                            <p>
                                Pergunta {currentQuestionIndex + 1} de {totalQuestions}
                            </p>
                            <h2>{currentQuestion.question}</h2>

                            <div className="answer-grid">
                                {currentAnswers.map((answer) => (
                                    /*
                                Cada resposta gera um botão.
                                A key ajuda o React a identificar cada item.
                                */
                                    <button
                                        key={answer}
                                        type="button"
                                        className="answer-button"
                                        onClick={() => handleAnswer(answer)}
                                    >
                                        {answer}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )
                }

                {
                    gameStatus === "finished" && (
                        <section className="quiz-card">
                            <h2>
                                {gameStats.victory ? "Objetivo atingido!" : "Tenta novamente!"}
                            </h2>
                            <p>Jogador: {cleanPlayerName}</p>
                            <p>Pontuação: {gameStats.score}</p>
                            <p>
                                Certas: {gameStats.correctAnswers} de {gameStats.totalQuestions}
                            </p>
                            <p>Percentagem: {gameStats.percentage}%</p>

                            <button
                                type="button"
                                className="button-primary"
                                onClick={resetGame}
                            >
                                Voltar ao início
                            </button>
                        </section>
                    )
                }
            </div>
        </main>
    );
}

export default App;