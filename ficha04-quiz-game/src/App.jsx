import { useEffect, useMemo, useState } from "react";
import { localQuestions } from "./data/localQuestions";
import QuestionCard from "./components/QuestionCard.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import StartScreen from "./components/StartScreen.jsx";
import ErrorState from "./components/ErrorState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import { fetchTriviaQuestions } from "./services/triviaApi";
import { useGameSettings } from "./context/GameSettingsContext.jsx";


/**
 * Propósito: criar uma nova ordem aleatória das respostas sem alterar o array original recebido pela função.
 * Produz/Devolve: uma nova lista de respostas baralhadas para apresentação no ecrã.
 * @param {string[]} items - lista de respostas da pergunta atual que será baralhada.
 * @returns {string[]} devolve um novo array com as respostas numa ordem aleatória.
 */
function shuffleItems(items) {
    // [...items] cria uma cópia. Assim, não alteramos o array original.
    // Isto é importante porque arrays recebidos de state ou props não devem ser mutados diretamente.
    // sort com Math.random não é perfeito para produção, mas é suficiente para este exercício didático.
    return [...items].sort(() => Math.random() - 0.5);
}

// Tempo inicial de cada pergunta.
// Usar uma constante evita repetir o número 15 em vários sítios.
// Se a regra mudar para 20 segundos, alteramos apenas esta linha.
const QUESTION_TIME_LIMIT = 15;

/**
 * Propósito: controlar o fluxo principal do jogo através do estado da aplicação e validar os dados introduzidos pelo jogador antes de iniciar o jogo.
 * Produz/Devolve: diferentes ecrãs da aplicação conforme o estado atual do jogo, incluindo prepar jogo, jogo em curso e fim do jogo.
 * @returns {JSX.Element} renderiza a interface correspondente aos estados "idle", "playing" ou "finished".
 */
