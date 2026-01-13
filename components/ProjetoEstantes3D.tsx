'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// PARÂMETROS GLOBAIS - Modelo para Serralheiro
// ============================================================
const PARAMS = {
  // === CONFIGURAÇÃO GERAL ===
  shelfLength: 3.0,           // Comprimento da estante (m)
  totalHeight: 2.4,           // Altura total incluindo pés (m)
  feetHeight: 0.6,            // Altura dos pés/base sem máquinas (m)
  usableHeight: 1.8,          // Altura útil para máquinas (m)
  levelHeight: 0.35,          // Altura de cada fileira (m)

  // === PRATELEIRAS ===
  shelfDepth: 0.60,           // Profundidade da estante (m) - MODELO SERRALHEIRO
  shelfThickness: 0.003,      // Espessura da chapa da prateleira (m)

  // === DIMENSÕES DO ASIC (Antminer S19k Pro) ===
  asicW: 0.195,               // Largura (ao longo do comprimento) (m)
  asicH: 0.29,                // Altura (m)
  asicD: 0.40,                // Comprimento/profundidade da máquina (m)

  // === PROTRUSÃO (quanto sai para fora) ===
  protrusionPct: 0.30,        // 30% para fora (~12cm)

  // === ESTRUTURA METÁLICA ===
  beamSize: 0.04,             // Perfil metalon/cantoneira 40mm (m)

  // === CONDUÍTE E TOMADAS (LADO FRIO) ===
  conduitDia: 0.05,           // Diâmetro do conduíte 50mm (m)
  clampsPerLevel: 7,          // Abraçadeiras por nível

  // === CAIXA DE TOMADA ===
  outletBoxW: 0.06,           // 6cm
  outletBoxH: 0.08,           // 8cm
  outletBoxD: 0.04,           // 4cm

  // === ESPAÇAMENTO ===
  shelfSpacing: 0.8,          // Espaço entre as duas estantes (m)
  machineGap: 0.08,           // Gap entre máquinas (m)
}

// Cálculo derivado da protrusão
const PROTRUSION = PARAMS.asicD * PARAMS.protrusionPct

// ============================================================
// CORES (Verde = frio, Vermelho = quente)
// ============================================================
const COLORS = {
  metal: '#718096',           // Estrutura metálica cinza
  shelf: '#8494a8',           // Prateleira cinza claro
  asicBody: '#7a8599',        // Corpo do ASIC cinza metálico (como na foto)
  asicFan: '#1a1a1a',         // Ventoinhas pretas
  asicFanCenter: '#333333',   // Centro das ventoinhas
  asicConnector: '#2d2d2d',   // Conectores de energia
  plywood: '#b8956b',         // COMPENSADO (madeira marrom)
  conduit: '#f97316',         // Conduíte laranja PVC
  outlet: '#fbbf24',          // Tomada amarela
  clamp: '#d1d5db',           // Abraçadeira metálica
}

