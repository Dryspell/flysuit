import { test, expect } from '@playwright/test'

test('Spawn API', async ({ page }) => {
  const response = await page.request.get(`/api/hubspot/contacts/spawn`)
  expect(response.status()).toBe(200)

  const body: { message: string; data: any } = await response.json()
  expect(body.message).toBe('Success') //@ts-ignore
  expect(body.data.length).toBe(10)
})
