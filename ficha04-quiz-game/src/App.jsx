import { useState } from "react";
import { localQuestions } from "./data/localQuestions";

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

    // trim remove espaços no início/fim para evitar nomes que parecem preenchidos mas não têm caracteres úteis.
    const cleanPlayerName = playerName.trim();

    // Regra simples de validação.
    // Exigir pelo menos 2 caracteres impede começar com texto vazio ou demasiado ambíguo.
    const canStartGame = cleanPlayerName.length >= 2;

    const startGame = () => {
        // Mantemos a validação da fase anterior.
        // A validação continua a proteger a lógica mesmo que a UI seja alterada no futuro.
        if (!canStartGame) return;

        // Cada novo jogo deve começar na primeira pergunta.
        // Sem isto, um segundo jogo poderia arrancar a meio da lista.
        setCurrentQuestionIndex(0);

        // Cada novo jogo deve limpar respostas antigas.
        // Caso contrário, os resultados do jogo anterior contaminariam a pontuação.
        setAnswerResults([]);

        // Só depois de reiniciar o progresso mudamos para o ecrã de jogo.
        // A ordem ajuda a garantir que o ecrã playing já recebe estado limpo.
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
        setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    };

    // Nesta fase, as respostas ainda aparecem sempre na mesma ordem:
    // primeiro a correta, depois as erradas. Mais tarde vamos baralhar.
    // Fazemos assim de propósito para aprender a mecânica antes de resolver o problema da ordem previsível.
    const currentAnswers = currentQuestion
        ? [currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers]
        : [];

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
                            <h2>Fim do jogo</h2>
                            <p>Jogador: {cleanPlayerName}</p>
                            <p>
                                Respostas certas: {answerResults.filter(Boolean).length} de{" "}
                                {totalQuestions}
                            </p>

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