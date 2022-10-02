import { createRandom } from '@/lib/hubspot'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../create-router'

export const hubspotRouter = createRouter().query('spawn', {
  input: z.object({
    entity: z.string(),
    count: z.number(),
  }),
  async resolve({ ctx, input }) {
    const { entity, count } = input

    const random = createRandom(entity, count)
    const randomResults = random.message === 'Success' ? random.data : []

    return randomResults
  },
})
