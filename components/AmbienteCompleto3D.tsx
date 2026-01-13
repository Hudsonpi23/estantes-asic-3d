'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// PARÂMETROS DO AMBIENTE
// ============================================================
const ROOM = {
  width: 8.0,          // Largura da sala (X)
  depth: 4.0,          // Profundidade da sala (Z)
  height: 3.5,         // Altura da sala (Y)
  wallThickness: 0.1,  // Espessura das paredes
  doorWidth: 1.0,      // Largura da porta
  doorHeight: 2.2,     // Altura da porta
  ventHeight: 1.0,     // Altura das aberturas laterais
  ventFromFloor: 1.5,  // Distância do chão até as aberturas
}

const SHELF = {
  length: 3.0,
  height: 2.4,
  depth: 0.6,
  spacing: 0.8,
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
  galvanized: '#a8b5c4',    // Telha galvanizada
  brick: '#8b6b5b',         // Tijolo
  floor: '#4a4a4a',         // Piso concreto
  door: '#6b7280',          // Porta metálica
  metal: '#718096',         // Estrutura metálica
  asicBody: '#7a8599',      // Corpo do ASIC
  asicFan: '#1a1a1a',       // Ventoinhas
  shelf: '#8494a8',         // Prateleira
  hotAir: '#ef4444',        // Ar quente
  coldAir: '#22c55e',       // Ar frio
}

