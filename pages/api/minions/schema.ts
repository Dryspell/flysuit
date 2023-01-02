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
	range: number
}
export type MinionArmor = {
	id: string
	name: string
	type: "head" | "torso" | "leg" | "arm" | "hand" | "foot"
	defense: number
	durability: number
	maxDurability: number
}
export default async function schema(
	req: NextApiRequest,
	res: NextApiResponse
) {
	return res.status(200).json({ exampleMinion })
}

export const materialMutliplier = (
	material: "cloth" | "leather" | "copper" | "iron" = "cloth"
) => {
	const materialMultiplier = {
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
		name: armorName,
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
	}
	return armor
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
			armor: armorDefault("head"),
			health: 20,
			maxHealth: 20,
		},
		{
			id: "2",
			type: "torso",
			name: "torso",
			weapon: null,
			armor: armorDefault("torso"),
			health: 60,
			maxHealth: 60,
		},
		{
			id: "3",
			type: "leg",
			name: "left leg",
			weapon: null,
			armor: armorDefault("leg"),
			health: 25,
			maxHealth: 25,
		},
		{
			id: "4",
			type: "leg",
			name: "right leg",
			weapon: null,
			armor: armorDefault("leg"),
			health: 25,
			maxHealth: 25,
		},
		{
			id: "5",
			type: "arm",
			name: "left arm",
			weapon: null,
			armor: armorDefault("arm"),
			health: 17,
			maxHealth: 17,
		},
		{
			id: "6",
			type: "arm",
			name: "right arm",
			weapon: null,
			armor: armorDefault("arm"),
			health: 17,
			maxHealth: 17,
		},
		{
			id: "7",
			type: "hand",
			name: "left hand",
			weapon: null,
			armor: armorDefault("hand"),
			health: 10,
			maxHealth: 10,
		},
		{
			id: "8",
			type: "hand",
			name: "right hand",
			weapon: null,
			armor: armorDefault("hand"),
			health: 10,
			maxHealth: 10,
		},
		{
			id: "9",
			type: "foot",
			name: "left foot",
			weapon: null,
			armor: armorDefault("foot"),
			health: 10,
			maxHealth: 10,
		},
		{
			id: "10",
			type: "foot",
			name: "right foot",
			weapon: null,
			armor: armorDefault("foot"),
			health: 10,
			maxHealth: 10,
		},
	],
}
