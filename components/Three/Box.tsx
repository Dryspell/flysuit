import React from "react"
import { TextureLoader } from "three"
import { useLoader } from "@react-three/fiber"

export default function Box(props: any) {
	const texture = useLoader(TextureLoader, "/catFace.jpg")
	return (
		<mesh {...props} receiveShadow={true} castShadow={true}>
			<boxGeometry />
			<meshPhysicalMaterial map={texture} color="white" />
			{/* <meshPhysicalMaterial color="white" /> */}
		</mesh>
	)
}
