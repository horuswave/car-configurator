"use client";

import { useEffect, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type BodyColor = {
  name: string;
  color: string;
  metalness: number;
  roughness: number;
};

export const BODY_COLORS: BodyColor[] = [
  { name: "Cyber Red", color: "#cc1a00", metalness: 0.9, roughness: 0.1 },
  { name: "Phantom Black", color: "#0a0a0a", metalness: 0.85, roughness: 0.15 },
  { name: "Arctic White", color: "#f0f2f5", metalness: 0.3, roughness: 0.2 },
  { name: "Solar Yellow", color: "#e6b800", metalness: 0.7, roughness: 0.2 },
  { name: "Ocean Blue", color: "#003d80", metalness: 0.9, roughness: 0.1 },
  { name: "Forest Green", color: "#1a4a1a", metalness: 0.8, roughness: 0.15 },
];

export type EnvMode = "showroom" | "outdoor" | "night";

interface CarModelProps {
  bodyColor: BodyColor;
  headlightsOn: boolean;
  doorsOpen: boolean;
  envMode: EnvMode;
  wheelSpeed?: number;
}

const DOOR_PARTS = ["front door", "back door"];

const WINDOW_MATERIALS = new Set([
  "Material.007",
  "Material.008",
  "Material.009",
  "Material.006",
]);

const TIRE_NAMES = new Set([
  "front-left-tire",
  "front-right-tire",
  "back-left-tire",
  "back-right-tire",
  "Tire",
  "Tire.001",
  "Tire.002",
  "Tire.003",
]);

const BODY_PAINT_NAMES = new Set([
  "Green Car Paint",
  "Body",
  "Paint",
  "Car_Paint",
  "body",
  "paint",
  "Material.001",
  "Material.002",
  "Chassis",
  "Exterior",
]);

// Studio objects to hide in non-showroom modes
const STUDIO_OBJECTS = new Set([
  "Studio Light N1",
  "para brisas",
  "trunk window",
  "Sun",
  "Plane.004",
  "Plane.005",
  "Point.003",
  "Point.004",
  "Point.005",
  "Cube.019",
  // Add more if needed from your Blender outliner
]);

const SCALE = 0.18;
const OFFSET_Z = 4.86 * SCALE;

export default function CarModel({
  bodyColor,
  headlightsOn,
  doorsOpen,
  envMode,
  wheelSpeed = 0,
}: CarModelProps) {
  const { scene } = useGLTF("/car.glb");
  const mirroredScene = useMemo(() => scene.clone(), [scene]);

  const wheelRefs = useRef<THREE.Object3D[]>([]);
  const doorOriginals = useRef<Map<string, THREE.Quaternion>>(new Map());
  const doorAnims = useRef<Map<string, number>>(new Map());

  // Hide studio + collect wheels + doors
  useEffect(() => {
    const processScene = (root: THREE.Group) => {
      root.traverse((obj) => {
        // Hide duplicate doors
        if (["d1.001", "d2", "d3"].includes(obj.name)) {
          obj.visible = false;
        }

        // Hide studio objects when not in showroom
        if (
          STUDIO_OBJECTS.has(obj.name) ||
          obj.name.includes("Studio") ||
          obj.name.includes("Light N")
        ) {
          obj.visible = envMode === "showroom";
        }

        // Collect wheels
        if (obj.name && TIRE_NAMES.has(obj.name)) {
          wheelRefs.current.push(obj);
        }

        // Store door rotations
        if (DOOR_PARTS.includes(obj.name)) {
          const key = `${obj.parent?.uuid || ""}-${obj.name}`;
          if (!doorOriginals.current.has(key)) {
            doorOriginals.current.set(key, obj.quaternion.clone());
            doorAnims.current.set(key, 0);
          }
        }
      });
    };

    wheelRefs.current = [];
    processScene(scene);
    processScene(mirroredScene);
  }, [scene, mirroredScene, envMode]);

  // Body Color
  useEffect(() => {
    const updateColor = (root: THREE.Group) => {
      root.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;

        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];

        mats.forEach((mat) => {
          if (!(mat instanceof THREE.MeshStandardMaterial)) return;

          const matName = mat.name;
          const objNameLower = obj.name.toLowerCase();

          const isCarBody =
            BODY_PAINT_NAMES.has(matName) ||
            BODY_PAINT_NAMES.has(obj.name) ||
            matName.toLowerCase().includes("car paint") ||
            matName.toLowerCase().includes("body") ||
            objNameLower.includes("body") ||
            objNameLower.includes("hood") ||
            objNameLower.includes("door") ||
            objNameLower.includes("fender") ||
            objNameLower.includes("chassis") ||
            objNameLower.includes("exterior") ||
            objNameLower.includes("trunk");

          if (isCarBody) {
            mat.color.set(bodyColor.color);
            mat.metalness = bodyColor.metalness;
            mat.roughness = bodyColor.roughness;
            mat.needsUpdate = true;
          }
        });
      });
    };

    updateColor(scene);
    updateColor(mirroredScene);
  }, [bodyColor, scene, mirroredScene]);

  // Tint Windows
  useEffect(() => {
    const tint = (root: THREE.Group) => {
      root.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;

        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];

        mats.forEach((mat) => {
          if (
            WINDOW_MATERIALS.has(mat.name) &&
            mat instanceof THREE.MeshStandardMaterial
          ) {
            obj.material = new THREE.MeshPhysicalMaterial({
              color: "#0a1118",
              metalness: 0.1,
              roughness: 0.05,
              transmission: 0.85,
              thickness: 0.15,
              envMapIntensity: 1.2,
              ior: 1.45,
              transparent: true,
              opacity: 0.35,
              side: THREE.DoubleSide,
            });
          }
        });
      });
    };

    tint(scene);
    tint(mirroredScene);
  }, [scene, mirroredScene]);

  // Wheel Spinning
  useFrame((_, delta) => {
    if (wheelSpeed === 0) return;

    wheelRefs.current.forEach((wheel, index) => {
      if (!wheel) return;
      const rotationSpeed = delta * wheelSpeed * 8;
      wheel.rotation.x += index % 2 === 0 ? rotationSpeed : -rotationSpeed;
    });
  });

  return (
    <group position={[0, 0, -OFFSET_Z]}>
      <group scale={SCALE}>
        <primitive object={scene} />
      </group>
      <group scale={[-SCALE, SCALE, SCALE]}>
        <primitive object={mirroredScene} />
      </group>

      {/* Fallback wheels */}
      {wheelRefs.current.length === 0 && (
        <group>
          <Wheel position={[-1.8, -0.45, 3.0]} wheelSpeed={wheelSpeed} />
          <Wheel
            position={[1.8, -0.45, 3.0]}
            wheelSpeed={wheelSpeed}
            mirrored
          />
          <Wheel position={[-1.8, -0.45, 1.4]} wheelSpeed={wheelSpeed} />
          <Wheel
            position={[1.8, -0.45, 1.4]}
            wheelSpeed={wheelSpeed}
            mirrored
          />
        </group>
      )}
    </group>
  );
}

function Wheel({
  position,
  wheelSpeed = 0,
  mirrored = false,
}: {
  position: [number, number, number];
  wheelSpeed?: number;
  mirrored?: boolean;
}) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (wheelSpeed > 0 && ref.current) {
      ref.current.rotation.x += delta * wheelSpeed * 6;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      scale={mirrored ? [-1, 1, 1] : [1, 1, 1]}
    >
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.45, 32]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.48, 0.48, 0.42, 32]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.29, 0.29, 0.4, 32]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.4} />
      </mesh>
    </group>
  );
}

useGLTF.preload("/car.glb");
