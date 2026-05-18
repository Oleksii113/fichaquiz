/**
 * Propósito: [Completa: explica como este componente recupera de uma falha da API.]
 * Produz/Devolve: [Completa: descreve a mensagem de erro e as ações disponíveis.]
 * @param {object} props - [Completa: descreve os dados e callbacks usados neste ecrã.]
 * @param {string} props.message - [Completa: explica de onde vem a mensagem.]
 * @param {() => void} props.onUseLocalQuestions - [Completa: explica quando usar perguntas locais.]
 * @param {() => void} props.onReset - [Completa: explica como voltar ao ecrã inicial.]
 * @returns {JSX.Element} [Completa: descreve o JSX de erro.]
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