/**
 * Propósito: mostrar feedback visual enquanto a aplicação espera pelo carregamento das perguntas.
 * Produz/Devolve: um ecrã simples de loading com mensagem informativa para o jogador.
 * @returns {JSX.Element} renderiza o estado visual de carregamento da aplicação.
 */
function LoadingState() {
    return (
        <section className="quiz-card">
            {/* Este componente não precisa de state: só mostra feedback fixo.
                O estado loading já foi decidido pelo App. */}
            <h2>A carregar perguntas...</h2>
            <p className="muted">O jogo vai começar dentro de instantes.</p>
        </section>
    );
}

export default LoadingState;