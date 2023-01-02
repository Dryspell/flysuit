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
	exampleMinion,
	exampleMinion as minion1,
} from "pages/api/minions/schema"

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

export type Event = {
	type: string
	eventText: string
}

export default function Page() {
	const { classes, theme } = useStyles()
	const minion1: typeof exampleMinion = JSON.parse(
		JSON.stringify(exampleMinion)
	)
	const minion2: typeof exampleMinion = JSON.parse(
		JSON.stringify(exampleMinion)
	)
	minion1.name = "Cameron"
	minion2.name = "Noah"
	const [turnCounter, setTurnCounter] = React.useState(0)
	const [minions, setMinions] = React.useState([minion1, minion2])
	const [eventLog, setEventLog] = React.useState([] as Event[])
	const [progress, setProgress] = React.useState(minions.map((minion) => 100))
	const eventLogEndRef: any = React.useRef(null)

	const logEvent = (type: string, text: string) => {
		const event = {
			type,
			eventText: text,
		}
		setEventLog((previousEvents) => [...previousEvents, event])

		console.log(event.eventText)
	}

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
		const newMinions = [...minions]
		let turn = turnCounter
		newMinions.map((minion) => {
			turn = incrementTurn(turn)

			const minionPart =
				minion.parts[Math.floor(Math.random() * minion.parts.length)]

			const armorHit = minionPart.armor
				? Math.random() <
				  minionPart.armor.durability / minionPart.armor.maxDurability
				: false
			const damage = Math.floor(Math.random() * 10)
			if (armorHit) {
				minionPart?.armor?.durability
					? (minionPart.armor.durability -= damage)
					: null
			} else minionPart.health -= damage
			const overkillDamage = Math.max(0, -1 * minionPart.health)
			if (overkillDamage) {
				minionPart.health = 0
			}
			logEvent(
				"damage",
				`Event: ["damage"], ${minion.name} ${
					armorHit && minionPart?.armor?.name
						? `was protected by ${minionPart.armor.name}, has remaining duribility ${minionPart.armor.durability} of ${minionPart.armor.maxDurability}`
						: `received ${damage} damage to ${minionPart.name} which has ${minionPart.health} health remaining`
				}`
			)
			if (overkillDamage) {
				const minionTorso = minion.parts.find((part) => part.type === "torso")
				if (!minionTorso) throw new Error("Can't Find Minion Torso")
				const scaledDamage = Math.floor(overkillDamage * 1.6)
				minionTorso.health -= scaledDamage
				logEvent(
					"overkill damage",
					`Event: ["overkill"], ${minion.name} received ${scaledDamage} overkill damage to ${minionTorso.name} which has ${minionTorso.health} health remaining`
				)
				if (
					minion.parts.find(
						(part) =>
							(part.name === "head" || part.name === "torso") &&
							part.health <= 0
					)
				) {
					minion.status = "dead"
					logEvent("death", `${minion.name} has died!`)
				}
			}

			return minion
		})
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
																				value={Math.floor(
																					(part.health / part.maxHealth) * 100
																				)}
																			/>
																			{part.armor?.durability ? (
																				<Progress
																					value={Math.floor(
																						(part.armor?.durability /
																							part.armor?.maxDurability) *
																							100
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
