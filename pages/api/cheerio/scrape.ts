import cheerio from 'cheerio'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const scrape = async (url: string, selector: string, attribute?: string) => {
    try {
      const response = await fetch(url).then((res) => res.text())
      const $ = cheerio.load(response)
      const results = $(selector)
      console.log(`Received ${results.text().length} characters of text`)

      const resultsArray: any[] = []
      attribute
        ? results.each((i) =>
            resultsArray.push($(results[i]).attr(attribute as string))
          )
        : results.each((i) => resultsArray.push($(results[i]).text()))
      return resultsArray
    } catch (err: any) {
      console.log(`Received invalid inputs: ${url} and ${selector}`)
      return err.message
    }
  }

  const selector = (req.query.selector as string) || 'div'
  const url = req.query.url as string

  const examples = [
    {
      exampleName: 'redditImgs1',
      url: 'https://www.reddit.com/r/pics/',
      selector: 'img[alt="Post image"]',
      attribute: 'src',
    },
    {
      exampleName: 'redditImgs2',
      url: 'https://www.reddit.com/r/pics/search/?q=chicken',
      selector: 'a',
      attribute: 'href',
    },
    {
      exampleName: 'flysuit',
      url: 'https://flysuit.vercel.app/test-portal/mantine-page',
      selector: 'div',
    },
    {
      exampleName: 'wikipedia',
      url: 'https://en.wikipedia.org/wiki/Boston',
      selector: 'p',
    },
  ]
  const getExampleResults = async () => {
    const results: any[] = []
    for (const example of examples) {
      const result = await scrape(
        example.url,
        example.selector,
        example.attribute
      )
      results.push({ ...example, result })
    }
    return results
  }

  const results = url
    ? await scrape(url, selector, req.query.attribute as string)
    : {
        examples: await getExampleResults(),
      }
  return res.status(200).json(results)
}
