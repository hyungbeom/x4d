import React, {useEffect, useRef} from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function CHWaterModel(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/model/progist/CH_Water.glb')
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
              name="CH_Water"
              castShadow
              receiveShadow
              geometry={nodes.CH_Water.geometry}
              material={materials.A1}
              position={[0.227, -15.034, -0.154]}
              rotation={[0, -0.654, 0]}
          />
        </group>
      </group>
  )
}

useGLTF.preload('/model/progist/CH_Water.glb')
