import type { NextApiRequest, NextApiResponse } from 'next'
const lev = require('js-levenshtein')
const jac = require('jaccard-index')
const jacc = jac()

export const levenshtein = (str1: string, str2: string) => {
  if (!str1 || !str2) {
    return { message: 'Missing input strings' }
  }
  const distance = lev(str1, str2)
  return { metric: 'Levenshtein', str1, str2, distance }
}
export const jaccard = (str1: string, str2: string) => {
  if (!str1 || !str2) {
    return { message: 'Missing input strings' }
  }
  const distance = jacc.index(str1.split(''), str2.split(''))
  return { metric: 'Jaccard', str1, str2, distance }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const str1 = req.query.str1 as string
  const str2 = req.query.str2 as string

  if (!str1 || !str2) {
    return res.status(400).json({
      message: 'Missing input strings, see examples',
      examples: [
        { ...levenshtein('kitten', 'airplane') },
        { ...jaccard('kitten', 'airplane') },
      ],
    })
  }
  if (['levenshtein', 'l'].includes(req.query.metric as string)) {
    return res.status(200).json(levenshtein(str1, str2))
  }
  if (['jaccard', 'j'].includes(req.query.metric as string)) {
    return res.status(200).json(jaccard(str1, str2))
  }
  return res.status(400).json({ message: 'Invalid metric' })
}
