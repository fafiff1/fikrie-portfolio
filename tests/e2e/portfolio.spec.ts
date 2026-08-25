import { test, expect } from "../fixtures/auth.fixture";
import { PortfolioPage } from "../pages";
import { uniquePortfolioSection } from "../helpers/test-data";

test.describe("Portfolio sections", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test("adds and deletes a career section", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const section = uniquePortfolioSection();
    const portfolioPage = new PortfolioPage(page);

    await portfolioPage.goto();
    await portfolioPage.addSection(section.company, section.description, section.period, section.role);

    await expect(page.getByRole("article").getByText(section.description)).toBeVisible();

    await portfolioPage.deleteSection(section.company);
    await expect(page.getByRole("heading", { name: section.company })).not.toBeVisible();
  });
});
