import { HttpError } from "../utils/error";

export const GENRES = [
  "2-Step",
  "Garage House",
  "Hip-Hop",
  "Italo House",
  "Latin",
  "Pop",
  "Pop House",
  "R&B",
  "UK Garage",
  "Acid House",
  "Ambient",
  "Balearic",
  "Beatless",
  "Breakbeat",
  "Closer",
  "House",
  "Disco",
  "Downtempo",
  "Dub",
  "Electro",
  "Guitar",
  "Indie",
  "Jungle",
  "Opener",
  "Rock",
  "Psytrance",
  "Sample",
  "Soul",
  "Techno",
  "Trance",
  "Trip-Hop",
  "Vocal",
  "World Music",
  "[Soundtrack]",
] as const;

export const DEFAULT_COVER_URL = ".";

export const DATABASE_ERROR_CODES: {
  [key: string]: { httpStatusCode: number; response: HttpError };
} = {
  "23505": { httpStatusCode: 409, response: new HttpError({ code: "409" }) },
};

// 'as const' allows us to use this array as type
export const HTTP_ERROR_MESSAGES = [
  "Specify either email OR username",
  "Invalid email, username or password",
  "Pending Account. Look for the verification email in your inbox and click the link in that email",
  "The requested page does not exist",
  "You must authenticate to access this resource",
  "You don't have permission to access this resource",
  "Username or email already exists",
  "Confirmation token is invalid",
  "Sorry, this username is already taken",
  "Something went wrong",
] as const;

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
export type HttpErrorNames = typeof HTTP_ERRORS[HttpErrorCodes];
export type HttpErrorMessages = typeof HTTP_ERROR_MESSAGES[number];
