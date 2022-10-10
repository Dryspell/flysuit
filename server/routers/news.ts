import { createRouter } from '../create-router'
import { ScrapeResult } from 'pages/api/cheerio/scrape'
import { z } from 'zod'

export type Article = { title: string; url: string; text: string[] }

export async function getArticles() {
  console.log(process.env.NEXT_APP_URL)
  const data = await fetch(
    `${process.env.NEXT_APP_URL}/api/cheerio/reddit-scrape?t=today&sort=top`,
    {}
  )
    .then((res) => res.json())
    .then((data) => data)
  console.log(`Received ${data.length} topics`)

  const articles: Article[] = data
    .reduce((acc: ScrapeResult[], topic: { results: ScrapeResult[] }) => {
      // Dedupe articles
      const results = Array.from(
        new Set(topic.results.map((article) => article.url))
      ).map((url) => topic.results.find((article) => article.url === url))
      return [...acc, ...results]
    }, [])
    .filter(
      (article: ScrapeResult) =>
        article.results.length > 1 || article.results?.[0]?.length > 200
    )
    .map((article: ScrapeResult) => {
      const url = article.url
      const domain = article.url.split('.')[1]
      const articleTitle = () => {
        const splitUrl = article.url.split('/')
        let longest = splitUrl[0]
        for (const part of splitUrl) {
          if (part.length > longest.length) {
            // console.log(`part: ${part}, longest: ${longest}`)
            longest = part
          }
        }
        return `${domain}: ${longest.split('.')[0].replace(/-/g, ' ')}`.replace(
          /(\b[a-z](?!\s))/g,
          (x) => x.toUpperCase()
        )
      }
      const title = articleTitle()
      return {
        title,
        url,
        text: article.results,
      }
    })

  return { articles }
}

export const newsRouter = createRouter().query('articles', {
  async resolve() {
    const articles = (await getArticles()).articles
    return articles
  },
})
