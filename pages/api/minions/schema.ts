import { faker } from "@faker-js/faker"
import { randomUUID } from "crypto"
import { NextApiRequest, NextApiResponse } from "next"

export type Minion = {
	id: string
	name: string
	status: "alive" | "dead"
	parts: MinionPart[]
}
export type MinionPartTypes = {
	type: "head" | "torso" | "leg" | "arm" | "hand" | "foot"
}
export const MINION_PART_TYPES: string[] = [
	"head",
	"torso",
	"leg",
	"arm",
	"hand",
	"foot",
]

export type MinionPart = {
	id: string
	name: string
	type: "head" | "torso" | "leg" | "arm" | "hand" | "foot"
	weapon: MinionWeapon | null
	shield: MinionShield | null
	armor: MinionArmor | null
	health: number
	maxHealth: number
}
export type MinionWeapon = {
	id: string
	name: string
	damage: number
	durability: number
	maxDurability: number
	minRange: number
	maxRange: number
	critChance: number
	modifiers: { [key: string]: number }
}
export type MinionArmor = {
	id: string
	name: string
	type: "head" | "torso" | "leg" | "arm" | "hand" | "foot"
	defense: number
	durability: number
	maxDurability: number
	modifiers: { [key: string]: number }
}
export default async function schema(
	req: NextApiRequest,
	res: NextApiResponse
) {
	return res.status(200).json({ exampleMinion })
}

export const materialMutliplier = (
	material: "cloth" | "leather" | "copper" | "iron" | "wood" = "cloth"
) => {
	const materialMultiplier = {
		wood: 1,
		cloth: 1,
		leather: 1.4,
		copper: 1.9,
		iron: 2.5,
	}
	return materialMultiplier[material || "cloth"]
}

export const armorDurabilityDefaults = (
	type: "head" | "torso" | "leg" | "arm" | "hand" | "foot"
) => {
	const armorDurabilityDefaults = {
		head: 10,
		torso: 30,
		leg: 20,
		arm: 20,
		hand: 10,
		foot: 10,
	}
	return armorDurabilityDefaults[type]
}

const armorDefenseDefaults = (
	type: "head" | "torso" | "leg" | "arm" | "hand" | "foot"
) => {
	const armorDefenseDefaults = {
		head: 1,
		torso: 3,
		leg: 2,
		arm: 2,
		hand: 1,
		foot: 1,
	}
	return armorDefenseDefaults[type]
}

export const armorDefault = (
	type: "head" | "torso" | "leg" | "arm" | "hand" | "foot",
	material: "cloth" | "leather" | "copper" | "iron" = "cloth"
) => {
	const armorName =
		type === "head"
			? "cap"
			: type === "torso"
			? "shirt"
			: type === "leg"
			? "pants"
			: type === "arm"
			? "sleeve"
			: type === "hand"
			? "glove"
			: type === "foot"
			? "boot"
			: "armor"
	const armor: MinionArmor = {
		id: faker.datatype.uuid(),
		name: `${material} ${armorName}`,
		type,
		defense: Math.floor(
			armorDefenseDefaults(type) * materialMutliplier(material)
		),
		durability: Math.floor(
			armorDurabilityDefaults(type) * materialMutliplier(material)
		),
		maxDurability: Math.floor(
			armorDurabilityDefaults(type) * materialMutliplier(material)
		),
		modifiers: {},
	}
	return armor
}

export const weaponDefault = (
	weaponType: "sword" | "mace" | "dagger" | "bow",
	material: "wood" | "copper" | "iron"
) => {
	const defaultDamage = {
		sword: 10,
		mace: 10,
		dagger: 10,
		bow: 10,
	}
	const defaultDurability = {
		sword: 20,
		mace: 20,
		dagger: 15,
		bow: 20,
	}
	const defaultCritChance = {
		sword: 10,
		mace: 2,
		dagger: 15,
		bow: 12,
	}

	const weapon: MinionWeapon = {
		id: faker.datatype.uuid(),
		name: `${material} ${weaponType}`,
		damage: defaultDamage[weaponType],
		durability: defaultDurability[weaponType] * materialMutliplier(material),
		maxDurability: defaultDurability[weaponType] * materialMutliplier(material),
		minRange: 1,
		maxRange: weaponType === "bow" ? 5 : 1,
		critChance: defaultCritChance[weaponType],
		modifiers: {},
	}
	return weapon
}

