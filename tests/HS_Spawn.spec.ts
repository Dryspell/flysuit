import { HS_Contact } from '@/lib/hubspot'
import { test, expect } from '@playwright/test'

test.skip('Spawn Contacts', async ({ request }) => {
  const response = await request.get(`/api/hubspot/contacts/spawn`)
  expect(response.status()).toBe(200)

  const body: { message: string; data: any } = await response.json()
  expect(body.message).toBe('Success')
  expect(body.data.length).toBe(10)
})
