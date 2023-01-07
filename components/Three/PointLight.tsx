import React from "react"

export default function PointLight(props: any) {
	return (
		<mesh {...props}>
			<pointLight castShadow={true} />
			<sphereBufferGeometry args={[0.2, 30, 10]} />
			<meshPhongMaterial emissive={"yellow"} />
		</mesh>
	)
}
