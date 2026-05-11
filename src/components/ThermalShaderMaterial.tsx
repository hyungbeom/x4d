"use client";

import React, { useRef } from 'react';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ThermalShaderMaterial = shaderMaterial(
    {
        uTexture: null,
        uColorBottom: new THREE.Color("red"),
        uColorTop: new THREE.Color("yellow")
    },

    // --- Vertex Shader ---
    `
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vNormal; 

    void main() {
      vPosition = position;
      vUv = uv;
      vNormal = normalize(normalMatrix * normal); 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

    // --- Fragment Shader ---
    `
    uniform sampler2D uTexture;
    uniform vec3 uColorBottom; 
    uniform vec3 uColorTop;    
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vNormal;

    // 💡 완전히 깨끗하게 복구된 글로벌 표준 3D 노이즈 함수 (Ashima Simplex Noise)
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;

      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

      // Permutations
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      // Gradients
      float n_ = 1.0/7.0; 
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z *ns.z); 

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );  

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      // Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      // 💡 여기가 에러를 뿜었던 범인입니다! 완벽하게 고쳤습니다.
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      
      float noiseValue = snoise(vPosition * 0.15); 
      noiseValue = noiseValue * 0.5 + 0.5; 
      
      vec3 mixColor = mix(uColorBottom, uColorTop, smoothstep(0.0, 1.0, noiseValue));
      vec3 amplifiedColor = mixColor * 2.5; 
      vec3 baseColor = mix(texColor.rgb, amplifiedColor, 0.8);

      vec3 normal = normalize(vNormal);

      // 명암 처리 로직
      vec3 ambient = vec3(0.5);
      vec3 lightDir = normalize(vec3(10.0, 10.0, 5.0));
      
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = vec3(1.0) * diff; 

      vec3 lighting = ambient + diffuse;
      vec3 finalLitColor = baseColor * lighting;

      gl_FragColor = vec4(finalLitColor, 1.0);
      
      #include <colorspace_fragment>
    }
  `
);

extend({ ThermalShaderMaterial });

export function ThermalEffectMaterial({ texture, colorBottom, colorTop }: {
    texture?: THREE.Texture | null,
    colorBottom?: string | THREE.Color,
    colorTop?: string | THREE.Color
}) {
    const materialRef = useRef<any>(null);

    const cBottom = colorBottom ? new THREE.Color(colorBottom) : new THREE.Color("red");
    const cTop = colorTop ? new THREE.Color(colorTop) : new THREE.Color("yellow");

    return (
        // @ts-ignore
        <thermalShaderMaterial
            ref={materialRef}
            uTexture={texture}
            uColorBottom={cBottom}
            uColorTop={cTop}
        />
    );
}