/**
 * Propósito: [Completa: explica como este componente resume o desempenho do jogador.]
 * Produz/Devolve: [Completa: descreve pontuação, percentagem, mensagem final e botão de reinício.]
 * @param {object} props - [Completa: descreve os dados finais recebidos do App.]
 * @param {string} props.playerName - [Completa: explica porque mostramos o nome no resultado.]
 * @param {object} props.stats - [Completa: explica que estatísticas este objeto contém.]
 * @param {() => void} props.onReset - [Completa: explica que estado deve ser reposto pelo pai.]
 * @returns {JSX.Element} [Completa: descreve o JSX do ecrã final.]
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