import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GameSettingsProvider } from "./context/GameSettingsContext.jsx";
import "./styles/index.css";
import "./styles/quiz.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GameSettingsProvider>
            <App />
        </GameSettingsProvider>
    </React.StrictMode>,
);