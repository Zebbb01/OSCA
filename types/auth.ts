export interface AuthError extends Error {
  code: string;
  statusCode: number;
}