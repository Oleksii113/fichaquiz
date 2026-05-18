import TimerBar from "./TimerBar.jsx";

/**
 * Propósito: apresentar a pergunta atual do jogo e permitir ao jogador escolher uma resposta.
 * Produz/Devolve: a interface da pergunta com temporizador, respostas disponíveis e ações relacionadas com timeout.
 * @param {object} props - conjunto de dados e callbacks enviados pelo componente App.
 * @param {object} props.question - objeto que contém os dados da pergunta atual.
 * @param {string[]} props.answers - lista de respostas já baralhadas para mostrar ao jogador.
 * @param {number} props.questionNumber - número da pergunta atual apresentado na interface.
 * @param {number} props.totalQuestions - total de perguntas do jogo.
 * @param {number} props.timeLeft - tempo restante usado para controlar botões e temporizador.
 * @param {number} props.timeLimit - tempo máximo da pergunta usado no cálculo da barra.
 * @param {(answer: string) => void} props.onAnswer - callback chamado quando o jogador escolhe uma resposta.
 * @param {() => void} props.onTimeout - callback usado quando o jogador avança após timeout.
 * @returns {JSX.Element} renderiza o cartão da pergunta atual do jogo.
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