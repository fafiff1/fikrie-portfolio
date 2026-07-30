export const TEST_USER = {
  username: process.env.PLAYWRIGHT_USERNAME ?? "fafiff",
  password: process.env.PLAYWRIGHT_PASSWORD ?? "password",
};

export const ROUTES = {
  home: "/",
  login: "/login",
  about: "/about",
  family: "/family",
  contact: "/contact",
  portfolio: "/portfolio",
  reviews: "/reviews",
} as const;
