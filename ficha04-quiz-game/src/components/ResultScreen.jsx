/**
 * Propósito: mostrar o resultado final do jogo e resumir o desempenho do jogador.
 * Produz/Devolve: um ecrã final com pontuação, percentagem de respostas certas e botão para reiniciar o jogo.
 * @param {object} props - dados finais e callbacks recebidos do App.
 * @param {string} props.playerName - nome do jogador apresentado no resultado final.
 * @param {object} props.stats - objeto com estatísticas calculadas do jogo.
 * @param {object | null} props.bestScore - melhor pontuação guardada no localStorage.
 * @param {() => void} props.onReset - callback chamado para voltar ao início do jogo.
 * @returns {JSX.Element} renderiza o ecrã final do "Quiz Game".
 */
function ResultScreen({playerName, stats, bestScore, onReset,}) {
    // Medalha depende da percentagem final do jogador.
    // Quanto melhor o desempenho, melhor a medalha apresentada.
    let medal = "🎯";

    if (stats.percentage >= 90) {
        medal = "🥇";
    } else if (stats.percentage >= 70) {
        medal = "🥈";
    } else if (stats.percentage >= 50) {
        medal = "🥉";
    }

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
            <p className="result-medal">
                Medalha: {medal}
            </p>   
            {bestScore && (
                <div className="best-score-box">
                    <h3>Melhor pontuação</h3>

                    <p>Jogador: {bestScore.playerName}</p>
                    <p>Pontuação: {bestScore.score}</p>
                    <p>Percentagem: {bestScore.percentage}%</p>
                    <p>Dificuldade: {bestScore.difficulty}</p>
                    <p>Data: {bestScore.date}</p>
                </div>
            )}
            <button type="button" className="button-primary" onClick={onReset}>
                Voltar ao início
            </button>
        </section>
    );
}

export default ResultScreen;