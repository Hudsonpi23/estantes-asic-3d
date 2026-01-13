'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// PARÂMETROS DO COLD AISLE (vista interna)
// ============================================================
const COLD_AISLE = {
  width: 6.0,
  depth: 3.5,
  height: 2.4,
  wallThickness: 0.1,
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
  wall: '#3a4a5a',
  floor: '#2a3a4a',
  ceiling: '#4a5a6a',
  honeycomb: '#8B6914',
  honeycombFrame: '#5a4a3a',
  metal: '#718096',
  asicBody: '#7a8599',
  asicFan: '#1a1a1a',
  shelf: '#8494a8',
  plywood: '#a0865a',
  coldAir: '#22c55e',
}

// ============================================================
// COMPONENTE: Parede Interna
// ============================================================
function InternalWall({
  position,
  size,
  color = COLORS.wall,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.3} 
        roughness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Colmeia Evaporativa (vista interna)
// ============================================================
function EvaporativePanel({
  position,
  width,
  height,
}: {
  position: [number, number, number]
  width: number
  height: number
}) {
  const panelThickness = 0.15
  const frameSize = 0.08
  
  return (
    <group position={position}>
      {/* Moldura externa */}
      <mesh position={[0, 0, panelThickness / 2 + 0.01]}>
        <boxGeometry args={[width + frameSize * 2, height + frameSize * 2, 0.05]} />
        <meshStandardMaterial color={COLORS.honeycombFrame} metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Painel principal da colmeia */}
      <mesh>
        <boxGeometry args={[width, height, panelThickness]} />
        <meshStandardMaterial 
          color={COLORS.honeycomb} 
          metalness={0.1} 
          roughness={0.9}
          transparent={true}
          opacity={0.85}
        />
      </mesh>
      
      {/* Padrão de colmeia - linhas verticais */}
      {Array.from({ length: Math.floor(width / 0.08) }).map((_, i) => (
        <mesh 
          key={`v-${i}`} 
          position={[-width / 2 + 0.04 + i * 0.08, 0, -panelThickness / 2 - 0.001]}
        >
          <boxGeometry args={[0.004, height, 0.002]} />
          <meshStandardMaterial color="#6B5214" />
        </mesh>
      ))}
      
      {/* Linhas horizontais */}
      {Array.from({ length: Math.floor(height / 0.08) }).map((_, i) => (
        <mesh 
          key={`h-${i}`} 
          position={[0, -height / 2 + 0.04 + i * 0.08, -panelThickness / 2 - 0.001]}
        >
          <boxGeometry args={[width, 0.004, 0.002]} />
          <meshStandardMaterial color="#6B5214" />
        </mesh>
      ))}

      {/* Label */}
      <Text
        position={[0, height / 2 + 0.15, 0]}
        fontSize={0.12}
        color={COLORS.coldAir}
        anchorX="center"
      >
        🐝 COLMEIA EVAPORATIVA
      </Text>
    </group>
  )
}

