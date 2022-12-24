import { test, expect } from "@playwright/test"

test("ping", async ({ page }) => {
	const response = await page.request.get(`/api/ping`)
	expect(response.status()).toBe(200)
})
