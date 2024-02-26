import {
  HttpErrorCodes,
  HttpErrorNames,
  HttpErrorMessages,
  HTTP_ERRORS,
} from "../config/constants";

export class HttpError extends Error {
  status: HttpErrorCodes;
  // statusText: HttpErrorNames;
  message: string;
  moreInfo?: string;

  constructor({
    code = 500,
    message = "Something went wrong",
    moreInfo = "https://github.com/ponomarevandrey/",
  }: {
    code?: any /*HttpErrorCodes*/;
    message?: string;
    moreInfo?: string;
  }) {
    super();

    this.message = message;
    this.status = code;
    // this.statusText = HTTP_ERRORS[`${code}`];
    this.moreInfo = moreInfo;
  }
}
