"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Grid,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import CarModel, { BodyColor, EnvMode } from "./CarModel";

interface SceneProps {
  bodyColor: BodyColor;
  headlightsOn: boolean;
  envMode: EnvMode;
}

function Lights({
  envMode,
  headlightsOn,
}: {
  envMode: EnvMode;
  headlightsOn: boolean;
}) {
  if (envMode === "showroom") {
    return (
      <>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.8}
          castShadow
          color="#ffffff"
        />
        <directionalLight
          position={[-5, 4, -3]}
          intensity={0.5}
          color="#aaccff"
        />
        {headlightsOn && (
          <>
            <spotLight
              position={[0.8, 0.2, 2.5]}
              angle={0.35}
              penumbra={0.5}
              intensity={10}
              color="#ffffcc"
              castShadow
            />
            <spotLight
              position={[-0.8, 0.2, 2.5]}
              angle={0.35}
              penumbra={0.5}
              intensity={10}
              color="#ffffcc"
              castShadow
            />
          </>
        )}
      </>
    );
  }
  if (envMode === "outdoor") {
    return (
      <>
        <ambientLight intensity={0.8} color="#ffeedd" />
        <directionalLight
          position={[10, 15, 5]}
          intensity={2.5}
          castShadow
          color="#ffeecc"
        />
        <directionalLight
          position={[-5, 3, -8]}
          intensity={0.3}
          color="#88aaff"
        />
        {headlightsOn && (
          <>
            <spotLight
              position={[0.8, 0.2, 2.5]}
              angle={0.35}
              penumbra={0.5}
              intensity={6}
              color="#ffffcc"
              castShadow
            />
            <spotLight
              position={[-0.8, 0.2, 2.5]}
              angle={0.35}
              penumbra={0.5}
              intensity={6}
              color="#ffffcc"
              castShadow
            />
          </>
        )}
      </>
    );
  }
  return (
    <>
      <ambientLight intensity={0.05} color="#0a1a2a" />
      <pointLight position={[0, 6, 0]} intensity={0.2} color="#2244aa" />
      <pointLight position={[5, 2, 4]} intensity={0.6} color="#ff6600" />
      <pointLight position={[-5, 2, -4]} intensity={0.6} color="#0055ff" />
      {headlightsOn && (
        <>
          <spotLight
            position={[0.8, 0.2, 2.5]}
            angle={0.3}
            penumbra={0.3}
            intensity={20}
            color="#ffffcc"
            castShadow
            distance={20}
          />
          <spotLight
            position={[-0.8, 0.2, 2.5]}
            angle={0.3}
            penumbra={0.3}
            intensity={20}
            color="#ffffcc"
            castShadow
            distance={20}
          />
        </>
      )}
    </>
  );
}

function Floor({ envMode }: { envMode: EnvMode }) {
  if (envMode === "showroom") {
    return (
      <>
        {/* Studio Floor - Confined size */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.01, 0]}
          receiveShadow
        >
          <planeGeometry args={[25, 25]} />
          <meshStandardMaterial
            color="#111318"
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>

        {/* Studio Grid - Bounded, no infinite extension */}
        <Grid
          position={[0, -0.005, 0]}
          args={[20, 20]} // Reduced size
          cellSize={1}
          cellThickness={0.6}
          cellColor="#00d4ff"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#003d50"
          fadeDistance={18}
          fadeStrength={1.5}
          // infiniteGrid removed
        />
      </>
    );
  }

  if (envMode === "outdoor") {
    return (
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#4a4540" roughness={0.95} metalness={0} />
      </mesh>
    );
  }

  // Night mode
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
    >
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#050810" metalness={0.95} roughness={0.04} />
    </mesh>
  );
}

const BG_COLORS = {
  showroom: "#0d1117",
  outdoor: "#87CEEB",
  night: "#000008",
};

export default function Scene({
  bodyColor,
  headlightsOn,
  envMode,
}: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [3.5, 1.5, 3.5], fov: 45 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: envMode === "night" ? 0.35 : 1.0,
      }}
      style={{ width: "100%", height: "100%", background: BG_COLORS[envMode] }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={[BG_COLORS[envMode]]} />
        <Lights envMode={envMode} headlightsOn={headlightsOn} />
        <Environment
          preset={
            envMode === "outdoor"
              ? "dawn"
              : envMode === "night"
                ? "night"
                : "warehouse"
          }
          background={false}
        />
        <Floor envMode={envMode} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={12}
          blur={2}
          far={4}
        />
        <CarModel
          bodyColor={bodyColor}
          headlightsOn={headlightsOn}
          envMode={envMode}
        />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 0.5, 0]}
        />
      </Suspense>
    </Canvas>
  );
}
