import { Minion } from "pages/api/minions/schema"
import { Event, logEvent } from "./utils"
import React, { SetStateAction } from "react"

const calculateBlockChance = (minion: Minion) => {
	let blockChance = 0
	minion.parts.forEach((part) => {
		if (part.health > 0) {
			if (part.shield && part.shield.durability > 0) {
				blockChance += part.shield?.blockChance
				if (part.shield.modifiers.blockChance)
					blockChance += part.shield.modifiers.blockChance
			}
			if (part?.armor?.modifiers.blockChance && part.armor.durability > 0) {
				blockChance += part.armor.modifiers.blockChance
			}
			if (part?.weapon?.modifiers.blockChance && part.weapon.durability > 0) {
				blockChance += part.weapon.modifiers.blockChance
			}
		}
	})
	// console.log(`Caluclated ${minion.name} Block Chance: ${blockChance}`)
	return blockChance
}

const calculateDamage = (minion: Minion) => {
	let weaponDamage = 0
	let critChance = 0
	const critModifier = 2
	minion.parts.forEach((part) => {
		if (part.health > 0) {
			if (part.weapon && part.weapon.durability > 0) {
				weaponDamage += part.weapon?.damage
				critChance += part.weapon?.critChance
				if (part.weapon.modifiers.critChance)
					critChance += part.weapon.modifiers.critChance
			}
			if (part?.armor?.modifiers.critChance && part.armor.durability > 0) {
				critChance += part.armor.modifiers.critChance
			}
			if (part?.shield?.modifiers.critChance && part.shield.durability > 0) {
				critChance += part.shield.modifiers.critChance
			}
		}
	})
	const didCrit = 100 * Math.random() > critChance
	const damage = Math.floor(
		Math.random() * weaponDamage * (didCrit ? critModifier : 1)
	)
	return { damage, didCrit, critChance }
}

export const handleDamage = (
	minion: Minion,
	target: Minion,
	setEventLog: React.Dispatch<React.SetStateAction<Event[]>>
) => {
	const { damage, didCrit, critChance } = calculateDamage(minion)
	const targetPart =
		target.parts[Math.floor(Math.random() * target.parts.length)]

	const blockChance = calculateBlockChance(target)
	const didBlock = 100 * Math.random() < blockChance

	const targetShield = target.parts.filter(
		(part) => part.shield !== null && part.shield.durability > 0
	)[0]?.shield
	if (didBlock && targetShield) {
		targetShield.durability -= damage
		logEvent(
			"block",
			`[${"blocked".toUpperCase()}] ${
				minion.name
			} attacked for ${damage} damage but ${target.name} blocked with ${
				targetShield.name
			} at ${blockChance}% chance!`,
			setEventLog
		)
		return
	}

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
			}`,
			setEventLog
		)
		if (armorHit && targetPart.armor.durability <= 0) {
			logEvent(
				"armor break",
				`[${"armor break".toUpperCase()}], ${target.name}'s ${
					targetPart.armor.name
				} has been destroyed!`,
				setEventLog
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
			}% chance! Received ${damage} damage to ${targetPart.name}, ${
				targetPart.health
			} of ${targetPart.maxHealth} health remaining`}`,
			setEventLog
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
				} health remaining`,
				setEventLog
			)
		}

		if (
			target.parts.find(
				(part) =>
					(part.name === "head" || part.name === "torso") && part.health <= 0
			)
		) {
			target.status = "dead"
			logEvent("death", `${target.name} has died!`, setEventLog)
		}
	}
}

export const handleTargeting = (
	currentMinion: Minion,
	minions: Minion[],
	setEventLog: React.Dispatch<SetStateAction<Event[]>>
) => {
	const target = minions.find((minion) => minion.id !== currentMinion.id)
	if (!target) {
		throw new Error("No target found")
	}

	logEvent(
		"target determined",
		`[${"target determined".toUpperCase()}], ${
			currentMinion.name
		} is targeting ${target.name}!`,
		setEventLog
	)
	return target
}

export const handleCombat = (
	currentMinion: Minion,
	targetMinion: Minion,
	setEventLog: React.Dispatch<SetStateAction<Event[]>>
) => {
	handleDamage(currentMinion, targetMinion, setEventLog)
}
