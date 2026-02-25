'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// PARÂMETROS GLOBAIS - Modelo para Serralheiro
// ============================================================
const PARAMS = {
  // === CONFIGURAÇÃO GERAL ===
  shelfLength: 3.0,           // Comprimento total da estante (3000 mm)
  totalHeight: 2.4,           // Altura total incluindo pés (2400 mm) - MANTIDA
  feetHeight: 0.6,            // Altura dos pés/base sem máquinas (600 mm)
  usableHeight: 1.8,          // Altura útil para máquinas (1800 mm)
  levelHeight: 0.35,          // Altura de cada fileira (m) - mantida

  // === PRATELEIRAS / PROFUNDIDADE ===
  shelfDepth: 0.5,            // Profundidade total da estante (500 mm) - INDUSTRIAL PESADO
  shelfSteelThickness: 0.003, // Espessura chapa aço piso (3 mm) - configurável
  shelfSteelThicknessHeavy: 0.005, // Versão "blindada" 5 mm (opcional)

  // === DIMENSÕES DO ASIC (Antminer S19k Pro) ===
  asicW: 0.195,               // Largura (ao longo do comprimento) (m)
  asicH: 0.29,                // Altura (m)
  asicD: 0.40,                // Comprimento/profundidade da máquina (m)

  // === PROTRUSÃO (quanto sai para fora) ===
  protrusionPct: 0.30,        // 30% para fora (~12cm)

  // === ESTRUTURA METÁLICA - INDUSTRIAL PESADO ===
  columnSize: 0.06,           // Colunas: metalon 60x60x4 (m)
  longarinaH: 0.04,           // Longarina principal: 80x40x4 (altura ~40 mm)
  longarinaW: 0.08,           // Largura da longarina (80 mm) ao longo da profundidade
  brace50x30H: 0.03,          // Travessas apoio: 50x30x3 (altura 30 mm)
  brace50x30W: 0.05,          // Largura (50 mm)
  baseBrace40H: 0.04,         // Travamento inferior: 40x40x3
  baseBrace40W: 0.04,
  diagBrace30: 0.03,          // Contraventamento: 30x30x3 (seção quadrada)
  bottomBraceHeight: 0.3,     // Altura do travamento inferior (300 mm do piso)

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
  shelfDepth?: number      // Profundidade da estante (m)
  conduitDia?: number      // Diâmetro do conduíte (m)
  gap?: number             // Espaçamento entre máquinas (m)
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
      {/* Coluna 60x60x4 mm (escala em metros) */}
      <boxGeometry args={[PARAMS.columnSize, height, PARAMS.columnSize]} />
      <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

// ============================================================
// COMPONENTES ESTRUTURA METÁLICA - INDUSTRIAL PESADO
// ============================================================

// Longarina principal 80x40x4 (ao longo do comprimento, frente/fundo)
function MainLongarina({
  startX,
  endX,
  y,
  z,
}: {
  startX: number
  endX: number
  y: number
  z: number
}) {
  const length = endX - startX
  const midX = (startX + endX) / 2
  return (
    <mesh position={[midX, y, z]}>
      <boxGeometry args={[length, PARAMS.longarinaH, PARAMS.longarinaW]} />
      <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

// Travessa de apoio 50x30x3 (sentido profundidade, 500 mm)
function SupportBrace({
  x,
  y,
  frontZ,
  rearZ,
}: {
  x: number
  y: number
  frontZ: number
  rearZ: number
}) {
  const length = rearZ - frontZ
  const midZ = (frontZ + rearZ) / 2
  return (
    <mesh position={[x, y, midZ]}>
      <boxGeometry args={[PARAMS.brace50x30W, PARAMS.brace50x30H, length]} />
      <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

// Travamento inferior 40x40x3 (retângulo a 300 mm do piso)
function BaseBrace({
  start,
  end,
}: {
  start: [number, number, number]
  end: [number, number, number]
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
    <mesh position={midPoint}>
      <boxGeometry args={[length, PARAMS.baseBrace40H, PARAMS.baseBrace40W]} />
      <meshStandardMaterial color={COLORS.metal} metalness={0.8} roughness={0.25} />
    </mesh>
  )
}

// Contraventamento em X (traseiro) 30x30x3
function DiagonalBrace({
  start,
  end,
}: {
  start: [number, number, number]
  end: [number, number, number]
}) {
  const length = Math.sqrt(
    (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2 + (end[2] - start[2]) ** 2
  )
  const midPoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ]

  // Vetor direção
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const dz = end[2] - start[2]

  // Ângulos aproximados (considerando plano vertical traseiro, dz ≈ 0)
  const rotY = Math.atan2(dz, dx)
  const rotZ = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))

  return (
    <mesh position={midPoint} rotation={[0, rotY, rotZ]}>
      <boxGeometry args={[length, PARAMS.diagBrace30, PARAMS.diagBrace30]} />
      <meshStandardMaterial color={COLORS.metal} metalness={0.85} roughness={0.3} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Chapa de Aço (piso da prateleira) por sessão
// ============================================================
function SteelShelfPlate({
  position,
  width,
  depth,
  heavy = false,
}: {
  position: [number, number, number]
  width: number
  depth: number
  heavy?: boolean
}) {
  const thickness = heavy ? PARAMS.shelfSteelThicknessHeavy : PARAMS.shelfSteelThickness
  return (
    <mesh position={position}>
      <boxGeometry args={[width, thickness, depth]} />
      <meshStandardMaterial color={COLORS.shelf} metalness={0.6} roughness={0.4} />
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
  diameter = PARAMS.conduitDia,
}: {
  position: [number, number, number]
  length: number
  diameter?: number
}) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[diameter / 2, diameter / 2, length, 16]} />
      <meshStandardMaterial color={COLORS.conduit} metalness={0.2} roughness={0.6} />
    </mesh>
  )
}

// ============================================================
// COMPONENTE: Abraçadeira
// ============================================================
function Clamp({ 
  position, 
  diameter = PARAMS.conduitDia 
}: { 
  position: [number, number, number]
  diameter?: number 
}) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[diameter / 2 + 0.005, 0.004, 8, 24]} />
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
  shelfDepth,
  conduitDia,
  machineGap,
}: {
  position: [number, number, number]
  numLevels: number
  machinesPerLevel: number
  label: string
  shelfDepth: number
  conduitDia: number
  machineGap: number
}) {
  const shelfLength = PARAMS.shelfLength
  const feetHeight = PARAMS.feetHeight
  const totalHeight = PARAMS.totalHeight
  const levelHeight = PARAMS.levelHeight

  // Coordenadas de referência
  const frontZ = -shelfDepth / 2  // Lado frio (frente, z = 0 mm)
  const rearZ = shelfDepth / 2    // Lado quente (fundo, z = 500 mm)
  const leftX = -shelfLength / 2  // x = 0 mm
  const centerX = 0               // x = 1500 mm
  const rightX = shelfLength / 2  // x = 3000 mm
  
  // Posição Z da ASIC (70% dentro, 30% fora)
  const asicCenterZ = rearZ + PROTRUSION - (PARAMS.asicD / 2)

  // Distribuição das máquinas
  const totalMachinesWidth = machinesPerLevel * PARAMS.asicW + (machinesPerLevel - 1) * machineGap
  const startX = -totalMachinesWidth / 2 + PARAMS.asicW / 2

  // 6 colunas/pés: esquerda, centro, direita (frente e fundo)
  const columns: [number, number, number][] = [
    [leftX, totalHeight / 2, frontZ],
    [leftX, totalHeight / 2, rearZ],
    [centerX, totalHeight / 2, frontZ],
    [centerX, totalHeight / 2, rearZ],
    [rightX, totalHeight / 2, frontZ],
    [rightX, totalHeight / 2, rearZ],
  ]

  // Recortes para o painel traseiro (apenas na área das máquinas, NÃO nos 60cm de baixo)
  // O compensado vai até o chão, mas os recortes só existem onde há máquinas
  const panelTotalHeight = feetHeight + numLevels * levelHeight
  const cutouts: Array<{ x: number; y: number; w: number; h: number }> = []
  for (let level = 0; level < numLevels; level++) {
    const levelY = feetHeight + level * levelHeight + PARAMS.asicH / 2
    // Posição Y relativa ao CENTRO do painel (que agora vai até o chão)
    const panelY = levelY - (panelTotalHeight / 2)
    
    for (let m = 0; m < machinesPerLevel; m++) {
      const machineX = startX + m * (PARAMS.asicW + machineGap)
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

      {/* Longarinas principais 80x40x4 em cada nível (frente e fundo) */}
      {Array.from({ length: numLevels + 1 }).map((_, level) => {
        const y = level === 0 ? feetHeight : feetHeight + level * levelHeight
        return (
          <group key={`level-beams-${label}-${level}`}>
            <MainLongarina startX={leftX} endX={centerX} y={y} z={frontZ} />
            <MainLongarina startX={centerX} endX={rightX} y={y} z={frontZ} />
            <MainLongarina startX={leftX} endX={centerX} y={y} z={rearZ} />
            <MainLongarina startX={centerX} endX={rightX} y={y} z={rearZ} />
          </group>
        )
      })}

      {/* Travessas de apoio 50x30x3 em cada sessão e nível (3 por sessão) */}
      {Array.from({ length: numLevels }).map((_, level) => {
        const y = feetHeight + level * levelHeight

        // Sessão esquerda (0–1500 mm) e direita (1500–3000 mm)
        const sessionOffset = shelfLength / 4 // 0.75 m em cada lado
        const sessionHalfSpan = shelfLength / 4 // 0.75 m

        const leftSessionX = -sessionOffset
        const rightSessionX = sessionOffset

        const xPositionsLeft = [
          leftSessionX - sessionHalfSpan * (1 / 3), // ~500 mm do apoio esquerdo
          leftSessionX,                             // meio do vão
          leftSessionX + sessionHalfSpan * (1 / 3), // ~500 mm do apoio direito da sessão
        ]

        const xPositionsRight = [
          rightSessionX - sessionHalfSpan * (1 / 3),
          rightSessionX,
          rightSessionX + sessionHalfSpan * (1 / 3),
        ]

        return (
          <group key={`support-braces-${label}-${level}`}>
            {xPositionsLeft.map((x, idx) => (
              <SupportBrace
                key={`left-${level}-${idx}`}
                x={x}
                y={y}
                frontZ={frontZ}
                rearZ={rearZ}
              />
            ))}
            {xPositionsRight.map((x, idx) => (
              <SupportBrace
                key={`right-${level}-${idx}`}
                x={x}
                y={y}
                frontZ={frontZ}
                rearZ={rearZ}
              />
            ))}
          </group>
        )
      })}

      {/* Travamento inferior 40x40x3 a 300 mm do piso (retângulo completo) */}
      <group>
        {/* Frente: 0 – 1500 – 3000 mm */}
        <BaseBrace start={[leftX, PARAMS.bottomBraceHeight, frontZ]} end={[centerX, PARAMS.bottomBraceHeight, frontZ]} />
        <BaseBrace start={[centerX, PARAMS.bottomBraceHeight, frontZ]} end={[rightX, PARAMS.bottomBraceHeight, frontZ]} />
        {/* Fundo */}
        <BaseBrace start={[leftX, PARAMS.bottomBraceHeight, rearZ]} end={[centerX, PARAMS.bottomBraceHeight, rearZ]} />
        <BaseBrace start={[centerX, PARAMS.bottomBraceHeight, rearZ]} end={[rightX, PARAMS.bottomBraceHeight, rearZ]} />
        {/* Ligações frente-fundo (esquerda, centro, direita) */}
        <BaseBrace start={[leftX, PARAMS.bottomBraceHeight, frontZ]} end={[leftX, PARAMS.bottomBraceHeight, rearZ]} />
        <BaseBrace start={[centerX, PARAMS.bottomBraceHeight, frontZ]} end={[centerX, PARAMS.bottomBraceHeight, rearZ]} />
        <BaseBrace start={[rightX, PARAMS.bottomBraceHeight, frontZ]} end={[rightX, PARAMS.bottomBraceHeight, rearZ]} />
      </group>

      {/* Contraventamento traseiro em X (entre pé esquerdo e direito) */}
      <group>
        <DiagonalBrace
          start={[leftX, feetHeight, rearZ]}
          end={[rightX, totalHeight, rearZ]}
        />
        <DiagonalBrace
          start={[rightX, feetHeight, rearZ]}
          end={[leftX, totalHeight, rearZ]}
        />
      </group>

      {/* Níveis: Prateleiras + ASICs + Conduítes + Tomadas */}
      {Array.from({ length: numLevels }).map((_, level) => {
        const levelY = feetHeight + level * levelHeight
        const conduitY = levelY + PARAMS.asicH + conduitDia / 2 + 0.02

        return (
          <group key={`level-${level}`}>
            {/* Piso em chapa de aço 3 mm por sessão (1500 x 500 mm) */}
            <SteelShelfPlate
              position={[(leftX + centerX) / 2, levelY, 0]}
              width={shelfLength / 2 - 0.02}
              depth={shelfDepth - 0.02}
            />
            <SteelShelfPlate
              position={[(centerX + rightX) / 2, levelY, 0]}
              width={shelfLength / 2 - 0.02}
              depth={shelfDepth - 0.02}
            />

            {/* ASICs */}
            {Array.from({ length: machinesPerLevel }).map((_, m) => {
              const machineX = startX + m * (PARAMS.asicW + machineGap)
              return (
                <ASIC
                  key={`asic-${level}-${m}`}
                  position={[machineX, levelY + PARAMS.asicH / 2 + 0.003, asicCenterZ]}
                />
              )
            })}

            {/* Conduíte PVC (lado frio) */}
            <Conduit
              position={[0, conduitY, frontZ + PARAMS.beamSize + conduitDia / 2]}
              length={shelfLength - PARAMS.beamSize * 2}
              diameter={conduitDia}
            />

            {/* Abraçadeiras */}
            {Array.from({ length: PARAMS.clampsPerLevel }).map((_, c) => {
              const clampX = -shelfLength / 2 + PARAMS.beamSize + 
                ((shelfLength - PARAMS.beamSize * 2) / (PARAMS.clampsPerLevel - 1)) * c
              return (
                <Clamp
                  key={`clamp-${level}-${c}`}
                  position={[clampX, conduitY, frontZ + PARAMS.beamSize + conduitDia / 2]}
                  diameter={conduitDia}
                />
              )
            })}

            {/* Tomadas - EM CIMA da prateleira */}
            {Array.from({ length: machinesPerLevel }).map((_, m) => {
              const machineX = startX + m * (PARAMS.asicW + machineGap)
              const outletY = levelY + PARAMS.outletBoxH / 2 + 0.01
              return (
                <OutletBox
                  key={`outlet-${level}-${m}`}
                  position={[machineX, outletY, frontZ - PARAMS.outletBoxD / 2 - 0.02]}
                />
              )
            })}
          </group>
        )
      })}

      {/* PAREDE DE COMPENSADO FECHADA (sem recortes) - VAI ATÉ O CHÃO */}
      <PlywoodWall
        position={[0, (feetHeight + numLevels * levelHeight) / 2, rearZ - 0.012]}
        width={shelfLength}
        height={feetHeight + numLevels * levelHeight}
        cutouts={[]} // fundo fechado, sem aberturas
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
  shelfDepth = PARAMS.shelfDepth,
  conduitDia = PARAMS.conduitDia,
  gap = PARAMS.machineGap,
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
        shelfDepth={shelfDepth}
        conduitDia={conduitDia}
        machineGap={gap}
        label="ESTANTE 1"
      />

      {/* Estante 2 */}
      <Shelf
        position={[offsetX, 0, 0]}
        numLevels={numLevels}
        machinesPerLevel={machinesPerLevel}
        shelfDepth={shelfDepth}
        conduitDia={conduitDia}
        machineGap={gap}
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

      {/* Quadro de materiais resumido (vista técnica para serralheiro) */}
      <group position={[5, 2.2, -4]}>
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.08}
          color="#e5e7eb"
          anchorX="left"
          anchorY="top"
        >
          QUADRO DE MATERIAIS (INDUSTRIAL PESADO)
        </Text>
        <Text
          position={[0, 0.45, 0]}
          fontSize={0.06}
          color="#d1d5db"
          anchorX="left"
          anchorY="top"
        >
          {`Colunas (6x): metalon 60x60x4 • Altura ${PARAMS.totalHeight.toFixed(2)} m`}
        </Text>
        <Text
          position={[0, 0.32, 0]}
          fontSize={0.06}
          color="#d1d5db"
          anchorX="left"
          anchorY="top"
        >
          {`Longarinas: 80x40x4 • Vãos 0-1500-3000 mm (frente e fundo, todos níveis)`}
        </Text>
        <Text
          position={[0, 0.19, 0]}
          fontSize={0.06}
          color="#d1d5db"
          anchorX="left"
          anchorY="top"
        >
          {`Travessas apoio: 50x30x3 • 3 por sessão/nível (em 500/750/1000 mm)`}
        </Text>
        <Text
          position={[0, 0.06, 0]}
          fontSize={0.06}
          color="#d1d5db"
          anchorX="left"
          anchorY="top"
        >
          {`Travamento inferior: 40x40x3 a 300 mm • retângulo completo + ligações`}
        </Text>
        <Text
          position={[0, -0.07, 0]}
          fontSize={0.06}
          color="#d1d5db"
          anchorX="left"
          anchorY="top"
        >
          {`Contraventamento: 30x30x3 em X no fundo (opcional diagonal lateral)`}
        </Text>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.06}
          color="#d1d5db"
          anchorX="left"
          anchorY="top"
        >
          {`Pisos: chapas aço 3 mm (1500x500) por sessão/nível • opção 5 mm blindado`}
        </Text>
        <Text
          position={[0, -0.33, 0]}
          fontSize={0.06}
          color="#d1d5db"
          anchorX="left"
          anchorY="top"
        >
          {`Fundo: compensado 18-25 mm parafusado em grelha metálica (40x20/30x30)`}
        </Text>
      </group>

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

      {/* VISTA FRONTAL - Cotas principais (comprimento 3000 mm e altura 2400 mm) */}
      <group position={[0, 0, -4]}>
        {/* Linha de cota comprimento */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[PARAMS.shelfLength, 0.005, 0.005]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>
        <Text
          position={[0, 0.12, 0]}
          fontSize={0.08}
          color="#e5e7eb"
          anchorX="center"
          anchorY="middle"
        >
          3000 mm
        </Text>
        {/* Linha de cota altura */}
        <mesh position={[-(PARAMS.shelfLength / 2) - 0.2, PARAMS.totalHeight / 2, 0]}>
          <boxGeometry args={[0.005, PARAMS.totalHeight, 0.005]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>
        <Text
          position={[-(PARAMS.shelfLength / 2) - 0.25, PARAMS.totalHeight / 2, 0]}
          fontSize={0.08}
          color="#e5e7eb"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI / 2, 0]}
        >
          2400 mm
        </Text>
        <Text
          position={[0, PARAMS.totalHeight + 0.25, 0]}
          fontSize={0.09}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          VISTA FRONTAL
        </Text>
      </group>

      {/* VISTA LATERAL - Profundidade 500 mm e travamento a 300 mm */}
      <group position={[4.5, 0, 0]}>
        {/* Linha de cota profundidade */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.005, 0.005, PARAMS.shelfDepth]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>
        <Text
          position={[0, 0.12, 0]}
          fontSize={0.08}
          color="#e5e7eb"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
        >
          500 mm
        </Text>
        {/* Linha de cota travamento inferior a 300 mm */}
        <mesh position={[0.3, PARAMS.bottomBraceHeight / 2, 0]}>
          <boxGeometry args={[0.005, PARAMS.bottomBraceHeight, 0.005]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <Text
          position={[0.35, PARAMS.bottomBraceHeight / 2, 0]}
          fontSize={0.07}
          color="#fbbf24"
          anchorX="left"
          anchorY="middle"
          rotation={[0, -Math.PI / 2, 0]}
        >
          300 mm
        </Text>
        <Text
          position={[0, PARAMS.totalHeight + 0.25, 0]}
          fontSize={0.09}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
        >
          VISTA LATERAL
        </Text>
      </group>

      {/* VISTA TRASEIRA - Grelha e painel de compensado */}
      <group position={[0, 0, 4.5]}>
        <Text
          position={[0, PARAMS.totalHeight + 0.25, 0]}
          fontSize={0.09}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
        >
          VISTA TRASEIRA
        </Text>
        <Text
          position={[0, PARAMS.totalHeight - 0.2, 0]}
          fontSize={0.07}
          color="#e5e7eb"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
        >
          Grelha metálica para compensado 18–25 mm
        </Text>
        <Text
          position={[0, PARAMS.totalHeight - 0.35, 0]}
          fontSize={0.06}
          color="#d1d5db"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
        >
          Montantes a cada 400–500 mm • Parafusos ~200 mm
        </Text>
      </group>
    </Canvas>
  )
}
