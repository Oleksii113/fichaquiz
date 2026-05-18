/**
 * Propósito: [Completa: explica como este componente representa visualmente o tempo.]
 * Produz/Devolve: [Completa: descreve o texto e a barra de progresso gerados.]
 * @param {object} props - [Completa: descreve as props necessárias para calcular a barra.]
 * @param {number} props.timeLeft - [Completa: explica que unidade representa e como afeta a UI.]
 * @param {number} props.timeLimit - [Completa: explica qual é o tempo total da pergunta.]
 * @returns {JSX.Element} [Completa: descreve o JSX do temporizador.]
 */
function TimerBar({ timeLeft, timeLimit }) {
    // Converte segundos restantes em percentagem para controlar a largura da barra.
    // timeLimit vem do App para existir uma única fonte de verdade para a regra dos segundos.
    const percentage = (timeLeft / timeLimit) * 100;

    return (
        <div className="timer">
            <p>Tempo restante: {timeLeft}s</p>
            <div className="timer-bar">
                {/*
                  Este é um caso aceitável de estilo inline:
                  a largura depende de um valor dinâmico calculado em React.
                  As restantes regras visuais continuam no CSS para manter responsabilidades separadas.
                */}
                <div
                    className="timer-bar__fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default TimerBar;