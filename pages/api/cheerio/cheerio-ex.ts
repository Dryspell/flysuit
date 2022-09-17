import cheerio from 'cheerio'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await fetch('https://en.wikipedia.org/wiki/Boston').then(
    (res) => res.text()
  )
  const $ = cheerio.load(response)
  const results = $('p').text()
  console.log(`Received ${results.length} characters of text`)
  return res.status(200).json({ results })
}
