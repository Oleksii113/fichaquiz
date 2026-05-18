import TimerBar from "./TimerBar.jsx";

/**
 * Propósito: [Completa: explica como este componente apresenta uma pergunta jogável.]
 * Produz/Devolve: [Completa: descreve pergunta, respostas, temporizador e ação de timeout.]
 * @param {object} props - [Completa: descreve o conjunto de dados e ações vindos do App.]
 * @param {object} props.question - [Completa: explica que informação da pergunta é usada.]
 * @param {string[]} props.answers - [Completa: explica porque as respostas já chegam baralhadas.]
 * @param {number} props.questionNumber - [Completa: explica como este número aparece na interface.]
 * @param {number} props.totalQuestions - [Completa: explica porque o total é necessário.]
 * @param {number} props.timeLeft - [Completa: explica como o tempo altera os botões.]
 * @param {number} props.timeLimit - [Completa: explica porque o limite é necessário para o temporizador.]
 * @param {(answer: string) => void} props.onAnswer - [Completa: explica que valor é enviado ao pai.]
 * @param {() => void} props.onTimeout - [Completa: explica quando esta ação é usada.]
 * @returns {JSX.Element} [Completa: descreve o JSX da pergunta atual.]
 */
function QuestionCard({
    // Dados da pergunta atual.
    // Estes valores são apenas lidos; o QuestionCard não altera a pergunta.
    question,
    answers,
    questionNumber,
    totalQuestions,

    // Estado visual/controlado pelo pai.
    // timeLeft decide se os botões ainda estão ativos e que feedback aparece.
    // timeLimit permite que TimerBar calcule a percentagem sem duplicar constantes.
    timeLeft,
    timeLimit,

    // Callbacks para comunicar ações ao pai.
    // O componente não sabe calcular pontuação; apenas informa o que aconteceu.
    onAnswer,
    onTimeout,
}) {
    return (
        <section className="quiz-card">
            <p>
                Pergunta {questionNumber} de {totalQuestions}
            </p>

            <TimerBar timeLeft={timeLeft} timeLimit={timeLimit} />

            <h2>{question.question}</h2>

            <div className="answer-grid">
                {answers.map((answer, index) => (
                    /*
                      Cada resposta gera um botão independente.
                      O clique envia a resposta escolhida para o App.
                      A key junta id, posição e texto para evitar colisões se duas traduções ficarem iguais.
                      O index é aceitável aqui porque as respostas são pequenas, fixas e não editáveis.
                    */
                    <button
                        key={`${question.id}-${index}-${answer}`}
                        type="button"
                        className="answer-button"
                        onClick={() => onAnswer(answer)}
                        disabled={timeLeft === 0}
                    >
                        {answer}
                    </button>
                ))}
            </div>

            {timeLeft === 0 && (
                // Este bloco só aparece quando já não é possível responder.
                // Separar este estado visual evita cliques tardios depois do tempo terminar.
                <div className="button-row">
                    <p className="error-text">Tempo esgotado.</p>
                    {/*
                      O pai decide como tratar uma pergunta sem resposta.
                      Aqui apenas comunicamos que o tempo acabou.
                      Isto mantém a regra de pontuação concentrada no App.
                    */}
                    <button
                        type="button"
                        className="button-secondary"
                        onClick={onTimeout}
                    >
                        Avançar
                    </button>
                </div>
            )}
        </section>
    );
}

export default QuestionCard;