import React from "react";

import { usePlayer } from "./use-player";
import { useStats } from "../api/use-stats";
import { usePlaylist } from "./use-playlist-extended";

type Context = {
  statsQuery: ReturnType<typeof useStats>;
  playlist: ReturnType<typeof usePlaylist>;
  player: ReturnType<typeof usePlayer>;
};

const GlobalStateContext = React.createContext<Context>({} as Context);

function GlobalStateProvider({ children }: { children: React.ReactNode }) {
  const playlist = usePlaylist();
  const statsQuery = useStats([...playlist.excludedTracks.state.trackIds]);
  const player = usePlayer();

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
