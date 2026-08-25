export type PortfolioSectionId = string;

export const PORTFOLIO_SECTION_IDS = [
  "syncsoft",
  "telstra-thealth",
  "enett",
  "dws",
  "kmart",
] as const;

const SECTION_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PortfolioImage = {
  id: string;
  src: string;
  caption?: string;
};

export type PortfolioClient = {
  id: string;
  name: string;
  description: string;
};

export type PortfolioSection = {
  id: PortfolioSectionId;
  period: string;
  company: string;
  role?: string;
  description: string;
  images: PortfolioImage[];
  clients?: PortfolioClient[];
};

export function isPortfolioSectionId(value: string): value is PortfolioSectionId {
  return value.length >= 2 && value.length <= 80 && SECTION_ID_PATTERN.test(value);
}

export function createPortfolioSectionId(company: string): PortfolioSectionId {
  const slug =
    company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "section";

  return `${slug}-${Date.now()}`;
}

export const DEFAULT_PORTFOLIO_SECTIONS: PortfolioSection[] = [
  {
    id: "syncsoft",
    period: "2012 – 2015",
    company: "Syncsoft Pty Ltd",
    role: "Quality Engineer",
    description:
      "Started my quality engineering career at Syncsoft, building foundational skills in manual and automated testing across enterprise software projects.",
    images: [],
  },
  {
    id: "telstra-thealth",
    period: "2015 – 2018",
    company: "Telstra / THealth",
    role: "Quality Engineer",
    description:
      "Delivered quality assurance for Telstra's digital health initiatives, ensuring reliable healthcare technology solutions for patients and providers.",
    images: [],
  },
  {
    id: "enett",
    period: "",
    company: "Enett Pty Ltd",
    role: "Quality Engineer",
    description:
      "Led testing efforts for Enett's B2B payment solution platform, validating secure financial transactions and payment gateway integrations.",
    images: [],
  },
  {
    id: "dws",
    period: "",
    company: "DWS",
    role: "Senior Quality Engineer",
    description:
      "Provided senior quality engineering expertise across multiple enterprise clients, driving test automation strategies and quality standards.",
    images: [],
    clients: [
      {
        id: "vlrs",
        name: "VLRS",
        description:
          "Delivered comprehensive QA for VLRS systems, ensuring regulatory compliance and system reliability.",
      },
      {
        id: "united-energy",
        name: "United Energy",
        description:
          "Led quality assurance for United Energy's digital platforms, focusing on performance and integration testing.",
      },
      {
        id: "nab",
        name: "NAB",
        description:
          "Supported NAB's banking technology initiatives with rigorous test automation and quality governance.",
      },
    ],
  },
  {
    id: "kmart",
    period: "",
    company: "Kmart Group",
    role: "Senior Quality Engineer",
    description:
      "Currently ensuring quality across Kmart Group's retail technology ecosystem, from e-commerce platforms to in-store systems.",
    images: [],
  },
];
