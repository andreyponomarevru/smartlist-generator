export const HTTP_PORT = process.env.HTTP_PORT!;
export const NODE_ENV = process.env.NODE_ENV!;
export const SUPPORTED_CODEC = (process.env.SUPPORTED_CODEC! as string)
  .split(",")
  .map((name) => name.toLowerCase());

//
// Postgres
//

export const POSTGRES_USER = process.env.POSTGRES_USER!;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD!;
export const POSTGRES_HOST = process.env.POSTGRES_HOST!;
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE!;
export const POSTGRES_PORT = Number(process.env.POSTGRES_PORT!);
