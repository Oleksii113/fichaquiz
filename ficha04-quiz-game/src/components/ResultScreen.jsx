/**
 * Propósito: mostrar o resultado final do jogo e resumir o desempenho do jogador.
 * Produz/Devolve: um ecrã final com pontuação, percentagem de respostas certas e botão para reiniciar o jogo.
 * @param {object} props - dados finais e callbacks recebidos do App.
 * @param {string} props.playerName - nome do jogador apresentado no resultado final.
 * @param {object} props.stats - objeto com estatísticas calculadas do jogo.
 * @param {() => void} props.onReset - callback chamado para voltar ao início do jogo.
 * @returns {JSX.Element} renderiza o ecrã final do "Quiz Game".
 */
function ResultScreen({ playerName, stats, onReset }) {
    return (
        <section className="quiz-card">
            {/* A frase depende de stats.victory, calculado no App com useMemo.
                O ResultScreen só apresenta dados; não recalcula a regra de sucesso. */}
            <h2>{stats.victory ? "Objetivo atingido!" : "Tenta novamente!"}</h2>
            <p>Jogador: {playerName}</p>
            <p>Pontuação: {stats.score}</p>
            <p>
                Certas: {stats.correctAnswers} de {stats.totalQuestions}
            </p>
            <p>Percentagem: {stats.percentage}%</p>

            <button type="button" className="button-primary" onClick={onReset}>
                Voltar ao início
            </button>
        </section>
    );
}

export default ResultScreen;