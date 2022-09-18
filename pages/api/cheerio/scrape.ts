import cheerio from 'cheerio'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const scrape = async (url: string, selector: string) => {
    try {
      const response = await fetch(url).then((res) => res.text())
      const $ = cheerio.load(response)
      const results = $(selector)
      console.log(`Received ${results.text().length} characters of text`)

      const resultsArray: any[] = []
      results.each((i) => resultsArray.push($(results[i]).text()))
      return resultsArray
    } catch (err: any) {
      console.log(`Received invalid inputs: ${url} and ${selector}`)
      return err.message
    }
  }

  const selector = (req.query.selector as string) || 'div'
  const url = req.query.url as string

  const flysuit = await scrape(
    'https://flysuit.vercel.app/test-portal/mantine-page',
    'div'
  )
  const wikipedia = await scrape('https://en.wikipedia.org/wiki/Boston', 'p')

  const results = url
    ? await scrape(url, selector)
    : {
        flysuit,
        // wikipedia
      }
  return res.status(200).json(results)
}