// ============================================================
// INTERFACES
// ============================================================
interface ProjetoEstantes3DProps {
  numLevels?: number
  machinesPerLevel?: number
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
    (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2 + (end[2] - start[2]) ** 2
  )
  const midPoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ]

  return (
    <mesh position={midPoint} rotation={isLongitudinal ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
      <boxGeometry args={[length, PARAMS.beamSize, PARAMS.beamSize]} />
      <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Prateleira
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
      <meshStandardMaterial color={COLORS.shelf} metalness={0.5} roughness={0.4} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: ASIC Antminer S19k Pro (Realista)
// Ventoinhas REDONDAS - 2 de cada lado
// Lado FRIO = entrada de ar + conector RJ45
// Lado QUENTE = saída de ar + conectores de energia
// ============================================================
function ASIC({ position }: { position: [number, number, number] }) {
  const fanRadius = 0.055  // Raio das ventoinhas redondas
  
  return (
    <group position={position}>
      {/* Corpo principal - caixa metálica cinza */}
      <mesh>
        <boxGeometry args={[PARAMS.asicW, PARAMS.asicH, PARAMS.asicD]} />
        <meshStandardMaterial color={COLORS.asicBody} metalness={0.6} roughness={0.35} />
      </mesh>
      
      {/* === FRENTE (Lado Frio) - 2 Ventoinhas REDONDAS Pretas (UMA EM CIMA DA OUTRA) === */}
      {[-0.055, 0.055].map((offsetY, i) => (
        <group key={`front-${i}`} position={[0, offsetY, -PARAMS.asicD / 2]}>
          {/* Ventoinha REDONDA preta */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[fanRadius, fanRadius, 0.025, 24]} />
            <meshStandardMaterial color={COLORS.asicFan} metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Aro externo da ventoinha */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[fanRadius, 0.004, 8, 24]} />
            <meshStandardMaterial color={COLORS.asicFanCenter} />
          </mesh>
          {/* Centro/motor da ventoinha */}
          <mesh position={[0, 0, -0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.03, 16]} />
            <meshStandardMaterial color={COLORS.asicFanCenter} />
          </mesh>
        </group>
      ))}
      
      {/* === Conector RJ45 (Lado Frio - cabo de rede) === */}
      <mesh position={[0, PARAMS.asicH / 2 - 0.025, -PARAMS.asicD / 2 + 0.005]}>
        <boxGeometry args={[0.015, 0.012, 0.015]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Entrada do cabo RJ45 */}
      <mesh position={[0, PARAMS.asicH / 2 - 0.025, -PARAMS.asicD / 2]}>
        <boxGeometry args={[0.012, 0.008, 0.005]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* === TRASEIRA (Lado Quente) - 2 Ventoinhas REDONDAS Pretas (UMA EM CIMA DA OUTRA) === */}
      {[-0.055, 0.055].map((offsetY, i) => (
        <group key={`rear-${i}`} position={[0, offsetY, PARAMS.asicD / 2]}>
          {/* Ventoinha REDONDA preta */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[fanRadius, fanRadius, 0.025, 24]} />
            <meshStandardMaterial color={COLORS.asicFan} metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Aro externo da ventoinha */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[fanRadius, 0.004, 8, 24]} />
            <meshStandardMaterial color={COLORS.asicFanCenter} />
          </mesh>
          {/* Centro/motor da ventoinha */}
          <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.03, 16]} />
            <meshStandardMaterial color={COLORS.asicFanCenter} />
          </mesh>
        </group>
      ))}
      
      {/* === Conectores de Energia (Lado Quente - traseira inferior) === */}
      <mesh position={[-0.03, -PARAMS.asicH / 2 + 0.022, PARAMS.asicD / 2]}>
        <boxGeometry args={[0.022, 0.016, 0.012]} />
        <meshStandardMaterial color={COLORS.asicConnector} />
      </mesh>
      <mesh position={[0.03, -PARAMS.asicH / 2 + 0.022, PARAMS.asicD / 2]}>
        <boxGeometry args={[0.022, 0.016, 0.012]} />
        <meshStandardMaterial color={COLORS.asicConnector} />
      </mesh>
      
      {/* === Etiqueta amarela de aviso === */}
      <mesh position={[0.055, -PARAMS.asicH / 2 + 0.05, PARAMS.asicD / 2 + 0.001]}>
        <planeGeometry args={[0.018, 0.014]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </group>
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
      <meshStandardMaterial color={COLORS.conduit} metalness={0.2} roughness={0.6} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Abraçadeira
// ============================================================
function Clamp({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[PARAMS.conduitDia / 2 + 0.005, 0.004, 8, 24]} />
      <meshStandardMaterial color={COLORS.clamp} metalness={0.9} roughness={0.2} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Caixa de Tomada
// ============================================================
function OutletBox({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[PARAMS.outletBoxW, PARAMS.outletBoxH, PARAMS.outletBoxD]} />
        <meshStandardMaterial color={COLORS.outlet} metalness={0.4} roughness={0.5} />
      </mesh>
      {[-0.015, 0.015].map((offsetY, i) => (
        <mesh key={i} position={[0, offsetY, PARAMS.outletBoxD / 2 + 0.001]}>
          <circleGeometry args={[0.008, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================
// COMPONENTE: Parede de Compensado com Recortes (Aberturas)
// ============================================================
function PlywoodWall({
  position,
  width,
  height,
  cutouts,
}: {
  position: [number, number, number]
  width: number
  height: number
  cutouts: Array<{ x: number; y: number; w: number; h: number }>
}) {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, -height / 2)
  shape.lineTo(width / 2, -height / 2)
  shape.lineTo(width / 2, height / 2)
  shape.lineTo(-width / 2, height / 2)
  shape.lineTo(-width / 2, -height / 2)

  // Recortes/aberturas para cada máquina passar
  cutouts.forEach((cutout) => {
    const hole = new THREE.Path()
    const margin = 0.015 // 15mm de folga
    const hw = (cutout.w + margin) / 2
    const hh = (cutout.h + margin) / 2
    hole.moveTo(cutout.x - hw, cutout.y - hh)
    hole.lineTo(cutout.x + hw, cutout.y - hh)
    hole.lineTo(cutout.x + hw, cutout.y + hh)
    hole.lineTo(cutout.x - hw, cutout.y + hh)
    hole.lineTo(cutout.x - hw, cutout.y - hh)
    shape.holes.push(hole)
  })

  const extrudeSettings = {
    depth: 0.018,  // Compensado grosso 18mm
    bevelEnabled: false,
  }

  return (
    <mesh position={position}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color={COLORS.plywood}
        metalness={0.1}
        roughness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Estante Completa (Modelo Serralheiro)
// ============================================================
function Shelf({
  position,
  numLevels,
  machinesPerLevel,
  label,
}: {
  position: [number, number, number]
  numLevels: number
  machinesPerLevel: number
  label: string
}) {
  const shelfLength = PARAMS.shelfLength
  const shelfDepth = PARAMS.shelfDepth
  const feetHeight = PARAMS.feetHeight
  const totalHeight = PARAMS.totalHeight
  const levelHeight = PARAMS.levelHeight

  // Coordenadas de referência
  const frontZ = -shelfDepth / 2  // Lado frio (frente)
  const rearZ = shelfDepth / 2    // Lado quente (fundo)
  
  // Posição Z da ASIC (70% dentro, 30% fora)
  const asicCenterZ = rearZ + PROTRUSION - (PARAMS.asicD / 2)

  // Distribuição das máquinas
  const totalMachinesWidth = machinesPerLevel * PARAMS.asicW + (machinesPerLevel - 1) * PARAMS.machineGap
  const startX = -totalMachinesWidth / 2 + PARAMS.asicW / 2

  // 4 colunas nos cantos + 2 pés de reforço no meio
  const columns: [number, number, number][] = [
    // Cantos
    [-shelfLength / 2 + PARAMS.beamSize / 2, totalHeight / 2, frontZ + PARAMS.beamSize / 2],
    [shelfLength / 2 - PARAMS.beamSize / 2, totalHeight / 2, frontZ + PARAMS.beamSize / 2],
    [-shelfLength / 2 + PARAMS.beamSize / 2, totalHeight / 2, rearZ - PARAMS.beamSize / 2],
    [shelfLength / 2 - PARAMS.beamSize / 2, totalHeight / 2, rearZ - PARAMS.beamSize / 2],
    // PÉS DE REFORÇO NO MEIO (2 pés - frente e fundo)
    [0, totalHeight / 2, frontZ + PARAMS.beamSize / 2],  // Meio frente
    [0, totalHeight / 2, rearZ - PARAMS.beamSize / 2],   // Meio fundo
  ]

  // Recortes para o painel traseiro
  const cutouts: Array<{ x: number; y: number; w: number; h: number }> = []
  for (let level = 0; level < numLevels; level++) {
    const levelY = feetHeight + level * levelHeight + PARAMS.asicH / 2
    const panelY = levelY - (feetHeight + (numLevels * levelHeight) / 2)
    
    for (let m = 0; m < machinesPerLevel; m++) {
      const machineX = startX + m * (PARAMS.asicW + PARAMS.machineGap)
      cutouts.push({
        x: machineX,
        y: panelY,
        w: PARAMS.asicW,
        h: PARAMS.asicH,
      })
    }
  }

  return (
    <group position={position}>
      {/* Label da estante */}
      <Text
        position={[0, totalHeight + 0.12, 0]}
        fontSize={0.1}
        color="#e94560"
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
              start={[-shelfLength / 2, y, frontZ]}
              end={[shelfLength / 2, y, frontZ]}
              isLongitudinal={true}
            />
            {/* Travessa traseira */}
            <HorizontalBeam
              start={[-shelfLength / 2, y, rearZ]}
              end={[shelfLength / 2, y, rearZ]}
              isLongitudinal={true}
            />
            {/* Travessas laterais */}
            <mesh position={[-shelfLength / 2, y, 0]}>
              <boxGeometry args={[PARAMS.beamSize, PARAMS.beamSize, shelfDepth]} />
              <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[shelfLength / 2, y, 0]}>
              <boxGeometry args={[PARAMS.beamSize, PARAMS.beamSize, shelfDepth]} />
              <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )
      })}

      {/* Travessas na base (pés) com reforço central */}
      <group>
        <HorizontalBeam start={[-shelfLength / 2, 0, frontZ]} end={[shelfLength / 2, 0, frontZ]} isLongitudinal={true} />
        <HorizontalBeam start={[-shelfLength / 2, 0, rearZ]} end={[shelfLength / 2, 0, rearZ]} isLongitudinal={true} />
        <mesh position={[-shelfLength / 2, 0, 0]}>
          <boxGeometry args={[PARAMS.beamSize, PARAMS.beamSize, shelfDepth]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[shelfLength / 2, 0, 0]}>
          <boxGeometry args={[PARAMS.beamSize, PARAMS.beamSize, shelfDepth]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Reforço central na base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[PARAMS.beamSize, PARAMS.beamSize, shelfDepth]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Níveis: Prateleiras + ASICs + Conduítes + Tomadas */}
      {Array.from({ length: numLevels }).map((_, level) => {
        const levelY = feetHeight + level * levelHeight
        const conduitY = levelY + PARAMS.asicH + PARAMS.conduitDia / 2 + 0.02

        return (
          <group key={`level-${level}`}>
            {/* Prateleira */}
            <ShelfPlate
              position={[0, levelY, 0]}
              width={shelfLength - PARAMS.beamSize * 2}
              depth={shelfDepth - PARAMS.beamSize * 2}
            />

            {/* ASICs */}
            {Array.from({ length: machinesPerLevel }).map((_, m) => {
              const machineX = startX + m * (PARAMS.asicW + PARAMS.machineGap)
              return (
                <ASIC
                  key={`asic-${level}-${m}`}
                  position={[machineX, levelY + PARAMS.asicH / 2 + 0.003, asicCenterZ]}
                />
              )
            })}

            {/* Conduíte PVC (lado frio) */}
            <Conduit
              position={[0, conduitY, frontZ + PARAMS.beamSize + PARAMS.conduitDia / 2]}
              length={shelfLength - PARAMS.beamSize * 2}
            />

            {/* Abraçadeiras */}
            {Array.from({ length: PARAMS.clampsPerLevel }).map((_, c) => {
              const clampX = -shelfLength / 2 + PARAMS.beamSize + 
                ((shelfLength - PARAMS.beamSize * 2) / (PARAMS.clampsPerLevel - 1)) * c
              return (
                <Clamp
                  key={`clamp-${level}-${c}`}
                  position={[clampX, conduitY, frontZ + PARAMS.beamSize + PARAMS.conduitDia / 2]}
                />
              )
            })}

            {/* Tomadas - embaixo da travessa de cada prateleira */}
            {Array.from({ length: machinesPerLevel }).map((_, m) => {
              const machineX = startX + m * (PARAMS.asicW + PARAMS.machineGap)
              const outletY = levelY - PARAMS.beamSize / 2 - PARAMS.outletBoxH / 2 - 0.01
              return (
                <OutletBox
                  key={`outlet-${level}-${m}`}
                  position={[machineX, outletY, frontZ - PARAMS.outletBoxD / 2 - 0.01]}
                />
              )
            })}
          </group>
        )
      })}

      {/* PAREDE DE COMPENSADO com aberturas para as máquinas */}
      <PlywoodWall
        position={[0, feetHeight + (numLevels * levelHeight) / 2, rearZ - 0.009]}
        width={shelfLength - PARAMS.beamSize * 2}
        height={numLevels * levelHeight}
        cutouts={cutouts}
      />

      {/* Labels de orientação */}
      <Text
        position={[0, feetHeight / 2, frontZ - 0.2]}
        fontSize={0.06}
        color="#22c55e"
        anchorX="center"
        anchorY="middle"
      >
        🟢 LADO FRIO (Entrada de Ar)
      </Text>
      <Text
        position={[0, feetHeight / 2, rearZ + PROTRUSION + 0.2]}
        fontSize={0.06}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        🔴 LADO QUENTE (Exaustão)
      </Text>
    </group>
  )
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ProjetoEstantes3D({
  numLevels = 5,
  machinesPerLevel = 11,
}: ProjetoEstantes3DProps) {
  const offsetX = (PARAMS.shelfLength + PARAMS.shelfSpacing) / 2

  return (
    <Canvas
      camera={{
        // Vista traseira para mostrar a parede de compensado
        position: [-4, 3, 6],
        fov: 50,
        near: 0.1,
        far: 100,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Iluminação clara */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} />
      <directionalLight position={[-10, 12, -8]} intensity={0.8} />
      <directionalLight position={[0, 10, -10]} intensity={0.6} />
      <pointLight position={[0, 6, 0]} intensity={0.5} />
      <hemisphereLight intensity={0.4} groundColor="#1a1a2e" />

      {/* Controles de câmera */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={25}
        target={[0, 1.2, 0]}
      />

      {/* Grid */}
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#2a2a4a"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#4a4a6a"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />

      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Estante 1 */}
      <Shelf
        position={[-offsetX, 0, 0]}
        numLevels={numLevels}
        machinesPerLevel={machinesPerLevel}
        label="ESTANTE 1"
      />

      {/* Estante 2 */}
      <Shelf
        position={[offsetX, 0, 0]}
        numLevels={numLevels}
        machinesPerLevel={machinesPerLevel}
        label="ESTANTE 2"
      />

      {/* Título */}
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.18}
        color="#e94560"
        anchorX="center"
        anchorY="middle"
      >
        PROJETO ESTANTES ASIC S19k Pro
      </Text>
      <Text
        position={[0, 2.95, 0]}
        fontSize={0.08}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        {`${numLevels * machinesPerLevel * 2} máquinas • ${numLevels} fileiras • 120 TH/máquina`}
      </Text>

      {/* Escala */}
      <group position={[-5, 0.01, 5]}>
        <mesh>
          <boxGeometry args={[1, 0.02, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Text position={[0, 0.1, 0]} fontSize={0.06} color="#ffffff" anchorX="center" anchorY="middle">
          1 metro
        </Text>
      </group>

      {/* Indicadores de fluxo */}
      <Text position={[0, 0.5, -2.5]} fontSize={0.08} color="#22c55e" anchorX="center" anchorY="middle">
        → AR FRIO ENTRA (VERDE) →
      </Text>
      <Text position={[0, 0.5, 3]} fontSize={0.08} color="#ef4444" anchorX="center" anchorY="middle">
        ← AR QUENTE SAI (VERMELHO) ←
      </Text>
    </Canvas>
  )
}
