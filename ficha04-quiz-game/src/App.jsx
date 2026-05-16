/**
 * Propósito: apresentar a estrutura inicial da aplicação Quiz Game e preparar a interface base antes da introdução de estado e lógica React.
 * Produz/Devolve: devolve um layout estático com o título da aplicação e um cartão introdutório para preparação do jogo.
 * @returns {JSX.Element} renderiza o conteúdo principal da interface inicial do Quiz Game.
 */
function App() {
    return (
        // <main> identifica o conteúdo principal da página.
        // Além de ser semanticamente correto, ajuda leitores de ecrã e mantém a estrutura HTML organizada.
        // A classe "app" concentra o fundo e o espaçamento global no CSS, evitando estilos espalhados pelo JSX.
        <main className="app">
            {/* "quiz-shell" limita a largura para que o conteúdo continue legível em ecrãs grandes. */}
            <div className="quiz-shell">
                <h1>Quiz Game</h1>
                <p>Responde a perguntas para testar conhecimentos.</p>

                {/* Nesta fase, o cartão é estático para confirmar layout antes de introduzir estado. */}
                <section className="quiz-card">
                    <h2>Preparar jogo</h2>
                    <p className="muted">
                        Na próxima fase vais controlar o nome e a dificuldade
                        com estado React.
                    </p>
                </section>
            </div>
        </main>
    );
}

export default App;