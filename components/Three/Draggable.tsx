import React, { useEffect, useRef, useState } from "react"
import { extend, useThree } from "@react-three/fiber"
import { DragControls } from "three/examples/jsm/controls/DragControls"

extend({ DragControls })

export default function Draggable(props: any) {
	const groupRef = useRef<any>()
	const controlsRef = useRef<any>()
	const { camera, gl, scene } = useThree()
	const [objects, setObjects] = useState<any>()

	useEffect(() => {
		groupRef.current && setObjects(groupRef.current.children)
	}, [groupRef])

	useEffect(() => {
		controlsRef.current &&
			controlsRef.current.addEventListener("hoveron", () => {
				//@ts-ignore
				scene.orbitControls.enabled = false
			})
		controlsRef.current &&
			controlsRef.current.addEventListener("hoveroff", () => {
				//@ts-ignore
				scene.orbitControls.enabled = true
			})
	}, [objects])

	return (
		<group ref={groupRef}>
			<dragControls ref={controlsRef} args={[objects, camera, gl.domElement]} />
			{props.children}
		</group>
	)
}
