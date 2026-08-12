export type AboutStat = {
  title: string;
  desc: string;
};

export type SiteContent = {
  hero: {
    roleBadge: string;
    name: string;
    headline: string;
    bio: string;
    location: string;
    profileImage: string;
    badgeValue: string;
    badgeLabel: string;
  };
  about: {
    intro: string;
    stats: AboutStat[];
  };
  contact: {
    intro: string;
    phone: string;
    officeName: string;
    addressLines: string[];
    mapsQuery: string;
    socialLinks: {
      linkedin: string;
      github: string;
      twitter: string;
    };
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    brandName: string;
  };
  footer: {
    copyrightName: string;
  };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    roleBadge: "Quality Engineer",
    name: "Fahreza",
    headline: "Building Quality.",
    bio: "Originally from Jakarta, Indonesia, now calling Melbourne home for over 20 years. I ensure software excellence while being a proud husband and father.",
    location: "Based in Melbourne, Australia",
    profileImage: "/profile/fikrie-profile-sketch.png",
    badgeValue: "20+",
    badgeLabel: "Years in Melbourne",
  },
  about: {
    intro:
      "I'm a dedicated Quality Engineer with a passion for delivering flawless software experiences. My journey started in Jakarta, but for over two decades, Melbourne has been my home. When I'm not ensuring software quality, I'm spending time with my beautiful wife Mira and our two boys, Rafael and Mikhail.",
    stats: [
      { title: "Roots", desc: "Jakarta, Indonesia" },
      { title: "Family", desc: "Wife Mira, sons Rafael & Mikhail" },
      { title: "Role", desc: "Quality Engineer" },
      { title: "Experience", desc: "20+ Years in Melbourne" },
    ],
  },
  contact: {
    intro:
      "Whether you have a project in mind or just want to chat about quality engineering, I'd love to hear from you.",
    phone: "0432 000 111",
    officeName: "One Middle Road (OMR)",
    addressLines: [
      "Level 5, 1 Middle Road",
      "Chadstone VIC 3148",
      "Melbourne, Australia",
    ],
    mapsQuery: "1+Middle+Road,+Chadstone,+VIC+3148",
    socialLinks: {
      linkedin: "#",
      github: "#",
      twitter: "#",
    },
  },
  seo: {
    siteTitle: "Fahreza | Quality Engineer Portfolio",
    siteDescription: "Modern portfolio of Fahreza, a Quality Engineer based in Melbourne.",
    brandName: "Fahreza",
  },
  footer: {
    copyrightName: "Fahreza",
  },
};
