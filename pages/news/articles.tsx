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
import NextLink from 'next/link'
import React, { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { Article, newsRouter } from '@/server/routers/news'

export default function Page() {
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    const fetchArticles = async () => {
      const articles = trpc.useQuery(['news.articles']).data
      articles && setArticles(articles)
    }
    fetchArticles()
  }, [])

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
