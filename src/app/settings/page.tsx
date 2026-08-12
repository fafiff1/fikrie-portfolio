import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-session";
import { readSiteContent } from "@/lib/site-content";
import { readSiteConfig, getEffectiveContactEmail } from "@/lib/site-config";
import { readReviews } from "@/lib/reviews";
import { getPrimaryUser } from "@/lib/users";
import { getEmailProviderStatus, isEmailConfigured } from "@/lib/email";
import SettingsContent from "@/components/SettingsContent";
import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Settings | Fahreza Portfolio",
  description: "Admin settings for portfolio content, images, account, and site configuration.",
};

export default async function SettingsPage() {
  const loggedIn = await isAuthenticated();
  if (!loggedIn) {
    redirect("/login?from=/settings");
  }

  const [initialContent, initialConfig, initialReviews, user, effectiveContactEmail, emailConfigured] =
    await Promise.all([
      readSiteContent(),
      readSiteConfig(),
      readReviews(),
      getPrimaryUser(),
      getEffectiveContactEmail(),
      isEmailConfigured(),
    ]);

  if (!user) {
    redirect("/login?from=/settings");
  }

  return (
    <PageLayout>
      <SettingsContent
        initialContent={initialContent}
        initialConfig={initialConfig}
        initialReviews={initialReviews}
        initialAccount={{
          username: user.username,
          recoveryEmail: user.recoveryEmail ?? "",
          createdAt: user.createdAt,
        }}
        emailProviders={getEmailProviderStatus()}
        effectiveContactEmail={effectiveContactEmail}
        emailConfigured={emailConfigured}
      />
    </PageLayout>
  );
}
