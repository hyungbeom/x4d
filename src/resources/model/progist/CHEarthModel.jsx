import React, {useEffect, useRef} from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function CHEarthModel(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/model/progist/CH_Earth.glb')
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
          <group name="Armature" rotation={[Math.PI / 2, 0, 0]}>
            <skinnedMesh
                name="CH_Earth_A"
                geometry={nodes.CH_Earth_A.geometry}
                material={materials.A1}
                skeleton={nodes.CH_Earth_A.skeleton}
            />
            <skinnedMesh
                name="CH_Earth_body"
                geometry={nodes.CH_Earth_body.geometry}
                material={materials.A1}
                skeleton={nodes.CH_Earth_body.skeleton}
            />
            <primitive object={nodes.mixamorigHips} />
          </group>
        </group>
      </group>
  )
}

useGLTF.preload('/model/progist/CH_Earth.glb')
