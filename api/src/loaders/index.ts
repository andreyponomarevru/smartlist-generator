import express from "express";

import { expressLoader } from "./express-loader";
import { expressConfig } from "../config/express";

export * from "./express-loader";

export const appLoader = {
  // ... Add more loaders here ...
  expressApp: expressLoader(express, expressConfig),
};
