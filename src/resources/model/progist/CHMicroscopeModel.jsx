import React, {useEffect, useRef} from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function CHMicroscopeModel(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/model/progist/CH_Microscope.glb')
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
              name="CH_Microscope"
              castShadow
              receiveShadow
              geometry={nodes.CH_Microscope.geometry}
              material={materials.A1}>
            <mesh
                name="Head"
                castShadow
                receiveShadow
                geometry={nodes.Head.geometry}
                material={materials.A1}
                position={[0, 31.757, -7.332]}>
              <mesh
                  name="Group_Lens_Body"
                  castShadow
                  receiveShadow
                  geometry={nodes.Group_Lens_Body.geometry}
                  material={materials.A1}
                  position={[-0.029, -8.957, 9.104]}
                  rotation={[Math.PI / 4, 0, 0]}>
                <mesh
                    name="Group_Lens"
                    castShadow
                    receiveShadow
                    geometry={nodes.Group_Lens.geometry}
                    material={materials.A1}
                />
              </mesh>
              <mesh
                  name="Lens"
                  castShadow
                  receiveShadow
                  geometry={nodes.Lens.geometry}
                  material={materials.A1}
                  position={[-0.051, 4.772, 6.827]}
                  rotation={[0, -0.011, 0]}
              />
            </mesh>
          </mesh>
        </group>
      </group>
  )
}

useGLTF.preload('/model/progist/CH_Microscope.glb')
