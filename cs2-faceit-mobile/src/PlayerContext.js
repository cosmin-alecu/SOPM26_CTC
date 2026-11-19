import { createContext, useContext, useState } from "react";

// Jucătorul căutat este partajat între tab-uri (Căutare, Hărți, Compară), ca pe site
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [playerData, setPlayerData] = useState(null);

  return (
    <PlayerContext.Provider value={{ playerData, setPlayerData }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
