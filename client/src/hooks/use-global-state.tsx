import React from "react";

import { usePlayer } from "./use-player";
import { usePlaylist } from "./use-playlist";
import { useStats } from "./api/use-stats";

type Context = {
  statsQuery: ReturnType<typeof useStats>;
  playlist: ReturnType<typeof usePlaylist>;
  player: ReturnType<typeof usePlayer>;
};

const GlobalStateContext = React.createContext<Context>({} as Context);

function GlobalStateProvider({ children }: { children: React.ReactNode }) {
  const playlist = usePlaylist();
  const statsQuery = useStats(Array.from(playlist.excludedTracks));
  const player = usePlayer(playlist.tracks);

  return (
    <GlobalStateContext.Provider value={{ playlist, statsQuery, player }}>
      {children}
    </GlobalStateContext.Provider>
  );
}

function GlobalConsumer(): Context {
  return React.useContext(GlobalStateContext);
}

export { GlobalStateProvider, GlobalConsumer as useGlobalState };
