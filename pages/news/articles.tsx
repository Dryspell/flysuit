import * as React from 'react'
import { ChakraProvider, Link } from '@chakra-ui/react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
} from '@chakra-ui/react'
import { ScrapeResult } from 'pages/api/cheerio/scrape'
import NextLink from 'next/link'

type Article = { title: string; url: string; text: string[] }

export async function getServerSideProps() {
  const data = await fetch(
    `${process.env.NEXT_APP_URL}/api/cheerio/reddit-scrape?t=today&sort=top`
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

  return { props: { articles } }
}

export default function Page({ articles }: { articles: Article[] }) {
  return (
    <ChakraProvider>
      <Accordion>
        {articles.map((article: Article) => {
          return (
            <AccordionItem key={article.url}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {article.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <NextLink href={article.url} passHref>
                  <Link>{article.url}</Link>
                </NextLink>
                {article.text.map((p) => (
                  <Text key={p}>{p}</Text>
                ))}
              </AccordionPanel>
            </AccordionItem>
          )
        })}
      </Accordion>
    </ChakraProvider>
  )
}
