import React, { Suspense } from "react"
import css from "../../styles/Three.module.css"
import { Canvas } from "@react-three/fiber"
import Floor from "@/components/Three/Floor"
import PointLight from "@/components/Three/PointLight"
import Box from "@/components/Three/Box"
import OrbitControls from "@/components/Three/OrbitControls"
import Draggable from "@/components/Three/Draggable"

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
				<PointLight position={[0, 3, 0]} />
				<Draggable>
					<Suspense fallback={null}>
						<Box rotateX={3} rotateY={0.2} />
					</Suspense>
				</Draggable>
				<OrbitControls />
				<Floor position={[0, -1, 0]} />
			</Canvas>
		</div>
	)
}
