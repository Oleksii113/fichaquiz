import { useState } from "react";

/**
 * Propósito: [Completa: explica como este componente controla o ecrã atual do jogo.]
 * Produz/Devolve: [Completa: descreve os ecrãs que podem ser renderizados conforme gameStatus.]
 * @returns {JSX.Element} [Completa: indica o JSX produzido para idle, playing ou finished.]
 */
function App() {
    // Nome escrito pelo jogador.
    // É atualizado a cada tecla e usado depois para validação e resultado final.
    const [playerName, setPlayerName] = useState("");

    // Dificuldade escolhida no select.
    // Mais tarde será enviada para a API para pedir perguntas adequadas.
    const [difficulty, setDifficulty] = useState("easy");

    // Estado que decide que "ecrã" a app mostra neste momento.
    // Guardar isto num único state evita vários booleans soltos como isPlaying, isFinished, isLoading.
    const [gameStatus, setGameStatus] = useState("idle");

    // trim remove espaços no início/fim para evitar nomes que parecem preenchidos mas não têm caracteres úteis.
    const cleanPlayerName = playerName.trim();

    // Regra simples de validação.
    // Exigir pelo menos 2 caracteres impede começar com texto vazio ou demasiado ambíguo.
    const canStartGame = cleanPlayerName.length >= 2;

    const startGame = () => {
        // Se o nome ainda não for válido, a função termina imediatamente.
        // Esta proteção fica no handler mesmo que o botão já esteja disabled, porque a lógica não deve depender só da UI.
        if (!canStartGame) return;

        // Mudar o estado do jogo faz a UI trocar do ecrã inicial para o jogo.
        // Não manipulamos o DOM diretamente; pedimos ao React para renderizar outro bloco.
        setGameStatus("playing");
    };

    const resetGame = () => {
        // Volta ao ecrã inicial.
        // Nesta fase ainda não limpamos tudo, porque o objetivo é apenas testar transições.
        setGameStatus("idle");
    };

    return (
        <main className="app">
            <div className="quiz-shell">
                <h1>Quiz Game</h1>

                {gameStatus === "idle" && (
                    // Renderização condicional: este bloco só aparece no estado "idle".
                    // Esta técnica mantém vários ecrãs no mesmo componente sem mostrar todos ao mesmo tempo.
                    <section className="quiz-card">
                        <h2>Preparar jogo</h2>

                        <label className="form-row">
                            Nome do jogador
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

                {gameStatus === "playing" && (
                    // Bloco temporário para confirmar a transição de estado.
                    // Antes de criar perguntas reais, validamos que o fluxo idle -> playing funciona.
                    <section className="quiz-card">
                        <h2>Jogo em curso</h2>
                        <p>Jogador: {cleanPlayerName}</p>
                        <p>Dificuldade: {difficulty}</p>
                        <button
                            type="button"
                            className="button-secondary"
                            onClick={() => setGameStatus("finished")}
                        >
                            Terminar teste rápido
                        </button>
                    </section>
                )}

                {gameStatus === "finished" && (
                    // Bloco final temporário.
                    // Mais tarde será substituído por um resultado calculado a partir das respostas do jogador.
                    <section className="quiz-card">
                        <h2>Fim do jogo</h2>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={resetGame}
                        >
                            Voltar ao início
                        </button>
                    </section>
                )}
            </div>
        </main>
    );
}

export default App;