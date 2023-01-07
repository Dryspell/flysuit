import React from "react"
import { extend, useThree } from "@react-three/fiber"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

extend({ OrbitControls })

export default function Controls(props: any) {
	const { camera, gl } = useThree()
	return (
		//@ts-ignore
		<orbitControls
			attach={"orbitControls"}
			args={[camera, gl.domElement]}
			{...props}
		/>
	)
}