function App() {
    // Índice da pergunta atual dentro do array de perguntas.
    // Começa em 0 porque arrays em JavaScript começam no índice 0.
    // Guardar só o índice é mais simples do que duplicar a pergunta inteira em state.
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const {
        playerName,
        setPlayerName,
        difficulty,
        setDifficulty,
        theme,
        toggleTheme,
    } = useGameSettings();

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

    const [questions, setQuestions] = useState(localQuestions);
    const [errorMessage, setErrorMessage] = useState("");
    const [gameRequest, setGameRequest] = useState(null);

    const startGame = () => {
        if (!canStartGame) return;

        // Libertamos qualquer bloqueio de resposta antes de pedir um novo jogo.
        answeredQuestionRef.current = -1;

        // gameRequest representa a intenção explícita de iniciar um jogo.
        // Guardamos a dificuldade neste momento para mudanças posteriores no select
        // não dispararem outro pedido sem novo clique em "Começar jogo".
        setGameRequest({
            id: Date.now(),
            difficulty,
        });
    };

    const resetGame = () => {
        // Volta ao ecrã inicial.
        // Mantemos nome e dificuldade para o utilizador poder corrigir ou tentar outra vez sem recomeçar tudo.
        setGameStatus("idle");

        // Limpa erro antigo para a próxima tentativa começar limpa.
        // Sem esta limpeza, uma mensagem antiga poderia aparecer num fluxo que já não está em erro.
        setErrorMessage("");
    };

    const currentQuestion = questions[currentQuestionIndex];
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

    /**
     * Propósito: tratar situações em que o jogador não responde antes do tempo terminar e isso faz com que botão "avançar conta a resposta como errada".
     * Produz/Devolve: não devolve valor diretamente mas reutiliza a lógica de resposta errada e atualiza o progresso do jogo.
    */
    const handleTimeout = () => {
        // Reutilizamos handleAnswer para não duplicar lógica de avanço.
        // A string vazia nunca será igual à resposta certa, por isso conta como errada.
        // Assim, timeout e clique numa resposta seguem o mesmo caminho de atualização.
        handleAnswer("");
    };

    const startLocalGame = () => {
        // Usa as perguntas locais já criadas no início da ficha.
        // Este fallback evita que a app dependa totalmente da disponibilidade da API pública.
        setQuestions(localQuestions);

        // Reinicia o progresso do jogo.
        // Ao mudar de fonte de dados, índice, respostas e tempo têm de voltar ao estado inicial.
        setCurrentQuestionIndex(0);
        setAnswerResults([]);
        answeredQuestionRef.current = -1;
        setTimeLeft(QUESTION_TIME_LIMIT);

        // Limpa o erro antigo e entra diretamente no jogo.
        // A partir daqui, a UI deixa de mostrar ErrorState e passa a mostrar QuestionCard.
        setErrorMessage("");
        setGameStatus("playing");
    };

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

    useEffect(() => {
        // Enquanto gameRequest for null, nenhum jogo foi pedido.
        // Esta guarda impede que a API seja chamada automaticamente no primeiro render.
        if (!gameRequest) return;

        // AbortController permite cancelar este fetch no cleanup.
        // É uma proteção contra respostas atrasadas quando o utilizador muda de fluxo rapidamente.
        const controller = new AbortController();

        async function loadQuestions() {
            try {
                // Antes do pedido, mostramos o ecrã de loading.
                // Isto dá feedback imediato e evita parecer que o botão não fez nada.
                setGameStatus("loading");

                // Limpamos erros antigos para não mostrar mensagens desatualizadas.
                // Um erro de uma tentativa anterior não deve aparecer durante uma nova tentativa.
                setErrorMessage("");

                // Um novo jogo recomeça sempre do início.
                // A API pode devolver uma lista nova, por isso o índice e os resultados antigos deixam de fazer sentido.
                setCurrentQuestionIndex(0);
                setAnswerResults([]);
                answeredQuestionRef.current = -1;
                setTimeLeft(QUESTION_TIME_LIMIT);

                // Pedido real à API. A dificuldade vem do pedido criado no clique.
                // Assim, alterar difficulty depois do jogo começar não dispara novo fetch.
                // O App coordena quando pedir dados; o serviço sabe como fazer o pedido.
                const apiQuestions = await fetchTriviaQuestions(
                    gameRequest.difficulty,
                    controller.signal,
                );

                // Guardamos as perguntas recebidas no state.
                // Quando este state muda, o ecrã de pergunta passa a usar a lista externa.
                setQuestions(apiQuestions);

                // Só depois de ter perguntas é que entramos no modo playing.
                // Isto evita renderizar QuestionCard sem dados suficientes.
                setGameStatus("playing");
            } catch (error) {
                // Se o erro foi causado por cancelamento, não mostramos erro ao utilizador.
                // Cancelamento é uma decisão normal da app, não uma falha que o aluno precise de ver.
                if (error.name === "AbortError") return;

                // Guardamos mensagem para o ErrorState.
                // Separar mensagem e estado visual torna o erro mais fácil de apresentar.
                setErrorMessage(error.message);

                // Mantemos perguntas locais como fallback interno para a app continuar consistente.
                // Mesmo quando a API falha, o formato das perguntas continua válido.
                setQuestions(localQuestions);

                // Estado próprio de erro para renderização condicional.
                // Assim a UI mostra uma recuperação clara em vez de ficar presa no loading.
                setGameStatus("error");
            }
        }

        loadQuestions();

        // Cleanup: cancela o pedido se este efeito for substituído ou desmontado.
        // Este padrão evita efeitos antigos a interferirem com o estado atual.
        return () => {
            controller.abort();
        };
        // O pedido deve correr apenas quando existe um novo pedido explícito de jogo.
        // A dificuldade usada já ficou guardada dentro de gameRequest.
    }, [gameRequest]);

    return (
        // <main> identifica o conteúdo principal da página.
        // Além de ser semanticamente correto, ajuda leitores de ecrã e mantém a estrutura HTML organizada.
        // A classe "app" concentra o fundo e o espaçamento global no CSS, evitando estilos espalhados pelo JSX.
        <main className={`app ${theme === "dark" ? "app--dark" : ""}`}>
            {/* "quiz-shell" limita a largura para que o conteúdo continue legível em ecrãs grandes. */}
            <button type="button" className="button-secondary" onClick={toggleTheme}>
                Alternar tema
            </button>
            <div className="quiz-shell">
                <h1>Quiz Game</h1>
                <p>Responde a perguntas para testar conhecimentos.</p>
                {
                    gameStatus === "idle" && (
                        <StartScreen
                            playerName={playerName}
                            onPlayerNameChange={setPlayerName}
                            difficulty={difficulty}
                            onDifficultyChange={setDifficulty}
                            canStartGame={canStartGame}
                            onStartGame={startGame}
                        />
                    )
                }

                {gameStatus === "loading" && <LoadingState />}

                {gameStatus === "error" && (
                    <ErrorState
                        message={errorMessage}
                        onUseLocalQuestions={startLocalGame}
                        onReset={resetGame}
                    />
                )}
                
                {
                    gameStatus === "playing" && currentQuestion && (
                        <QuestionCard
                            question={currentQuestion}
                            answers={currentAnswers}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={totalQuestions}
                            timeLeft={timeLeft}
                            timeLimit={QUESTION_TIME_LIMIT}
                            onAnswer={handleAnswer}
                            onTimeout={handleTimeout}
                        />
                    )
                }

                {
                    gameStatus === "finished" && (
                        <ResultScreen
                            playerName={cleanPlayerName}
                            stats={gameStats}
                            onReset={resetGame}
                        />
                    )
                }
            </div>
        </main>
    );
}

export default App;