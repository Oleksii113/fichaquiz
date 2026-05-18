/**
 * Propósito: informar o utilizador que a aplicação está a carregar perguntas e a tentar traduzir-las.
 * Produz/Devolve: uma mensagem visual de carregamento e preparação do jogo.
 * @returns {JSX.Element} devolve o JSX do ecrã de loading com informação sobre carregamento e tradução.
 */
function LoadingState() {
    return (
        <section className="quiz-card">
            <h2>A preparar perguntas...</h2>
            <p className="muted">
                A carregar perguntas e a tentar traduzir para português.
            </p>
        </section>
    );
}

export default LoadingState;