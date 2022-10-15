import type { NextApiRequest, NextApiResponse } from 'next'
import { scrape, ScrapeResult } from './scrape'
import { MongoClient } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const subreddits = [
    'politics',
    // 'worldnews',
    // 'news'
  ]
  const sort = req.query.sort === 'top' ? 'top' : 'hot'
  const t = req.query.t === 'week' ? 'week' : 'today'

  const client = new MongoClient(process.env.MONGODB_URI as string)
  await client.connect()
  const db = client.db('flysuit')
  console.log((await db.command({ ping: 1 })) && 'Connected to MongoDB')

  const getTopArticles = async (subreddit: string) => {
    const links = (
      (await scrape(
        `https://www.reddit.com/r/${subreddit}/${sort}/?t=${t}`,
        'a',
        'href'
      )) as ScrapeResult
    ).results.filter(
      (result) =>
        result !== '/' &&
        !result.includes('goo.gl') &&
        !result.includes('reddit') &&
        !result.includes('/r/') &&
        !result.includes('/t/')
    )

    const findMongoArticles = await db
      .collection('articles')
      .find({ url: { $in: links } })
      .toArray()
    console.log(
      `[${subreddit}] Found ${findMongoArticles.length} articles in MongoDB`
    )

    try {
      const newArticles = (
        await Promise.all(
          links
            .filter(
              (link) =>
                !findMongoArticles.map((article) => article.url).includes(link)
            )
            .map((link: string) => scrape(link, 'p'))
        )
      ).map((result) => {
        if (typeof result !== 'string')
          return {
            subreddit,
            ...result,
          }
      })
      console.log(
        `[${subreddit}] Retrieved ${newArticles.length} new articles from their sources`
      )

      if (newArticles.length) {
        const insertMongoArticles = await db
          .collection('articles')
          .insertMany(newArticles as ScrapeResult[])
        console.log(
          `[${subreddit}] Inserted ${insertMongoArticles.insertedCount} new articles into MongoDB`
        )
      }

      const results = [...findMongoArticles, ...newArticles]

      return { results }
    } catch (err) {
      console.log(err)
      return { results: findMongoArticles }
    }
  }
  const articles = await Promise.all(subreddits.map(getTopArticles))

  await client.close()
  return res.status(200).json(articles)
}
