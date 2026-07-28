export const SESSION_COOKIE = "portfolio_session";
export const SESSION_VALUE = "authenticated";

export const VALID_USERNAME = "fafiff";
export const VALID_PASSWORD = "password";

export function isValidCredentials(username: string, password: string): boolean {
  return username === VALID_USERNAME && password === VALID_PASSWORD;
}
