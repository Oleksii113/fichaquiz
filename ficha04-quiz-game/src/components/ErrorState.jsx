/**
 * Propósito: informar o utilizador sobre um erro ao carregar perguntas e permitir recuperar da situação.
 * Produz/Devolve: um ecrã de erro com mensagem explicativa e botões de recuperação.
 * @param {object} props - dados e callbacks necessários para mostrar e tratar o erro.
 * @param {string} props.message - mensagem de erro recebida do componente App.
 * @param {() => void} props.onUseLocalQuestions - callback usado para iniciar o jogo com perguntas locais.
 * @param {() => void} props.onReset - callback usado para voltar ao ecrã inicial da aplicação.
 * @returns {JSX.Element} renderiza o ecrã de erro da aplicação.
 */
function ErrorState({ message, onUseLocalQuestions, onReset }) {
    return (
        <section className="quiz-card">
            <h2>Não foi possível começar o jogo</h2>

            {/* A mensagem vem do App, porque o erro nasce no pedido à API.
                O componente de erro não deve inventar a causa da falha. */}
            <p className="error-text">{message}</p>
            <p className="muted">
                Podes voltar ao início ou continuar com as perguntas locais da
                ficha.
            </p>

            {/*
              O filho não decide como recuperar do erro.
              Apenas chama os callbacks recebidos do pai.
              Assim, a recuperação continua centralizada no App.
            */}
            <div className="button-row">
                <button
                    type="button"
                    className="button-primary"
                    onClick={onUseLocalQuestions}
                >
                    Usar perguntas locais
                </button>

                <button
                    type="button"
                    className="button-secondary"
                    onClick={onReset}
                >
                    Voltar ao início
                </button>
            </div>
        </section>
    );
}

export default ErrorState;