// ============================================================
// COMPONENTE: Parede Galvanizada com textura de telha
// ============================================================
function GalvanizedWall({
  position,
  size,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number]
  size: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={COLORS.galvanized} 
        metalness={0.7} 
        roughness={0.4}
      />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Parede de Tijolo
// ============================================================
function BrickWall({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={COLORS.brick} 
        metalness={0.1} 
        roughness={0.9}
      />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Porta Metálica
// ============================================================
function Door({
  position,
}: {
  position: [number, number, number]
}) {
  return (
    <group position={position}>
      {/* Moldura */}
      <mesh position={[0, ROOM.doorHeight / 2, 0]}>
        <boxGeometry args={[ROOM.doorWidth + 0.1, ROOM.doorHeight + 0.1, 0.15]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Porta */}
      <mesh position={[0, ROOM.doorHeight / 2, 0.02]}>
        <boxGeometry args={[ROOM.doorWidth, ROOM.doorHeight, 0.05]} />
        <meshStandardMaterial color={COLORS.door} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Maçaneta */}
      <mesh position={[ROOM.doorWidth / 2 - 0.15, ROOM.doorHeight / 2, 0.06]}>
        <boxGeometry args={[0.1, 0.03, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
    </group>
  )
}

// ============================================================
// COMPONENTE: ASIC Simplificado
// ============================================================
function SimpleASIC({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Corpo */}
      <mesh>
        <boxGeometry args={[ASIC.width, ASIC.height, ASIC.depth]} />
        <meshStandardMaterial color={COLORS.asicBody} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Ventoinhas traseiras (lado quente) */}
      {[-0.055, 0.055].map((offsetY, i) => (
        <mesh key={i} position={[0, offsetY, ASIC.depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
          <meshStandardMaterial color={COLORS.asicFan} />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================
// COMPONENTE: Estante Simplificada
// ============================================================
function SimpleShelf({
  position,
  machinesPerLevel = 11,
  numLevels = 5,
}: {
  position: [number, number, number]
  machinesPerLevel?: number
  numLevels?: number
}) {
  const levelHeight = 0.35
  const feetHeight = 0.6
  const gap = 0.05
  const totalWidth = machinesPerLevel * ASIC.width + (machinesPerLevel - 1) * gap
  const startX = -totalWidth / 2 + ASIC.width / 2

  return (
    <group position={position}>
      {/* Estrutura metálica simplificada */}
      {/* Colunas */}
      {[-SHELF.length / 2, 0, SHELF.length / 2].map((x, i) => (
        <mesh key={`col-${i}`} position={[x, SHELF.height / 2, 0]}>
          <boxGeometry args={[0.04, SHELF.height, 0.04]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Prateleiras e ASICs */}
      {Array.from({ length: numLevels }).map((_, level) => {
        const levelY = feetHeight + level * levelHeight
        return (
          <group key={`level-${level}`}>
            {/* Prateleira */}
            <mesh position={[0, levelY, 0]}>
              <boxGeometry args={[SHELF.length, 0.003, SHELF.depth]} />
              <meshStandardMaterial color={COLORS.shelf} metalness={0.5} roughness={0.5} />
            </mesh>
            {/* ASICs */}
            {Array.from({ length: machinesPerLevel }).map((_, m) => {
              const machineX = startX + m * (ASIC.width + gap)
              return (
                <SimpleASIC
                  key={`asic-${level}-${m}`}
                  position={[machineX, levelY + ASIC.height / 2 + 0.003, SHELF.depth * 0.2]}
                />
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

// ============================================================
// COMPONENTE: Seta de Fluxo de Ar
// ============================================================
function AirflowArrow({
  start,
  end,
  color,
}: {
  start: [number, number, number]
  end: [number, number, number]
  color: string
}) {
  const direction = new THREE.Vector3(
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2]
  )
  const length = direction.length()
  direction.normalize()

  return (
    <arrowHelper
      args={[
        direction,
        new THREE.Vector3(...start),
        length,
        color,
        0.2,
        0.1,
      ]}
    />
  )
}

// ============================================================
// COMPONENTE PRINCIPAL: Ambiente Completo
// ============================================================
export default function AmbienteCompleto3D() {
  const shelfOffset = (SHELF.length + SHELF.spacing) / 2

  return (
    <Canvas
      camera={{ position: [12, 6, 12], fov: 50 }}
      style={{ background: 'linear-gradient(180deg, #0a0a12 0%, #1a1a2e 100%)' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} />

      {/* Título */}
      <Text
        position={[0, ROOM.height + 0.5, 0]}
        fontSize={0.25}
        color="#f97316"
        anchorX="center"
        anchorY="middle"
      >
        SALA DE MINERAÇÃO - HOT AISLE / COLD AISLE
      </Text>

      {/* ========== PISO ========== */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.9} />
      </mesh>

      {/* ========== TETO ========== */}
      <GalvanizedWall
        position={[0, ROOM.height, 0]}
        size={[ROOM.width, ROOM.wallThickness, ROOM.depth]}
      />

      {/* ========== PAREDE FRONTAL (com porta) ========== */}
      {/* Lado esquerdo da porta */}
      <GalvanizedWall
        position={[
          -ROOM.width / 4 - ROOM.doorWidth / 4,
          ROOM.height / 2,
          -ROOM.depth / 2
        ]}
        size={[ROOM.width / 2 - ROOM.doorWidth / 2, ROOM.height, ROOM.wallThickness]}
      />
      {/* Lado direito da porta */}
      <GalvanizedWall
        position={[
          ROOM.width / 4 + ROOM.doorWidth / 4,
          ROOM.height / 2,
          -ROOM.depth / 2
        ]}
        size={[ROOM.width / 2 - ROOM.doorWidth / 2, ROOM.height, ROOM.wallThickness]}
      />
      {/* Em cima da porta */}
      <GalvanizedWall
        position={[0, ROOM.height - (ROOM.height - ROOM.doorHeight) / 2, -ROOM.depth / 2]}
        size={[ROOM.doorWidth + 0.2, ROOM.height - ROOM.doorHeight, ROOM.wallThickness]}
      />
      {/* Porta */}
      <Door position={[0, 0, -ROOM.depth / 2 + 0.1]} />

      {/* ========== PAREDE TRASEIRA (tijolo) ========== */}
      <BrickWall
        position={[0, ROOM.height / 2, ROOM.depth / 2]}
        size={[ROOM.width, ROOM.height, ROOM.wallThickness]}
      />

      {/* ========== PAREDES LATERAIS (com aberturas) ========== */}
      {/* Lateral Esquerda - Parte inferior */}
      <GalvanizedWall
        position={[-ROOM.width / 2, ROOM.ventFromFloor / 2, 0]}
        size={[ROOM.wallThickness, ROOM.ventFromFloor, ROOM.depth]}
      />
      {/* Lateral Esquerda - Parte superior */}
      <GalvanizedWall
        position={[
          -ROOM.width / 2,
          ROOM.ventFromFloor + ROOM.ventHeight + (ROOM.height - ROOM.ventFromFloor - ROOM.ventHeight) / 2,
          0
        ]}
        size={[ROOM.wallThickness, ROOM.height - ROOM.ventFromFloor - ROOM.ventHeight, ROOM.depth]}
      />

      {/* Lateral Direita - Parte inferior */}
      <GalvanizedWall
        position={[ROOM.width / 2, ROOM.ventFromFloor / 2, 0]}
        size={[ROOM.wallThickness, ROOM.ventFromFloor, ROOM.depth]}
      />
      {/* Lateral Direita - Parte superior */}
      <GalvanizedWall
        position={[
          ROOM.width / 2,
          ROOM.ventFromFloor + ROOM.ventHeight + (ROOM.height - ROOM.ventFromFloor - ROOM.ventHeight) / 2,
          0
        ]}
        size={[ROOM.wallThickness, ROOM.height - ROOM.ventFromFloor - ROOM.ventHeight, ROOM.depth]}
      />

      {/* ========== DIVISÓRIA ENTRE HOT/COLD (parede baixa) ========== */}
      <GalvanizedWall
        position={[0, 0.8, SHELF.depth / 2 + 0.5]}
        size={[ROOM.width - 0.4, 1.6, 0.05]}
      />

      {/* ========== ESTANTES ========== */}
      <SimpleShelf position={[-shelfOffset, 0, 0]} />
      <SimpleShelf position={[shelfOffset, 0, 0]} />

      {/* ========== SETAS DE FLUXO DE AR ========== */}
      {/* Ar frio entrando (verde) */}
      <AirflowArrow start={[0, 1.5, -ROOM.depth / 2 + 0.5]} end={[0, 1.5, 0]} color={COLORS.coldAir} />
      
      {/* Ar quente saindo pelas laterais (vermelho) */}
      <AirflowArrow start={[1, 2, 0.5]} end={[ROOM.width / 2 + 0.5, 2, 0.5]} color={COLORS.hotAir} />
      <AirflowArrow start={[-1, 2, 0.5]} end={[-ROOM.width / 2 - 0.5, 2, 0.5]} color={COLORS.hotAir} />

      {/* ========== LABELS ========== */}
      <Text
        position={[0, 0.3, -ROOM.depth / 2 + 0.3]}
        fontSize={0.15}
        color={COLORS.coldAir}
        anchorX="center"
      >
        🟢 LADO FRIO (Entrada)
      </Text>
      <Text
        position={[-ROOM.width / 2 - 0.3, 2, 0]}
        fontSize={0.12}
        color={COLORS.hotAir}
        anchorX="center"
        rotation={[0, Math.PI / 2, 0]}
      >
        🔴 SAÍDA AR QUENTE
      </Text>
      <Text
        position={[ROOM.width / 2 + 0.3, 2, 0]}
        fontSize={0.12}
        color={COLORS.hotAir}
        anchorX="center"
        rotation={[0, -Math.PI / 2, 0]}
      >
        🔴 SAÍDA AR QUENTE
      </Text>

      {/* Grid do chão externo */}
      <Grid
        position={[0, -0.06, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#2a2a4a"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#3a3a5a"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
      />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={30}
      />
    </Canvas>
  )
}