// ============================================================
// COMPONENTE: ASIC Simplificado (vista frontal - lado frio)
// ============================================================
function SimpleASIC({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Corpo */}
      <mesh>
        <boxGeometry args={[ASIC.width, ASIC.height, ASIC.depth]} />
        <meshStandardMaterial color={COLORS.asicBody} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Ventoinhas frontais (lado frio - entrada de ar) */}
      {[-0.055, 0.055].map((offsetY, i) => (
        <mesh key={i} position={[0, offsetY, -ASIC.depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
          <meshStandardMaterial color={COLORS.asicFan} />
        </mesh>
      ))}
      {/* Conector RJ45 */}
      <mesh position={[0.06, 0.08, -ASIC.depth / 2 + 0.01]}>
        <boxGeometry args={[0.02, 0.015, 0.02]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  )
}

// ============================================================
// COMPONENTE: Estante com Máquinas (vista frontal - lado frio)
// ============================================================
function ShelfFrontView({
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
      {/* Estrutura metálica */}
      {/* Colunas verticais */}
      {[-SHELF.length / 2, 0, SHELF.length / 2].map((x, i) => (
        <mesh key={`col-${i}`} position={[x, SHELF.height / 2, 0]}>
          <boxGeometry args={[0.04, SHELF.height, 0.04]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Compensado no fundo (vista de trás = lado frio vê o compensado) */}
      <mesh position={[0, SHELF.height / 2, SHELF.depth / 2]}>
        <boxGeometry args={[SHELF.length, SHELF.height, 0.018]} />
        <meshStandardMaterial color={COLORS.plywood} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Prateleiras e ASICs */}
      {Array.from({ length: numLevels }).map((_, level) => {
        const levelY = feetHeight + level * levelHeight
        return (
          <group key={`level-${level}`}>
            {/* Prateleira */}
            <mesh position={[0, levelY, SHELF.depth / 4]}>
              <boxGeometry args={[SHELF.length, 0.003, SHELF.depth / 2]} />
              <meshStandardMaterial color={COLORS.shelf} metalness={0.5} roughness={0.5} />
            </mesh>
            {/* ASICs - Vista frontal (lado frio - entrada de ar) */}
            {Array.from({ length: machinesPerLevel }).map((_, m) => {
              const machineX = startX + m * (ASIC.width + gap)
              return (
                <SimpleASIC
                  key={`asic-${level}-${m}`}
                  position={[machineX, levelY + ASIC.height / 2 + 0.003, 0.1]}
                />
              )
            })}
          </group>
        )
      })}

      {/* Pés */}
      {[-SHELF.length / 2 + 0.05, SHELF.length / 2 - 0.05].map((x, i) => (
        <mesh key={`foot-${i}`} position={[x, feetHeight / 2, 0]}>
          <boxGeometry args={[0.05, feetHeight, 0.05]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
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
        0.15,
        0.08,
      ]}
    />
  )
}

// ============================================================
// COMPONENTE PRINCIPAL: Vista Interna do Cold Aisle
// ============================================================
export default function ColdAisleInterno3D() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, -2], fov: 60 }}
      style={{ background: 'linear-gradient(180deg, #1a2a3a 0%, #0a1a2a 100%)' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, -5]} intensity={0.8} />
      <directionalLight position={[5, 3, 0]} intensity={0.4} />
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#88ccff" />

      {/* ========== PISO ========== */}
      <mesh position={[0, 0, COLD_AISLE.depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[COLD_AISLE.width, COLD_AISLE.depth]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.9} />
      </mesh>

      {/* ========== TETO ========== */}
      <mesh position={[0, COLD_AISLE.height, COLD_AISLE.depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[COLD_AISLE.width, COLD_AISLE.depth]} />
        <meshStandardMaterial color={COLORS.ceiling} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* ========== PAREDE ESQUERDA ========== */}
      <mesh position={[-COLD_AISLE.width / 2, COLD_AISLE.height / 2, COLD_AISLE.depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[COLD_AISLE.depth, COLD_AISLE.height]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* ========== PAREDE DIREITA ========== */}
      <mesh position={[COLD_AISLE.width / 2, COLD_AISLE.height / 2, COLD_AISLE.depth / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[COLD_AISLE.depth, COLD_AISLE.height]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* ========== COLMEIA EVAPORATIVA (parede frontal) ========== */}
      <EvaporativePanel
        position={[0, COLD_AISLE.height / 2, 0]}
        width={COLD_AISLE.width - 0.4}
        height={COLD_AISLE.height - 0.3}
      />

      {/* ========== ESTANTES COM MÁQUINAS (parede traseira) ========== */}
      <ShelfFrontView position={[-SHELF.length / 2, 0, COLD_AISLE.depth]} />
      <ShelfFrontView position={[SHELF.length / 2, 0, COLD_AISLE.depth]} />

      {/* ========== SETAS DE FLUXO DE AR FRIO ========== */}
      {/* Da colmeia para as máquinas */}
      <AirflowArrow start={[0, 1.2, 0.5]} end={[0, 1.2, COLD_AISLE.depth - 0.3]} color={COLORS.coldAir} />
      <AirflowArrow start={[-1.5, 1.2, 0.5]} end={[-1.5, 1.2, COLD_AISLE.depth - 0.3]} color={COLORS.coldAir} />
      <AirflowArrow start={[1.5, 1.2, 0.5]} end={[1.5, 1.2, COLD_AISLE.depth - 0.3]} color={COLORS.coldAir} />
      
      {/* Mais setas em diferentes alturas */}
      <AirflowArrow start={[-0.8, 0.8, 0.5]} end={[-0.8, 0.8, COLD_AISLE.depth - 0.3]} color={COLORS.coldAir} />
      <AirflowArrow start={[0.8, 0.8, 0.5]} end={[0.8, 0.8, COLD_AISLE.depth - 0.3]} color={COLORS.coldAir} />
      <AirflowArrow start={[0, 1.8, 0.5]} end={[0, 1.8, COLD_AISLE.depth - 0.3]} color={COLORS.coldAir} />

      {/* ========== LABELS ========== */}
      <Text
        position={[0, COLD_AISLE.height + 0.3, COLD_AISLE.depth / 2]}
        fontSize={0.2}
        color="#22c55e"
        anchorX="center"
      >
        🧊 COLD AISLE - VISTA INTERNA
      </Text>

      <Text
        position={[0, 0.15, COLD_AISLE.depth - 0.2]}
        fontSize={0.12}
        color="#fff"
        anchorX="center"
      >
        ESTANTES COM 110 ASICs
      </Text>

      <Text
        position={[0, 0.15, 0.3]}
        fontSize={0.12}
        color={COLORS.coldAir}
        anchorX="center"
      >
        AR FRIO DA COLMEIA →
      </Text>

      {/* Grid do chão */}
      <Grid
        position={[0, 0.01, COLD_AISLE.depth / 2]}
        args={[COLD_AISLE.width, COLD_AISLE.depth]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1a3a5a"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#2a4a6a"
        fadeDistance={15}
        fadeStrength={1}
        followCamera={false}
      />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={15}
        target={[0, 1.2, COLD_AISLE.depth / 2]}
      />
    </Canvas>
  )
}
