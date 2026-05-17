import React, { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function CHAirModel(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/model/progist/CH_Air.glb')
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const clipName = animations[0]?.name ?? Object.keys(actions)[0]
    if (!clipName) return

    const action = actions[clipName]
    if (!action) return

    action.reset().fadeIn(0.2).play()

    return () => {
      action.fadeOut(0.5)
    }
  }, [actions, animations])


  return (
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <mesh
              name="CH_Air"
              castShadow
              receiveShadow
              geometry={nodes.CH_Air.geometry}
              material={materials.A1}
          />
        </group>
      </group>
  )
}

useGLTF.preload('/model/progist/CH_Air.glb')
