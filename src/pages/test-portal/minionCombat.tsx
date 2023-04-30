import { Container, Grid, Button, createStyles } from "@mantine/core"
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	ChakraProvider,
	Text,
	Heading,
	Progress,
} from "@chakra-ui/react"
import React from "react"
import {
	MINION_PART_TYPES,
	Minion,
	exampleMinion,
	getInitiative,
	exampleMinion as minion1,
} from "pages/api/minions/schema"
import { rotateArr } from "@/lib/set-utils"
import { faker } from "@faker-js/faker"
import { Event, logEvent } from "@/lib/MinionCombat/utils"
import {
	handleCombat,
	handleDamage,
	handleTargeting,
} from "@/lib/MinionCombat/combat"

const useStyles = createStyles(() => ({
	button: {
		position: "relative",
		transition: "background-color 150ms ease",
	},

	label: {
		position: "relative",
		zIndex: 1,
	},
}))

export default function Page() {
	const { classes, theme } = useStyles()
	const minion1: typeof exampleMinion = JSON.parse(
		JSON.stringify(exampleMinion)
	)
	const minion2: typeof exampleMinion = JSON.parse(
		JSON.stringify(exampleMinion)
	)
	minion1.name = "Albert"
	minion1.id = faker.datatype.uuid()
	minion2.name = "Noah"
	minion2.id = faker.datatype.uuid()
	const [turnCounter, setTurnCounter] = React.useState(0)
	const [minions, setMinions] = React.useState([minion1, minion2])
	const [turnOrder, setTurnOrder] = React.useState(
		minions
			.map((minion) => {
				return { id: minion.id, initiative: getInitiative(minion) }
			})
			.sort((a, b) => a.initiative - b.initiative)
	)
	const [eventLog, setEventLog] = React.useState([] as Event[])
	const [progress, setProgress] = React.useState(minions.map((minion) => 100))
	const eventLogEndRef: any = React.useRef(null)

	const scrollToBottom = (ref: any) => {
		ref.current?.scrollIntoView({ behavior: "smooth" })
	}

	const incrementTurn = (turn: number) => {
		setTurnCounter((previous) => turn + 1)
		setEventLog((previousEvents) => [
			...previousEvents,
			{ type: "turn", eventText: `-------- Turn ${turn} --------` },
		])
		return turn + 1
	}

	React.useEffect(() => {
		scrollToBottom(eventLogEndRef)
	}, [eventLog])

	React.useEffect(() => {
		const progress = minions.map((minion) =>
			minion.status === "dead"
				? 0
				: Math.floor(
						(minion.parts.reduce((acc, cur) => acc + cur.health, 0) /
							minion.parts.reduce((acc, cur) => acc + cur.maxHealth, 0)) *
							100
				  )
		)
		setProgress(progress)
	}, [minions])

	const handleClick = () => {
		console.log("Fight!")
		let turn = turnCounter
		turn = incrementTurn(turn)

		const newMinions: Minion[] = JSON.parse(JSON.stringify(minions)).sort() //[...minions]
		const currentMinion = newMinions.find(
			(minion) => minion.id === turnOrder[turn].id
		)
		if (!currentMinion) throw new Error("Can't Find Current Minion")

		const targetMinion = handleTargeting(currentMinion, newMinions, setEventLog)

		handleCombat(currentMinion, targetMinion, setEventLog)

		const targetMinionLastTurn = turnOrder
			.filter((turn) => turn.id === targetMinion.id)
			.sort((a, b) => b.initiative - a.initiative)[0]

		const initiativeRoll = getInitiative(targetMinion)
		const updatedIniative = {
			id: targetMinion.id,
			initiative: targetMinionLastTurn.initiative + initiativeRoll,
		}
		const updatedTurnOrder = [...turnOrder, updatedIniative].sort(
			(a, b) => a.initiative - b.initiative
		)
		setTurnOrder(updatedTurnOrder)

		logEvent(
			"initiative roll",
			`[${"initiative".toUpperCase()}] ${
				targetMinion.name
			}, whose next turn is at ${
				targetMinionLastTurn.initiative
			}, rolled ${initiativeRoll} for initiative, yielding ${
				updatedIniative.initiative
			} initiative for the following turn`,
			setEventLog
		)

		setMinions(newMinions)
	}

	return (
		<>
			<ChakraProvider>
				<Box h="100%" maxHeight="-webkit-max-content">
					<Container my="md">
						<Button
							fullWidth
							className={classes.button}
							onClick={handleClick}
							color={theme.primaryColor}
							sx={(theme) => ({
								backgroundColor:
									theme.colorScheme === "dark" ? "#5865F2" : "#5865F2",
								"&:hover": {
									backgroundColor:
										theme.colorScheme === "dark"
											? theme.fn.lighten("#5865F2", 0.05)
											: theme.fn.darken("#5865F2", 0.05),
								},
							})}
							// color={"teal"}
						>
							<div className={classes.label}>{"Fight!"}</div>
						</Button>
					</Container>

					<Box my="md" maxHeight="400px" overflowY="scroll">
						<Grid gutter="xl" justify="center">
							{minions.map((minion, index) => (
								<Grid.Col key={index} span={6}>
									<Container>
										<Heading> {`${minion.name}`}</Heading>
										<Progress value={progress[index]} />
										<Accordion allowMultiple>
											{minion
												? minion.parts.map((part, index) => {
														return (
															<AccordionItem key={index}>
																<h2>
																	<AccordionButton>
																		<Box flex="1" textAlign="left">
																			{`${part.name}: ${part.health}/${part.maxHealth}`}
																			<Progress
																				colorScheme={"green"}
																				backgroundColor={"red"}
																				value={Math.max(
																					0,
																					Math.floor(
																						(part.health / part.maxHealth) * 100
																					)
																				)}
																			/>
																			{part.armor?.durability ? (
																				<Progress
																					value={Math.max(
																						0,
																						Math.floor(
																							(part.armor?.durability /
																								part.armor?.maxDurability) *
																								100
																						)
																					)}
																				/>
																			) : null}
																		</Box>
																		<AccordionIcon />
																	</AccordionButton>
																</h2>
																<AccordionPanel pb={4}>
																	{Object.entries(part).map(([e, v], i) =>
																		typeof v === "string" ? (
																			<p key={i}>{`${e}: ${v}`}</p>
																		) : v && typeof v === "object" ? (
																			<>
																				<p key={i}>
																					{`${
																						v?.name && v?.durability
																							? `${v.name}: ${v?.durability}/${v?.maxDurability}`
																							: v.id
																					}`}
																				</p>
																			</>
																		) : null
																	)}
																</AccordionPanel>
															</AccordionItem>
														)
												  })
												: null}
										</Accordion>
									</Container>
								</Grid.Col>
							))}
						</Grid>
					</Box>
					<Box my="md" maxHeight="200px" overflowY="scroll">
						{eventLog.map((event, index) => (
							<Text key={index}>{event.eventText}</Text>
						))}
						<div ref={eventLogEndRef} />
					</Box>
				</Box>
			</ChakraProvider>
		</>
	)
}
