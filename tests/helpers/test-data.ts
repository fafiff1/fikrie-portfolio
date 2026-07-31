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

export const FAMILY_MEMBERS = {
  rafael: {
    id: "rafael",
    name: "Rafael",
    blogsApiPath: "/api/family/rafael/blogs",
  },
} as const;

export function uniqueRafaelBlog() {
  const suffix = Date.now();

  return {
    title: `Rafael soccer recap ${suffix}`,
    content: `Playwright test blog for Rafael. U12 Glen Waverley training session recap ${suffix}.`,
  };
}
