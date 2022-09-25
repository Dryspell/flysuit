import { MongoClient } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new MongoClient(process.env.MONGODB_URI as string)
  await client.connect()
  const db = client.db('flysuit')
  console.log((await db.command({ ping: 1 })) && 'Connected to MongoDB')
  const insert = await db
    .collection('articles')
    .insertMany([{ name: 'a' }, { name: 'b' }, { name: 'c' }])
  console.log(insert)

  const find = await db
    .collection('articles')
    .find({ name: { $in: ['a', 'b', 'c'] } })
    .toArray()
  console.log(find)

  const deleteMany = await db
    .collection('articles')
    .deleteMany({ name: { $in: ['a', 'b', 'c'] } })
  console.log(deleteMany)

  await client.close()

  return res.status(200).json({ message: 'success', insert, find, deleteMany })
}
