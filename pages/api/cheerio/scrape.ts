import cheerio from 'cheerio'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Url } from 'url'

export type ScrapeResult = {
  url: string
  selector: string
  attribute?: string
  results: string[]
}

export const scrape = async (
  url: string,
  selector: string,
  attribute?: string
): Promise<ScrapeResult | string> => {
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
      : results.each((i) => {
          const text = $(results[i]).text()
          text !== '' && text !== ' ' && resultsArray.push(text)
        })
    return { url, selector, attribute, results: resultsArray }
  } catch (err: any) {
    console.log(`Received invalid inputs: ${url} and ${selector}`)
    return err.message
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    {
      exampleName: 'news article',
      url: 'https://www.cnn.com/2022/10/09/europe/russia-draft-dodgers-kazakhstan-intl-hnk/index.html',
      selector: 'h1',
    },
  ]
  const getExampleResults = async () => {
    const results = await Promise.all(
      examples.map((example) =>
        scrape(example.url, example.selector, example.attribute)
      )
    )
    return results
  }

  const results = url
    ? await scrape(url, selector, req.query.attribute as string)
    : {
        examples: await getExampleResults(),
      }
  return res.status(200).json(results)
}
