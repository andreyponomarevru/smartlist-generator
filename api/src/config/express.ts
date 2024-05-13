import { HTTP_PORT, NODE_ENV } from "../config/env";
import { handle404Error } from "../middlewares/handle-404-error";
import { handleErrors } from "../middlewares/handle-errors";
import { apiRouter } from "../controllers/router";
import { API_PREFIX } from "../config/constants";

export const expressConfig = {
  httpPort: HTTP_PORT,
  env: NODE_ENV,
  apiPrefix: API_PREFIX,
  router: apiRouter,
  appServerHandlers: {
    handle404Error,
    handleErrors,
  },
};
