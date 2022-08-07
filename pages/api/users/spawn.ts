import type { NextApiRequest, NextApiResponse } from 'next'
import { faker } from '@faker-js/faker'

export type User = {
  userId: string
  username: string
  email: string
  avatar: string
  password: string
  birthdate: Date
  registeredAt: Date
}

export function createRandomUser(): User {
  return {
    userId: faker.datatype.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const USERS: User[] = []
  Array.from({ length: 10 }).forEach(() => {
    USERS.push(createRandomUser())
  })

  if (req.method === 'GET') {
    return res.status(200).json({ message: `Success`, data: { USERS } })
  }

  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
