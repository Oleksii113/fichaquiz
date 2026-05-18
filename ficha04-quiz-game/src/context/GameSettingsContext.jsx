/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const GameSettingsContext = createContext(null);

/**
 * Propósito: disponibilizar preferências globais e funções de atualização para toda a aplicação através de Context.
 * Produz/Devolve: um Provider que envolve os componentes filhos e fornece acesso ao nome do jogador, dificuldade, tema e respetivas funções de atualização.
 * @param {object} props - propriedades recebidas pelo Provider.
 * @param {React.ReactNode} props.children - componentes filhos que ficam dentro do contexto e podem consumir os dados globais.
 * @returns {JSX.Element} devolve o Provider do contexto com os componentes filhos no interior.
 */
export function GameSettingsProvider({ children }) {
    // Estes estados deixam de viver no App porque são preferências globais.
    // Vários componentes podem precisar deles, mesmo que não estejam numa relação direta de pai/filho.
    // Context evita passar estas preferências por componentes intermédios que não as usam.
    const [playerName, setPlayerName] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [theme, setTheme] = useState("light");
    // Quantidade das perguntas. Primeiro vai mostrar 5 mas depois vamos poder escolher 10.
    const [questionAmount, setQuestionAmount] = useState(5);

    const value = useMemo(() => {
        // Este objeto agrupa as preferências globais e as funções que as alteram.
        // Por isso deve conter apenas dados realmente globais e não ações específicas de um componente.
        return {
            questionAmount,
            setQuestionAmount,
            playerName,
            setPlayerName,
            difficulty,
            setDifficulty,
            theme,
            toggleTheme: () => {
                // Atualização funcional para depender sempre do tema atual mais recente.
                // Isto é mais seguro do que calcular o próximo tema a partir de uma variável possivelmente antiga.
                setTheme((currentTheme) =>
                    currentTheme === "light" ? "dark" : "light",
                );
            },
        };
        // O objeto só é recriado quando alguma preferência muda.
        // Isto evita criar uma referência nova em todos os renders e reduz re-renders desnecessários dos consumidores.
    }, [playerName, difficulty, questionAmount, theme]);

    return (
        <GameSettingsContext.Provider value={value}>
            {children}
        </GameSettingsContext.Provider>
    );
}

/**
 * Propósito: facilitar o acesso ao contexto de preferências globais através de um hook personalizado.
 * Produz/Devolve: o objeto do contexto com dados globais e funções para atualizar preferências da aplicação.
 * @returns {object} devolve playerName, difficulty, theme e as respetivas funções de atualização e controlo.
 */
export function useGameSettings() {
    // useContext lê o valor mais próximo fornecido pelo Provider.
    // Se houver vários Providers, React usa o mais próximo na árvore de componentes.
    const context = useContext(GameSettingsContext);

    if (!context) {
        // Erro intencional: ajuda a detetar uso do hook fora do Provider.
        // Falhar cedo com uma mensagem clara é melhor do que devolver undefined e causar erros confusos mais tarde.
        throw new Error(
            "useGameSettings deve ser usado dentro de GameSettingsProvider.",
        );
    }

    return context;
}