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
  hobbies: "/about/hobbies",
  sports: "/about/sports",
} as const;

export const LIFESTYLE = {
  hobbies: {
    category: "hobbies" as const,
    path: "/about/hobbies",
    title: "Hobbies",
    blogsApiPath: "/api/lifestyle/hobbies/blogs",
    mediaApiPath: "/api/lifestyle/hobbies/media",
  },
  sports: {
    category: "sports" as const,
    path: "/about/sports",
    title: "Sports",
    blogsApiPath: "/api/lifestyle/sports/blogs",
    mediaApiPath: "/api/lifestyle/sports/media",
  },
  travel: {
    category: "travel" as const,
    path: "/about/travel",
    title: "Travel",
    blogsApiPath: "/api/lifestyle/travel/blogs",
    mediaApiPath: "/api/lifestyle/travel/media",
  },
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

export function uniqueHobbiesBlog() {
  const suffix = Date.now();

  return {
    title: `Hobbies weekend project ${suffix}`,
    content: `Playwright test blog for Hobbies. Creative pursuit recap ${suffix}.`,
    updatedTitle: `Updated hobbies project ${suffix}`,
    updatedContent: `Updated Playwright test blog for Hobbies. Edited creative pursuit recap ${suffix}.`,
  };
}

export function uniqueSportsRafaelBlog() {
  const suffix = Date.now();

  return {
    title: `Sports weekend project ${suffix}`,
    content: `Playwright test blog for Sports. Creative pursuit recap ${suffix}.`,
    updatedTitle: `Updated sports project ${suffix}`,
    updatedContent: `Updated Playwright test blog for Sports. Edited creative pursuit recap ${suffix}.`,
  };
}

export function uniqueTravelRafaelBlog() {
  const suffix = Date.now();

  return {
    title: `Travel weekend project ${suffix}`,
    content: `Playwright test blog for Sports. Creative pursuit recap ${suffix}.`,
    updatedTitle: `Updated sports project ${suffix}`,
    updatedContent: `Updated Playwright test blog for Sports. Edited creative pursuit recap ${suffix}.`,
  };
}