export type MinionShield = {
	id: string
	name: string
	durability: number
	maxDurability: number
	blockChance: number
	modifiers: { [key: string]: number }
}

export const shieldDefault = (
	shieldType: "buckler" | "kite shield",
	material: "wood" | "copper" | "iron"
) => {
	const defaultBlockChance = {
		buckler: 10,
		"kite shield": 20,
	}
	const defaultDurability = {
		buckler: 20,
		"kite shield": 20,
	}

	const shield: MinionShield = {
		id: faker.datatype.uuid(),
		name: `${material} ${shieldType}`,
		durability: defaultDurability[shieldType],
		maxDurability: defaultDurability[shieldType],
		blockChance: defaultBlockChance[shieldType],
		modifiers: {},
	}
	return shield
}

export const getInitiative = (minion: Minion) => {
	const initiativePerPart = { total: 0, maxTotal: 0 }
	minion.parts.forEach((part) => {
		if (part.type === "leg") {
			initiativePerPart.total = initiativePerPart.total + part.health
			initiativePerPart.maxTotal = initiativePerPart.maxTotal + part.maxHealth
		}
	})
	const initiative =
		100 -
		Math.floor(99 * (initiativePerPart.total / initiativePerPart.maxTotal))
	// console.log(`Calculated initiative for ${minion.name} as ${initiative}`)
	return initiative
}

export const exampleMinion: Minion = {
	id: "1",
	name: "FrankTheMinion",
	status: "alive",
	parts: [
		{
			id: "1",
			type: "head",
			name: "head",
			weapon: null,
			shield: null,
			armor: armorDefault("head"),
			health: 20,
			maxHealth: 20,
		},
		{
			id: "2",
			type: "torso",
			name: "torso",
			weapon: null,
			shield: null,
			armor: armorDefault("torso"),
			health: 60,
			maxHealth: 60,
		},
		{
			id: "3",
			type: "leg",
			name: "left leg",
			weapon: null,
			shield: null,
			armor: armorDefault("leg"),
			health: 25,
			maxHealth: 25,
		},
		{
			id: "4",
			type: "leg",
			name: "right leg",
			weapon: null,
			shield: null,
			armor: armorDefault("leg"),
			health: 25,
			maxHealth: 25,
		},
		{
			id: "5",
			type: "arm",
			name: "left arm",
			weapon: null,
			shield: shieldDefault("buckler", "wood"),
			armor: armorDefault("arm"),
			health: 17,
			maxHealth: 17,
		},
		{
			id: "6",
			type: "arm",
			name: "right arm",
			weapon: weaponDefault("sword", "wood"),
			shield: null,
			armor: armorDefault("arm"),
			health: 17,
			maxHealth: 17,
		},
		{
			id: "7",
			type: "hand",
			name: "left hand",
			weapon: null,
			shield: null,
			armor: armorDefault("hand"),
			health: 10,
			maxHealth: 10,
		},
		{
			id: "8",
			type: "hand",
			name: "right hand",
			weapon: null,
			shield: null,
			armor: armorDefault("hand"),
			health: 10,
			maxHealth: 10,
		},
		{
			id: "9",
			type: "foot",
			name: "left foot",
			weapon: null,
			shield: null,
			armor: armorDefault("foot"),
			health: 10,
			maxHealth: 10,
		},
		{
			id: "10",
			type: "foot",
			name: "right foot",
			weapon: null,
			shield: null,
			armor: armorDefault("foot"),
			health: 10,
			maxHealth: 10,
		},
	],
}
