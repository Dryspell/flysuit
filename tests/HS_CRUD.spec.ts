import { test, expect } from '@playwright/test'

test('Spawn Contacts', async ({ page }) => {
  const response = await page.request.get(`/api/hubspot/contacts/spawn`)
  expect(response.status()).toBe(200)

  const body: { message: string; data: any } = await response.json()
  expect(body.message).toBe('Success') //@ts-ignore
  expect(body.data.length).toBe(10)
})

test('Search Contacts', async ({ page }) => {
  const response = await page.request.post(
    `/api/hubspot/contacts/search?bearer_token=${process.env.HS_PRIVATE_APP_KEY}&limit=10`,
    {
      data: {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'HAS_PROPERTY',
              },
            ],
          },
        ],
      },
    }
  )
  expect(response.status()).toBe(200)

  const body: { message: string; data: any } = await response.json()
  expect(body.message).toBe('Success') //@ts-ignore
  expect(body.data.length).not.toBe(0)
})

// test('Update Contacts', async ({ page }) => {
//   const response = await page.request.post(
//     `/api/hubspot/contacts/update?bearer_token=${process.env.HS_PRIVATE_APP_KEY}`,
//     {}
//   )
// })

// test('Delete Contacts', async ({ page }) => {
//   const response = await page.request.post(
//     `/api/hubspot/contacts/delete?bearer_token=${process.env.HS_PRIVATE_APP_KEY}`,
//     {}
//   )
// })
