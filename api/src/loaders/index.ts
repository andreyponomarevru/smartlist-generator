import { expressLoader } from "./express-loader";

export * from "./express-loader";

export const appLoader = {
  // ... Add more loaders here ...
  expressApp: expressLoader(),
};
