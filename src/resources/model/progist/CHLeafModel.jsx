import React, {useEffect, useRef} from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function CHLeafModel(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/model/progist/CH_Leaf.glb')

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
          <group name="Armature">
            <skinnedMesh
                name="L_hand"
                geometry={nodes.L_hand.geometry}
                material={materials.A1}
                skeleton={nodes.L_hand.skeleton}
            />
            <skinnedMesh
                name="L_Leg"
                geometry={nodes.L_Leg.geometry}
                material={materials.A1}
                skeleton={nodes.L_Leg.skeleton}
            />
            <skinnedMesh
                name="R_Hand001"
                geometry={nodes.R_Hand001.geometry}
                material={materials.A1}
                skeleton={nodes.R_Hand001.skeleton}
            />
            <skinnedMesh
                name="R_leg"
                geometry={nodes.R_leg.geometry}
                material={materials.A1}
                skeleton={nodes.R_leg.skeleton}
            />
            <primitive object={nodes.mixamorigHips} />
          </group>
        </group>
      </group>
  )
}

useGLTF.preload('/model/progist/CH_Leaf.glb')
