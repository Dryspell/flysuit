import type { NextApiRequest, NextApiResponse } from 'next'
import { scrape, ScrapeResult } from './scrape'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const subreddits = ['politics', 'worldnews', 'news']

  const getTopArticles = async (subreddit: string) => {
    const links = (
      (await scrape(
        `https://www.reddit.com/r/${subreddit}/`,
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

    const results = await Promise.all(
      links.map((link: string) => scrape(link, 'p'))
    )
    return { [subreddit]: results }
  }
  const articles = await Promise.all(subreddits.map(getTopArticles))

  return res.status(200).json(articles)
}
