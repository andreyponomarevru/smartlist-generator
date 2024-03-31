import { HttpError } from "../utils/error";

export const API_PREFIX = "/api";

//

export const FILTER_OPERATOR = ["and", "or"];
export const FILTER_CONDITIONS = [
  "is",
  "is not",
  "greater than or equal",
  "less than or equal",
  "contains any",
  "contains all",
  "does not contain all",
  "does not contain any",
];

export const GENRES: ReadonlyArray<{ id: number; name: string }> = [
  { id: 0, name: "[Soundtrack]" },
  { id: 1, name: "2-Step" },
  { id: 2, name: "Acid House" },
  { id: 3, name: "Ambient" },
  { id: 4, name: "Balearic" },
  { id: 5, name: "Beatless" },
  { id: 6, name: "Breakbeat" },
  { id: 7, name: "Closer" },
  { id: 8, name: "Disco" },
  { id: 9, name: "Downtempo" },
  { id: 10, name: "Dub" },
  { id: 11, name: "Electro" },
  { id: 12, name: "Garage House" },
  { id: 13, name: "Hip-Hop" },
  { id: 14, name: "House" },
  { id: 15, name: "Italo House" },
  { id: 16, name: "Jungle" },
  { id: 17, name: "Latin" },
  { id: 18, name: "Opener" },
  { id: 19, name: "Pop" },
  { id: 20, name: "Pop House" },
  { id: 21, name: "Psytrance" },
  { id: 22, name: "R&B" },
  { id: 23, name: "Rock" },
  { id: 24, name: "Soul" },
  { id: 25, name: "Techno" },
  { id: 26, name: "Trance" },
  { id: 27, name: "Trip-Hop" },
  { id: 28, name: "UK Garage" },
  { id: 29, name: "Vocal" },
  { id: 30, name: "World Music" },
];

//

export const HTTP_ERROR_MESSAGES: ReadonlyArray<string> = [
  "The requested page does not exist",
  "Something went wrong",
];
export const HTTP_ERRORS = {
  "400": "BadRequest",
  "401": "Unauthorized",
  "402": "PaymentRequired",
  "403": "Forbidden",
  "404": "NotFound",
  "405": "MethodNotAllowed",
  "406": "NotAcceptable",
  "407": "ProxyAuthenticationRequired",
  "408": "RequestTimeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "LengthRequired",
  "412": "PreconditionFailed",
  "413": "PayloadTooLarge",
  "414": "URITooLong",
  "415": "UnsupportedMediaType",
  "416": "RangeNotSatisfiable",
  "417": "ExpectationFailed",
  "418": "ImATeapot",
  "421": "MisdirectedRequest",
  "422": "UnprocessableEntity",
  "423": "Locked",
  "424": "FailedDependency",
  "425": "UnorderedCollection",
  "426": "UpgradeRequired",
  "428": "PreconditionRequired",
  "429": "TooManyRequests",
  "431": "RequestHeaderFieldsTooLarge",
  "451": "UnavailableForLegalReasons",
  "500": "InternalServerError",
  "501": "NotImplemented",
  "502": "BadGateway",
  "503": "ServiceUnavailable",
  "504": "GatewayTimeout",
  "505": "HTTPVersionNotSupported",
  "506": "VariantAlsoNegotiates",
  "507": "InsufficientStorage",
  "508": "LoopDetected",
  "509": "BandwidthLimitExceeded",
  "510": "NotExtended",
  "511": "NetworkAuthenticationRequired",
} as const;
export type HttpErrorCodes = keyof typeof HTTP_ERRORS;
export type HttpErrorNames = (typeof HTTP_ERRORS)[HttpErrorCodes];
export type HttpErrorMessages = (typeof HTTP_ERROR_MESSAGES)[number];

//

export const DATABASE_ERROR_CODES: {
  [key: string]: { httpStatusCode: number; response: HttpError };
} = {
  "23505": { httpStatusCode: 409, response: new HttpError({ code: "409" }) },
};
