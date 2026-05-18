/**
 * Propósito: mostrar visualmente o tempo restante da pergunta atual através de texto e barra de progresso com as cores.
 * Produz/Devolve: um temporizador com segundos restantes e uma barra com as cores que diminui conforme o tempo passa.
 * @param {object} props - props para controlar o temporizador visual.
 * @param {number} props.timeLeft - quantidade de segundos restantes da pergunta atual.
 * @param {number} props.timeLimit - tempo total disponível para responder à pergunta.
 * @returns {JSX.Element} renderiza o temporizador da pergunta atual.
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