"use client";
import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Decal, useTexture } from "@react-three/drei";
import * as THREE from "three";

function MyCustomShirt() {
  const { scene } = useGLTF('/shirt.glb'); // ระบบจะไปหาไฟล์ที่ public/shirt.glb
  const [frontTexture, backTexture] = useTexture([
    '/images/front-logo.png', 
    '/images/back-logo.png'
  ]);

  const shirtGeometry = useMemo(() => {
    let geometry: THREE.BufferGeometry | null = null; 
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !geometry) {
        geometry = (child as THREE.Mesh).geometry;
      }
    });
    return geometry;
  }, [scene]);

  if (!shirtGeometry) return null;

  return (
    <mesh geometry={shirtGeometry} scale={2.5} position={[0, -1.5, 0]}>
      <meshStandardMaterial color="#111111" roughness={0.8} />
      <Decal position={[0, 0.4, 0.2]} rotation={[0, 0, 0]} scale={[0.6, 0.6, 1]} map={frontTexture} />
      <Decal position={[0, 0.3, -0.2]} rotation={[0, Math.PI, 0]} scale={[0.8, 0.8, 1]} map={backTexture} />
    </mesh>
  );
}

export default function Shirt3D() {
  return (
    <div className="absolute inset-0 z-20">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <Suspense fallback={null}>
          <MyCustomShirt />
          <Environment preset="city" />
          <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={15} blur={2} far={4} />
        </Suspense>
        {/* ล็อกให้หมุนเองอย่างเดียว ห้ามลูกค้าจับหมุนเอง */}
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}