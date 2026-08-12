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
  settings: "/settings",
} as const;

export const FAMILY_MEMBERS = {
  rafael: {
    id: "rafael",
    name: "Rafael",
    blogsApiPath: "/api/family/rafael/blogs",
  },
  mikhail: {
    id: "mikhail",
    name: "Mikhail",
    blogsApiPath: "/api/family/mikhail/blogs",
  },
  mira: {
    id: "mira",
    name: "Mira",
    blogsApiPath: "/api/family/mira/blogs",
  },
} as const;

export function uniqueRafaelBlog() {
  const suffix = Date.now();

  return {
    title: `Rafael soccer recap ${suffix}`,
    content: `Playwright test blog for Rafael. U12 Glen Waverley training session recap ${suffix}.`,
  };
}

export function uniqueMikhailBlog() {
  const suffix = Date.now();

  return {
    title: `Mikhail basketball recap ${suffix}`,
    content: `Playwright test blog for Mikhail. U10 Glen Waverley training session recap ${suffix}.`,
  };
}

export function uniqueMiraBlog() {
  const suffix = Date.now();

  return {
    title: `Mira soccer recap ${suffix}`,
    content: `Playwright test blog for Mira. U36 Glen Waverley training session recap ${suffix}.`,
  };
}
