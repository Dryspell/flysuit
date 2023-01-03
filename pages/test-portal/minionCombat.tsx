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

	const handleTargeting = (currentMinion: Minion, minions: Minion[]) => {
		const target = minions.find((minion) => minion.id !== currentMinion.id)
		if (!target) {
			throw new Error("No target found")
		}

		logEvent(
			"target determined",
			`[${"target determined".toUpperCase()}], ${
				currentMinion.name
			} is targeting ${target.name}!`
		)
		return target
	}

	const calculateDamage = (minion: Minion) => {
		let weaponDamage = 0
		let critChance = 0
		const critModifier = 2
		minion.parts.forEach((part) => {
			if (part.weapon) {
				weaponDamage += part.weapon?.damage
				critChance += part.weapon?.critChance
			}
			if (part?.armor?.modifiers.critChance) {
				critChance += part.armor.modifiers.critChance
			}
			if (part?.shield?.modifiers.critChance) {
				critChance += part.shield.modifiers.critChance
			}
		})
		const didCrit = 100 * Math.random() > critChance
		const damage = Math.floor(
			Math.random() * weaponDamage * (didCrit ? critModifier : 1)
		)
		return { damage, didCrit, critChance }
	}

	const handleDamage = (minion: Minion, target: Minion) => {
		const { damage, didCrit, critChance } = calculateDamage(minion)
		const targetPart =
			target.parts[Math.floor(Math.random() * target.parts.length)]

		const armorHitChance = targetPart.armor
			? Math.floor(
					(targetPart.armor.durability / targetPart.armor.maxDurability) * 100
			  )
			: 0
		const armorHit = targetPart.armor
			? Math.random() * 100 < armorHitChance
			: false

		if (armorHit && targetPart?.armor?.durability) {
			targetPart.armor.durability - damage <= 0
				? (targetPart.armor.durability = 0)
				: (targetPart.armor.durability -= damage)

			logEvent(
				didCrit ? "critical hit" : "damage",
				`[${(didCrit ? "critical hit" : "damage").toUpperCase()}], ${
					minion.name
				} ${didCrit ? "critically hit" : "struck"} ${target.name} in the ${
					targetPart.type
				} for ${damage} damage but was protected by ${
					targetPart.armor.name
				}, has remaining durability ${targetPart.armor.durability} of ${
					targetPart.armor.maxDurability
				}`
			)
			if (armorHit && targetPart.armor.durability <= 0) {
				logEvent(
					"armor break",
					`[${"armor break".toUpperCase()}], ${target.name}'s ${
						targetPart.armor.name
					} has been destroyed!`
				)
			}
		}
		if (!armorHit) {
			targetPart.health -= damage

			const overkillDamage = Math.max(0, -1 * targetPart.health)
			if (overkillDamage) {
				targetPart.health = 0
			}
			logEvent(
				didCrit ? "critical hit" : "damage",
				`[${(didCrit ? "critical hit" : "damage").toUpperCase()}], ${
					minion.name
				} ${didCrit ? "critically hit" : "struck"} ${
					target.name
				} ${` through open armor in the ${targetPart.name} with ${
					100 - armorHitChance
				}% chance! Received ${damage} damage which has ${
					targetPart.health
				} of ${targetPart.maxHealth} health remaining`}`
			)

			if (overkillDamage) {
				const targetTorso = target.parts.find((part) => part.type === "torso")
				if (!targetTorso) throw new Error("Can't Find target Torso")
				const scaledDamage = Math.floor(overkillDamage * 1.6)
				targetTorso.health -= scaledDamage
				logEvent(
					"overkill damage",
					`[${"overkill".toUpperCase()}], ${
						target.name
					} received ${scaledDamage} overkill damage from a ${
						targetPart.name
					} hit, ${targetTorso.name} has ${targetTorso.health} of ${
						targetTorso.maxHealth
					} health remaining`
				)
			}

			if (
				target.parts.find(
					(part) =>
						(part.name === "head" || part.name === "torso") && part.health <= 0
				)
			) {
				target.status = "dead"
				logEvent("death", `${target.name} has died!`)
			}
		}
	}

	const handleCombat = (currentMinion: Minion, targetMinion: Minion) => {
		handleDamage(currentMinion, targetMinion)
	}

	const handleClick = () => {
		console.log("Fight!")
		let turn = turnCounter
		turn = incrementTurn(turn)

		const newMinions: Minion[] = JSON.parse(JSON.stringify(minions)).sort() //[...minions]
		const currentMinion = newMinions.find(
			(minion) => minion.id === turnOrder[turn].id
		)
		if (!currentMinion) throw new Error("Can't Find Current Minion")

		const targetMinion = handleTargeting(currentMinion, newMinions)

		handleCombat(currentMinion, targetMinion)

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
			} rolled ${initiativeRoll} for initiative, yielding ${
				updatedIniative.initiative
			} initiative for the following turn`
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
