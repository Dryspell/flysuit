import React from "react"
import css from "../../styles/Three.module.css"
import { Canvas } from "@react-three/fiber"
import Floor from "@/components/Three/Floor"

// This page is following the tutorial https://dev.to/hnicolus/how-to-use-threejs-in-react-nextjs-4120

export default function Three() {
	return (
		<div className={css.scene}>
			<Canvas
				shadows={true}
				className={css.canvas}
				camera={{ position: [-6, 7, 7] }}
			>
				<ambientLight color={"white"} intensity={0.3} />
				<Floor position={[0, -1, 0]} />
			</Canvas>
		</div>
	)
}
