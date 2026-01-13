'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'

// ============================================================
// PARÂMETROS
// ============================================================
const COLD_AISLE = {
  width: 6.0,
  depth: 3.5,
  height: 2.4,
}

const SHELF = {
  length: 3.0,
  height: 2.4,
  depth: 0.6,
}

const ASIC = {
  width: 0.195,
  height: 0.29,
  depth: 0.40,
}

// ============================================================
// CORES
// ============================================================
const COLORS = {
  wall: '#4a5a6a',
  floor: '#3a4a5a',
  ceiling: '#5a6a7a',
  honeycomb: '#8B6914',
  honeycombFrame: '#5a4a3a',
  metal: '#718096',
  asicBody: '#7a8599',
  asicFan: '#1a1a1a',
  plywood: '#a0865a',
  coldAir: '#22c55e',
}

// ============================================================
// COMPONENTE: Colmeia Evaporativa
// ============================================================
function Colmeia({ position }: { position: [number, number, number] }) {
  const width = COLD_AISLE.width - 0.4
  const height = COLD_AISLE.height - 0.3
  
  return (
    <group position={position}>
      {/* Moldura */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.05]} />
        <meshStandardMaterial color={COLORS.honeycombFrame} />
      </mesh>
      {/* Painel */}
      <mesh>
        <boxGeometry args={[width, height, 0.15]} />
        <meshStandardMaterial color={COLORS.honeycomb} transparent opacity={0.9} />
      </mesh>
      {/* Linhas verticais */}
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[-width/2 + 0.05 + i * 0.1, 0, 0.08]}>
          <boxGeometry args={[0.003, height, 0.002]} />
          <meshStandardMaterial color="#5a4a14" />
        </mesh>
      ))}
      {/* Linhas horizontais */}
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, -height/2 + 0.05 + i * 0.1, 0.08]}>
          <boxGeometry args={[width, 0.003, 0.002]} />
          <meshStandardMaterial color="#5a4a14" />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================
// COMPONENTE: ASIC
// ============================================================
function ASIC3D({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[ASIC.width, ASIC.height, ASIC.depth]} />
        <meshStandardMaterial color={COLORS.asicBody} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Ventoinhas frontais */}
      {[-0.055, 0.055].map((y, i) => (
        <mesh key={i} position={[0, y, -ASIC.depth/2 + 0.01]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color={COLORS.asicFan} />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================
// COMPONENTE: Estante com ASICs
// ============================================================
function Estante({ position }: { position: [number, number, number] }) {
  const feetHeight = 0.6
  const levelHeight = 0.35
  const numLevels = 5
  const machinesPerLevel = 11
  const gap = 0.05
  const totalWidth = machinesPerLevel * ASIC.width + (machinesPerLevel - 1) * gap
  const startX = -totalWidth / 2 + ASIC.width / 2

  return (
    <group position={position}>
      {/* Colunas */}
      {[-SHELF.length/2, 0, SHELF.length/2].map((x, i) => (
        <mesh key={i} position={[x, SHELF.height/2, 0]}>
          <boxGeometry args={[0.04, SHELF.height, 0.04]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.6} />
        </mesh>
      ))}
      
      {/* Compensado de fundo */}
      <mesh position={[0, SHELF.height/2, SHELF.depth/2]}>
        <boxGeometry args={[SHELF.length, SHELF.height, 0.018]} />
        <meshStandardMaterial color={COLORS.plywood} />
      </mesh>

      {/* Níveis com ASICs */}
      {Array.from({ length: numLevels }).map((_, level) => {
        const y = feetHeight + level * levelHeight
        return (
          <group key={level}>
            {/* Prateleira */}
            <mesh position={[0, y, 0]}>
              <boxGeometry args={[SHELF.length, 0.003, SHELF.depth/2]} />
              <meshStandardMaterial color={COLORS.metal} metalness={0.5} />
            </mesh>
            {/* ASICs */}
            {Array.from({ length: machinesPerLevel }).map((_, m) => (
              <ASIC3D
                key={m}
                position={[startX + m * (ASIC.width + gap), y + ASIC.height/2 + 0.01, 0]}
              />
            ))}
          </group>
        )
      })}
    </group>
  )
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ColdAisleInterno3D() {
  return (
    <Canvas
      camera={{ position: [3, 1.5, 1.75], fov: 80 }}
      style={{ background: 'linear-gradient(180deg, #1a2a3a 0%, #0a1a2a 100%)' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <pointLight position={[0, 2, 1.75]} intensity={0.5} />

      {/* PISO */}
      <mesh position={[0, 0, COLD_AISLE.depth/2]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[COLD_AISLE.width, COLD_AISLE.depth]} />
        <meshStandardMaterial color={COLORS.floor} />
      </mesh>

      {/* TETO */}
      <mesh position={[0, COLD_AISLE.height, COLD_AISLE.depth/2]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[COLD_AISLE.width, COLD_AISLE.depth]} />
        <meshStandardMaterial color={COLORS.ceiling} />
      </mesh>

      {/* PAREDE ESQUERDA */}
      <mesh position={[-COLD_AISLE.width/2, COLD_AISLE.height/2, COLD_AISLE.depth/2]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[COLD_AISLE.depth, COLD_AISLE.height]} />
        <meshStandardMaterial color={COLORS.wall} />
      </mesh>

      {/* PAREDE DIREITA */}
      <mesh position={[COLD_AISLE.width/2, COLD_AISLE.height/2, COLD_AISLE.depth/2]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[COLD_AISLE.depth, COLD_AISLE.height]} />
        <meshStandardMaterial color={COLORS.wall} />
      </mesh>

      {/* COLMEIA (Z = 0) */}
      <Colmeia position={[0, COLD_AISLE.height/2, 0.1]} />

      {/* ESTANTES (Z = depth) */}
      <Estante position={[-SHELF.length/2, 0, COLD_AISLE.depth - 0.3]} />
      <Estante position={[SHELF.length/2, 0, COLD_AISLE.depth - 0.3]} />

      {/* LABELS */}
      <Text position={[0, COLD_AISLE.height + 0.2, COLD_AISLE.depth/2]} fontSize={0.15} color="#22c55e" anchorX="center">
        🧊 COLD AISLE - VISTA INTERNA
      </Text>
      <Text position={[0, 0.1, 0.4]} fontSize={0.1} color="#22c55e" anchorX="center">
        🐝 COLMEIA EVAPORATIVA
      </Text>
      <Text position={[0, 0.1, COLD_AISLE.depth - 0.5]} fontSize={0.1} color="#ffffff" anchorX="center">
        📦 110 ASICs ANTMINER S19K PRO
      </Text>

      {/* Grid */}
      <Grid
        position={[0, 0.01, COLD_AISLE.depth/2]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#2a3a4a"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#3a4a5a"
        fadeDistance={15}
      />

      <OrbitControls target={[0, 1.2, 1.75]} />
    </Canvas>
  )
}
