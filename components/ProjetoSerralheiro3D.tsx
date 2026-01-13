'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// PARÂMETROS - VISÃO DO SERRALHEIRO
// ============================================================
const PARAMS = {
  shelfLength: 3.0,           // Comprimento da estante (m)
  totalHeight: 2.4,           // Altura total incluindo pés (m)
  feetHeight: 0.6,            // Altura dos pés/base (m)
  usableHeight: 1.8,          // Altura útil (m)
  levelHeight: 0.35,          // Altura de cada fileira (m)
  shelfDepth: 0.60,           // Profundidade da estante (m)
  shelfThickness: 0.003,      // Espessura da chapa da prateleira (m)
  beamSize: 0.04,             // Perfil metalon 40mm (m)
  conduitDia: 0.05,           // Diâmetro do conduíte 50mm (m)
  clampsPerLevel: 7,          // Abraçadeiras por nível
  shelfSpacing: 0.8,          // Espaço entre estantes (m)
  plywoodThickness: 0.018,    // Espessura do compensado 18mm (m)
}

const shelfLength = PARAMS.shelfLength

// ============================================================
// CORES
// ============================================================
const COLORS = {
  metal: '#718096',           // Estrutura metálica cinza
  shelf: '#8494a8',           // Prateleira cinza claro
  plywood: '#b8956b',         // COMPENSADO (madeira marrom)
  conduit: '#f97316',         // Conduíte laranja PVC
  clamp: '#d1d5db',           // Abraçadeira metálica
}

