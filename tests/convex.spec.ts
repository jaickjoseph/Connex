import { test, expect, Page } from "@playwright/test";

import { menuData } from "./navigation";

async function navigateToProduct(page: Page, product: string, feature: string) {
  await page.locator(".menuItem").getByText("AI Platform").click();

  await page.locator(".subMenuItem").getByText(product).hover();

  const link = await page.locator(".subSubMenu").getByText(feature);

  await link.click();
}

test.describe("Product Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://connex.ai/uk/");
  });

  for (const product of menuData) {
    for (const feature of product.features) {
      test(`should access ${product.name} | ${feature.name} product page`, async ({
        page,
      }) => {
        await navigateToProduct(page, product.name, feature.name);

        await expect(
          page
            .getByRole("heading", {
              name: `${product.name}`,
              level: 3,
            })
            .first()
        ).toBeVisible();
      });
    }
  }
});

async function findBenefitsHeading(page: Page, featureName: string) {
  return page
    .getByRole("heading", {
      name: `Benefits of ${featureName}`,
      level: 2,
    })
    .or(page.getByText(/^Benefits/));
}

test.describe("Benefits Section", () => {
  for (const product of menuData) {
    for (const feature of product.features) {
      test.describe(`check benefits section structure for ${product.name} | ${feature.name}`, () => {
        test.beforeEach(async ({ page }) => {
          await page.goto("https://connex.ai/uk/");

          await navigateToProduct(page, product.name, feature.name);

          // Skip test if URL contains '#' as these pages are under construction
          const url = page.url();

          if (url.includes("#")) {
            test.skip(true, "Benefits section not available");
            return;
          }
        });

        // Verify benefits section heading
        test(`should display correct "Benefits of ${feature.name}" heading`, async ({
          page,
        }) => {
          const heading = await findBenefitsHeading(page, feature.name);

          await expect(heading).toBeVisible();
        });

        // Verify benefits section styling
        test(`should have correct table structure`, async ({ page }) => {
          const heading = await findBenefitsHeading(page, feature.name);

          const container = heading.locator(
            'xpath=ancestor::div[contains(@class, "container")]'
          );
          const row = container.locator(".row").nth(1);

          await expect(row).toBeVisible();
        });

        // Verify number of benefits
        test("should display minimum 3 and maximum 5 benefits", async ({
          page,
        }) => {
          const heading = await findBenefitsHeading(page, feature.name);

          const container = heading.locator(
            'xpath=ancestor::div[contains(@class, "container")]'
          );
          const row = container.locator(".row").nth(1);

          const benefitDivs = row.locator(".col");

          const count = await benefitDivs.count();

          expect(count).toBeGreaterThanOrEqual(3);
          expect(count).toBeLessThanOrEqual(5);
        });
      });
    }
  }
});
