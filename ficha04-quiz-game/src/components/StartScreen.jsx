/**
 * Propósito: apresentar o ecrã inicial do jogo e permitir ao jogador escolher nome e dificuldade e depois começar.
 * Produz/Devolve: um formulário com input de nome, seleção de dificuldade, mensagen de validação do nome e botão para iniciar o jogo.
 * @param {object} props - conjunto de dados e callbacks recebidos do componente App.
 * @param {string} props.playerName - valor atual do nome do jogador no input controlado.
 * @param {(name: string) => void} props.onPlayerNameChange - callback chamado quando o utilizador altera o texto do input.
 * @param {string} props.difficulty - dificuldade que está atualmente selecionada no select.
 * @param {(difficulty: string) => void} props.onDifficultyChange - callback usado para atualizar a dificuldade no componente pai.
 * @param {boolean} props.canStartGame - indica se o jogador já pode começar o jogo ou não.
 * @param {() => void} props.onStartGame - função chamada quando o jogador clica no botão para começar.
 * @returns {JSX.Element} renderiza o ecrã inicial do "Quiz Game".
 */
function StartScreen({
    // Valores controlados pelo componente pai.
    // O StartScreen não guarda estado próprio para estes campos; apenas mostra e comunica alterações.
    playerName,
    onPlayerNameChange,
    difficulty,
    onDifficultyChange,

    // Validação também vem do pai, porque depende da regra da app.
    // Isto evita duplicar a mesma regra em dois componentes diferentes.
    canStartGame,

    // Callback chamado quando o jogador tenta começar.
    // O filho não muda gameStatus diretamente; pede ao App para decidir.
    onStartGame,

    questionAmount,
    onQuestionAmountChange,
}) {
    return (
        <section className="quiz-card">
            <h2>Preparar jogo</h2>

            <label className="form-row">
                Nome do jogador
                {/*
                  O filho mostra o valor recebido por props e usa o callback
                  para pedir ao pai que atualize o state.
                  Isto é o fluxo normal do React: dados descem, ações sobem.
                */}
                <input
                    type="text"
                    value={playerName}
                    onChange={(event) => onPlayerNameChange(event.target.value)}
                    placeholder="Ex.: Ana"
                />
            </label>

            <label className="form-row">
                Dificuldade
                {/*
                  Mesma ideia do input: valor recebido por props,
                  atualização comunicada ao pai por callback.
                  O select não decide a dificuldade global sozinho.
                */}
                <select
                    value={difficulty}
                    onChange={(event) => onDifficultyChange(event.target.value)}
                >
                    <option value="easy">Fácil</option>
                    <option value="medium">Média</option>
                    <option value="hard">Difícil</option>
                </select>
            </label>
            <label className="form-row">
                Número de perguntas

                {/*
                O utilizador pode escolher quantas perguntas quer jogar.
                O valor continua controlado pelo componente pai através de props.
                */}
                <select
                    value={questionAmount}
                    onChange={(event) =>
                        onQuestionAmountChange(Number(event.target.value))
                    }
                >
                    <option value={5}>5 perguntas</option>
                    <option value={10}>10 perguntas</option>
                </select>
            </label>

            {!canStartGame && (
                // A mensagem usa a validação calculada no pai.
                // Assim, o botão e o texto de erro obedecem exatamente à mesma condição.
                <p className="error-text">
                    Escreve pelo menos 2 caracteres no nome.
                </p>
            )}

            <div className="button-row">
                {/*
                  O clique sobe para o pai. O componente filho não decide
                  sozinho quando o jogo começa.
                  Esta separação deixa o componente reutilizável e fácil de testar.
                */}
                <button
                    type="button"
                    className="button-primary"
                    onClick={onStartGame}
                    disabled={!canStartGame}
                >
                    Começar jogo
                </button>
            </div>
        </section>
    );
}

export default StartScreen;