// ============================================================
// COMPONENTE: Coluna Vertical
// ============================================================
function VerticalColumn({
  position,
  height,
}: {
  position: [number, number, number]
  height: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[PARAMS.beamSize, height, PARAMS.beamSize]} />
      <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Travessa Horizontal
// ============================================================
function HorizontalBeam({
  start,
  end,
  isLongitudinal = false,
}: {
  start: [number, number, number]
  end: [number, number, number]
  isLongitudinal?: boolean
}) {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
    Math.pow(end[1] - start[1], 2) +
    Math.pow(end[2] - start[2], 2)
  )
  const midX = (start[0] + end[0]) / 2
  const midY = (start[1] + end[1]) / 2
  const midZ = (start[2] + end[2]) / 2

  return (
    <mesh position={[midX, midY, midZ]} rotation={[0, isLongitudinal ? 0 : Math.PI / 2, 0]}>
      <boxGeometry args={[length, PARAMS.beamSize, PARAMS.beamSize]} />
      <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Chapa da Prateleira
// ============================================================
function ShelfPlate({
  position,
  width,
  depth,
}: {
  position: [number, number, number]
  width: number
  depth: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, PARAMS.shelfThickness, depth]} />
      <meshStandardMaterial color={COLORS.shelf} metalness={0.5} roughness={0.5} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Conduíte PVC
// ============================================================
function Conduit({
  position,
  length,
}: {
  position: [number, number, number]
  length: number
}) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[PARAMS.conduitDia / 2, PARAMS.conduitDia / 2, length, 16]} />
      <meshStandardMaterial color={COLORS.conduit} metalness={0.3} roughness={0.6} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Abraçadeira
// ============================================================
function Clamp({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[PARAMS.conduitDia / 2 + 0.005, 0.003, 8, 16]} />
      <meshStandardMaterial color={COLORS.clamp} metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Parede de Compensado SEM ABERTURAS
// ============================================================
function PlywoodWallSolid({
  position,
  width,
  height,
}: {
  position: [number, number, number]
  width: number
  height: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, PARAMS.plywoodThickness]} />
      <meshStandardMaterial 
        color={COLORS.plywood} 
        metalness={0.1} 
        roughness={0.8}
      />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Estante para Serralheiro (SEM MÁQUINAS)
// ============================================================
function ShelfStructure({
  position,
  numLevels,
  label,
}: {
  position: [number, number, number]
  numLevels: number
  label: string
}) {
  const shelfDepth = PARAMS.shelfDepth
  const feetHeight = PARAMS.feetHeight
  const totalHeight = PARAMS.totalHeight
  const levelHeight = PARAMS.levelHeight

  const frontZ = -shelfDepth / 2
  const rearZ = shelfDepth / 2

  // 6 colunas (4 cantos + 2 no meio)
  const columns: [number, number, number][] = [
    [-shelfLength / 2 + PARAMS.beamSize / 2, totalHeight / 2, frontZ + PARAMS.beamSize / 2],
    [shelfLength / 2 - PARAMS.beamSize / 2, totalHeight / 2, frontZ + PARAMS.beamSize / 2],
    [-shelfLength / 2 + PARAMS.beamSize / 2, totalHeight / 2, rearZ - PARAMS.beamSize / 2],
    [shelfLength / 2 - PARAMS.beamSize / 2, totalHeight / 2, rearZ - PARAMS.beamSize / 2],
    // Pés de reforço no meio
    [0, totalHeight / 2, frontZ + PARAMS.beamSize / 2],
    [0, totalHeight / 2, rearZ - PARAMS.beamSize / 2],
  ]

  return (
    <group position={position}>
      {/* Label */}
      <Text
        position={[0, totalHeight + 0.15, 0]}
        fontSize={0.12}
        color="#f97316"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Colunas verticais */}
      {columns.map((col, i) => (
        <VerticalColumn key={`col-${i}`} position={col} height={totalHeight} />
      ))}

      {/* Travessas horizontais em cada nível */}
      {Array.from({ length: numLevels + 1 }).map((_, level) => {
        const y = level === 0 ? feetHeight : feetHeight + level * levelHeight
        return (
          <group key={`level-beams-${level}`}>
            {/* Travessa frontal */}
            <HorizontalBeam
              start={[-shelfLength / 2 + PARAMS.beamSize, y, frontZ + PARAMS.beamSize / 2]}
              end={[shelfLength / 2 - PARAMS.beamSize, y, frontZ + PARAMS.beamSize / 2]}
              isLongitudinal={true}
            />
            {/* Travessa traseira */}
            <HorizontalBeam
              start={[-shelfLength / 2 + PARAMS.beamSize, y, rearZ - PARAMS.beamSize / 2]}
              end={[shelfLength / 2 - PARAMS.beamSize, y, rearZ - PARAMS.beamSize / 2]}
              isLongitudinal={true}
            />
            {/* Travessas laterais */}
            <HorizontalBeam
              start={[-shelfLength / 2 + PARAMS.beamSize / 2, y, frontZ + PARAMS.beamSize]}
              end={[-shelfLength / 2 + PARAMS.beamSize / 2, y, rearZ - PARAMS.beamSize]}
            />
            <HorizontalBeam
              start={[shelfLength / 2 - PARAMS.beamSize / 2, y, frontZ + PARAMS.beamSize]}
              end={[shelfLength / 2 - PARAMS.beamSize / 2, y, rearZ - PARAMS.beamSize]}
            />
            {/* Travessa do meio (conectando os pés centrais) */}
            <HorizontalBeam
              start={[0, y, frontZ + PARAMS.beamSize]}
              end={[0, y, rearZ - PARAMS.beamSize]}
            />
          </group>
        )
      })}

      {/* Travessas na base (pés) */}
      <HorizontalBeam
        start={[-shelfLength / 2 + PARAMS.beamSize, 0, frontZ + PARAMS.beamSize / 2]}
        end={[shelfLength / 2 - PARAMS.beamSize, 0, frontZ + PARAMS.beamSize / 2]}
        isLongitudinal={true}
      />
      <HorizontalBeam
        start={[-shelfLength / 2 + PARAMS.beamSize, 0, rearZ - PARAMS.beamSize / 2]}
        end={[shelfLength / 2 - PARAMS.beamSize, 0, rearZ - PARAMS.beamSize / 2]}
        isLongitudinal={true}
      />

      {/* Prateleiras e Conduítes */}
      {Array.from({ length: numLevels }).map((_, level) => {
        const levelY = feetHeight + level * levelHeight
        const conduitY = levelY + PARAMS.beamSize + PARAMS.conduitDia / 2
        const clampSpacing = shelfLength / (PARAMS.clampsPerLevel + 1)

        return (
          <group key={`shelf-level-${level}`}>
            {/* Chapa da prateleira */}
            <ShelfPlate
              position={[0, levelY + PARAMS.shelfThickness / 2, 0]}
              width={shelfLength - PARAMS.beamSize * 2}
              depth={shelfDepth - PARAMS.beamSize * 2}
            />

            {/* Conduíte na frente */}
            <Conduit
              position={[0, conduitY, frontZ + PARAMS.beamSize + PARAMS.conduitDia / 2]}
              length={shelfLength - PARAMS.beamSize * 2}
            />

            {/* Abraçadeiras */}
            {Array.from({ length: PARAMS.clampsPerLevel }).map((_, c) => {
              const clampX = -shelfLength / 2 + clampSpacing * (c + 1)
              return (
                <Clamp
                  key={`clamp-${level}-${c}`}
                  position={[clampX, conduitY, frontZ + PARAMS.beamSize + PARAMS.conduitDia / 2]}
                />
              )
            })}
          </group>
        )
      })}

      {/* PAREDE DE COMPENSADO - SEM ABERTURAS - ALTURA TOTAL 2.40m (até o chão) */}
      <PlywoodWallSolid
        position={[0, totalHeight / 2, rearZ - 0.009]}
        width={shelfLength - PARAMS.beamSize * 2}
        height={totalHeight}
      />

      {/* Labels de orientação */}
      <Text
        position={[0, feetHeight / 2, frontZ - 0.15]}
        fontSize={0.08}
        color="#22c55e"
        anchorX="center"
        anchorY="middle"
      >
        FRENTE (Lado Frio)
      </Text>
      <Text
        position={[0, feetHeight / 2, rearZ + 0.15]}
        fontSize={0.08}
        color="#f97316"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        FUNDO (Compensado)
      </Text>
    </group>
  )
}

// ============================================================
// COMPONENTE PRINCIPAL - VISÃO DO SERRALHEIRO
// ============================================================
export default function ProjetoSerralheiro3D() {
  const numLevels = 5
  const spacing = PARAMS.shelfLength + PARAMS.shelfSpacing
  const offsetX = spacing / 2

  return (
    <Canvas
      camera={{ position: [6, 3, 6], fov: 50 }}
      style={{ background: 'linear-gradient(180deg, #0a0a12 0%, #1a1a2e 100%)' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />

      {/* Título */}
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.18}
        color="#f97316"
        anchorX="center"
        anchorY="middle"
      >
        PROJETO ESTANTES - SERRALHEIRO
      </Text>
      <Text
        position={[0, 2.95, 0]}
        fontSize={0.08}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Estrutura metálica + Compensado SEM aberturas
      </Text>

      {/* Duas Estantes */}
      <ShelfStructure
        position={[-offsetX, 0, 0]}
        numLevels={numLevels}
        label="ESTANTE 1"
      />
      <ShelfStructure
        position={[offsetX, 0, 0]}
        numLevels={numLevels}
        label="ESTANTE 2"
      />

      {/* Grid do chão */}
      <Grid
        position={[0, 0, 0]}
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
        minDistance={2}
        maxDistance={20}
      />
    </Canvas>
  )
}
