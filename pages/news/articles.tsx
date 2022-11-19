import { ChakraProvider, Link } from "@chakra-ui/react"
import {
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
	Box,
	Container,
	Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import React, { useState, useEffect } from "react"
import { trpc } from "@/lib/trpc"

export default function Page() {
	const { isLoading, data: articles } = trpc.useQuery(["news.articles"])

	if (isLoading) {
		return <div>Loading...</div>
	}
	return (
		<ChakraProvider>
			{/* <Container> */}
			<Accordion>
				{articles
					? articles.map((article) => {
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
											<p key={p}>{p}</p>
										))}
									</AccordionPanel>
								</AccordionItem>
							)
					  })
					: null}
			</Accordion>
			{/* </Container> */}
		</ChakraProvider>
	)
}
