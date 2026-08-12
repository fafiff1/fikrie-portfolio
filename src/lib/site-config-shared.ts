export type SiteConfig = {
  contactReceiverEmail: string;
  saveContactMessages: boolean;
  allowRegistration: boolean;
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  contactReceiverEmail: "",
  saveContactMessages: true,
  allowRegistration: true,
};
