import * as RTK from "@reduxjs/toolkit";

import type { RootState, AppDispatch } from "./store";

// TypeScript helpers

export const listenerMiddleware = RTK.createListenerMiddleware();
export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export const addAppListener = RTK.addListener.withTypes<
  RootState,
  AppDispatch
>();
