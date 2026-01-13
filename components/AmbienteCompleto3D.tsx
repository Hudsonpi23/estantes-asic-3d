'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================
// PARÂMETROS DO AMBIENTE
// ============================================================
const ROOM = {
  width: 6.0,          // Largura da sala = 2 x SHELF.length (COLADA nas estantes)
  depth: 4.0,          // Profundidade da sala HOT AISLE (Z)
  height: 2.4,         // Altura da sala = MESMA ALTURA DAS ESTANTES
  wallThickness: 0.1,  // Espessura das paredes
  doorWidth: 1.0,      // Largura da porta
  doorHeight: 2.1,     // Altura da porta (um pouco menor que as paredes)
  ventHeight: 0.4,     // Altura das aberturas laterais (perto do teto)
  ventFromCeiling: 0.1, // Distância do TETO até as aberturas
  topVentHeight: 0.2,  // Altura da abertura em cima da porta
}

// COLD AISLE - Ambiente fechado do lado frio com COLMEIA
const COLD_AISLE = {
  width: 6.0,          // Mesma largura das estantes
  depth: 3.5,          // 3.50m de profundidade (distância até a colmeia)
  height: 2.4,         // Mesma altura
  wallThickness: 0.1,
}

const SHELF = {
  length: 3.0,
  height: 2.4,
  depth: 0.6,
  spacing: 0.0,  // Estantes JUNTAS (coladas)
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
  honeycomb: '#8B6914',     // Colmeia evaporativa (marrom/dourado)
  honeycombFrame: '#5a4a3a', // Moldura da colmeia
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
// COMPONENTE: Estante com Compensado e Máquinas Vazando
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
  const plywoodThickness = 0.018 // 18mm compensado
  
  // Posição do compensado (fundo da estante)
  const plywoodZ = SHELF.depth / 2 - plywoodThickness / 2
  
  // Posição das ASICs - 30% vazando para fora do compensado (lado quente)
  const protrusion = ASIC.depth * 0.30 // 30% para fora
  const asicZ = plywoodZ + protrusion - ASIC.depth / 2

  return (
    <group position={position}>
      {/* Estrutura metálica simplificada */}
      {/* Colunas */}
      {[-SHELF.length / 2, 0, SHELF.length / 2].map((x, i) => (
        <mesh key={`col-${i}`} position={[x, SHELF.height / 2, -SHELF.depth / 2 + 0.02]}>
          <boxGeometry args={[0.04, SHELF.height, 0.04]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* PAREDE DE COMPENSADO (fundo - vai até o CHÃO, funciona como parede) */}
      <mesh position={[0, SHELF.height / 2, plywoodZ]}>
        <boxGeometry args={[SHELF.length, SHELF.height, plywoodThickness]} />
        <meshStandardMaterial color="#a0865a" metalness={0.1} roughness={0.8} />
      </mesh>

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
            {/* ASICs - VAZANDO pelo compensado (30% para fora) */}
            {Array.from({ length: machinesPerLevel }).map((_, m) => {
              const machineX = startX + m * (ASIC.width + gap)
              return (
                <SimpleASIC
                  key={`asic-${level}-${m}`}
                  position={[machineX, levelY + ASIC.height / 2 + 0.003, asicZ]}
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
// COMPONENTE: Colmeia Evaporativa (Evaporative Panel)
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
  const panelThickness = 0.15 // 15cm de espessura da colmeia
  const frameSize = 0.08 // Moldura
  
  return (
    <group position={position}>
      {/* Moldura externa */}
      <mesh position={[0, 0, -panelThickness / 2 - 0.01]}>
        <boxGeometry args={[width + frameSize * 2, height + frameSize * 2, 0.05]} />
        <meshStandardMaterial color={COLORS.honeycombFrame} metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Painel principal da colmeia (textura de colmeia) */}
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
      
      {/* Padrão de colmeia - linhas verticais simulando a textura */}
      {Array.from({ length: Math.floor(width / 0.1) }).map((_, i) => (
        <mesh 
          key={`v-${i}`} 
          position={[-width / 2 + 0.05 + i * 0.1, 0, panelThickness / 2 + 0.001]}
        >
          <boxGeometry args={[0.005, height, 0.002]} />
          <meshStandardMaterial color="#6B5214" />
        </mesh>
      ))}
      
      {/* Linhas horizontais */}
      {Array.from({ length: Math.floor(height / 0.1) }).map((_, i) => (
        <mesh 
          key={`h-${i}`} 
          position={[0, -height / 2 + 0.05 + i * 0.1, panelThickness / 2 + 0.001]}
        >
          <boxGeometry args={[width, 0.005, 0.002]} />
          <meshStandardMaterial color="#6B5214" />
        </mesh>
      ))}
      
      {/* Label */}
      <Text
        position={[0, -height / 2 - 0.2, 0]}
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

      {/* ========== TETO (METADE - cobre as MÁQUINAS no fundo) ========== */}
      {/* Metade TRASEIRA do teto (cobre as estantes/máquinas) */}
      <GalvanizedWall
        position={[0, ROOM.height, ROOM.depth / 4]}
        size={[ROOM.width, ROOM.wallThickness, ROOM.depth / 2]}
      />
      {/* Metade FRONTAL ABERTA (perto da porta - ar circula) */}

      {/* ========== PAREDE FRONTAL (com porta e abertura em cima) ========== */}
      {(() => {
        const topVentStartY = ROOM.height - ROOM.ventFromCeiling - ROOM.topVentHeight
        const sideWallHeight = topVentStartY  // Altura das paredes laterais (até a abertura)
        return (
          <>
            {/* Lado esquerdo da porta (até altura da abertura) */}
            <GalvanizedWall
              position={[
                -ROOM.width / 4 - ROOM.doorWidth / 4,
                sideWallHeight / 2,
                -ROOM.depth / 2
              ]}
              size={[ROOM.width / 2 - ROOM.doorWidth / 2, sideWallHeight, ROOM.wallThickness]}
            />
            {/* Lado direito da porta (até altura da abertura) */}
            <GalvanizedWall
              position={[
                ROOM.width / 4 + ROOM.doorWidth / 4,
                sideWallHeight / 2,
                -ROOM.depth / 2
              ]}
              size={[ROOM.width / 2 - ROOM.doorWidth / 2, sideWallHeight, ROOM.wallThickness]}
            />
            {/* Faixa bem no topo (acima da abertura) */}
            <GalvanizedWall
              position={[0, ROOM.height - ROOM.ventFromCeiling / 2, -ROOM.depth / 2]}
              size={[ROOM.width, ROOM.ventFromCeiling, ROOM.wallThickness]}
            />
            {/* Em cima da porta (entre porta e abertura) */}
            <GalvanizedWall
              position={[0, ROOM.doorHeight + (topVentStartY - ROOM.doorHeight) / 2, -ROOM.depth / 2]}
              size={[ROOM.doorWidth + 0.2, topVentStartY - ROOM.doorHeight, ROOM.wallThickness]}
            />
          </>
        )
      })()}
      {/* Porta */}
      <Door position={[0, 0, -ROOM.depth / 2 + 0.1]} />

      {/* ========== PAREDES LATERAIS (com aberturas PERTO DO TETO) ========== */}
      {/* Altura da parte sólida inferior (até onde começa a abertura) */}
      {(() => {
        const ventStartY = ROOM.height - ROOM.ventFromCeiling - ROOM.ventHeight
        const solidBottomHeight = ventStartY
        return (
          <>
            {/* Lateral Esquerda - Parte inferior (sólida) */}
            <GalvanizedWall
              position={[-ROOM.width / 2, solidBottomHeight / 2, 0]}
              size={[ROOM.wallThickness, solidBottomHeight, ROOM.depth]}
            />
            {/* Lateral Esquerda - Parte superior (acima da abertura) */}
            <GalvanizedWall
              position={[-ROOM.width / 2, ROOM.height - ROOM.ventFromCeiling / 2, 0]}
              size={[ROOM.wallThickness, ROOM.ventFromCeiling, ROOM.depth]}
            />

            {/* Lateral Direita - Parte inferior (sólida) */}
            <GalvanizedWall
              position={[ROOM.width / 2, solidBottomHeight / 2, 0]}
              size={[ROOM.wallThickness, solidBottomHeight, ROOM.depth]}
            />
            {/* Lateral Direita - Parte superior (acima da abertura) */}
            <GalvanizedWall
              position={[ROOM.width / 2, ROOM.height - ROOM.ventFromCeiling / 2, 0]}
              size={[ROOM.wallThickness, ROOM.ventFromCeiling, ROOM.depth]}
            />
          </>
        )
      })()}

      {/* ========== ESTANTES NO FUNDO (substituem a parede de tijolo) ========== */}
      {/* Estantes juntas/coladas formando uma "parede" com compensado */}
      <SimpleShelf position={[-SHELF.length / 2, 0, ROOM.depth / 2 - SHELF.depth / 2]} />
      <SimpleShelf position={[SHELF.length / 2, 0, ROOM.depth / 2 - SHELF.depth / 2]} />

      {/* ========== CHAPA NO PISO (apenas na frente das estantes) ========== */}
      <mesh position={[0, 0.02, ROOM.depth / 2 - SHELF.depth / 2]}>
        <boxGeometry args={[ROOM.width, 0.05, SHELF.depth + 0.2]} />
        <meshStandardMaterial color={COLORS.galvanized} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* ========== PAREDES LATERAIS TRASEIRAS (fecham os lados atrás das estantes) ========== */}
      {/* Lado esquerdo - parede entre lateral e estante */}
      <GalvanizedWall
        position={[
          -ROOM.width / 2 + (ROOM.width / 2 - SHELF.length) / 2,
          ROOM.height / 2,
          ROOM.depth / 2 - SHELF.depth / 2
        ]}
        size={[ROOM.width / 2 - SHELF.length, ROOM.height, ROOM.wallThickness]}
      />
      {/* Lado direito - parede entre lateral e estante */}
      <GalvanizedWall
        position={[
          ROOM.width / 2 - (ROOM.width / 2 - SHELF.length) / 2,
          ROOM.height / 2,
          ROOM.depth / 2 - SHELF.depth / 2
        ]}
        size={[ROOM.width / 2 - SHELF.length, ROOM.height, ROOM.wallThickness]}
      />

      {/* ========== LADO QUENTE (atrás das estantes) - ABERTO para ar sair ========== */}
      {/* Sem parede no fundo - ar quente sai livremente */}

      {/* ========== SETAS DE FLUXO DE AR - HOT AISLE ========== */}
      {/* Ar quente saindo pelas laterais (perto do teto) */}
      <AirflowArrow start={[1, ROOM.height - 0.8, ROOM.depth / 4]} end={[ROOM.width / 2 + 0.5, ROOM.height - 0.8, ROOM.depth / 4]} color={COLORS.hotAir} />
      <AirflowArrow start={[-1, ROOM.height - 0.8, ROOM.depth / 4]} end={[-ROOM.width / 2 - 0.5, ROOM.height - 0.8, ROOM.depth / 4]} color={COLORS.hotAir} />
      
      {/* Ar quente saindo em cima da porta */}
      <AirflowArrow start={[0, ROOM.height - 0.6, 0]} end={[0, ROOM.height - 0.6, -ROOM.depth / 2 - 0.5]} color={COLORS.hotAir} />

      {/* ================================================================ */}
      {/* ========== COLD AISLE - ATRÁS DAS MÁQUINAS (lado do compensado) ========== */}
      {/* ================================================================ */}
      {(() => {
        // Cold aisle fica ATRÁS das estantes (onde o compensado está)
        // O compensado é o lado FRIO - onde as máquinas SUGAM ar
        const shelfBackZ = ROOM.depth / 2 // Fundo das estantes (compensado)
        const coldAisleZ = shelfBackZ + COLD_AISLE.depth / 2 // Centro do cold aisle
        const colmeiaZ = shelfBackZ + COLD_AISLE.depth // Parede com colmeia
        
        return (
          <group>
            {/* PISO do Cold Aisle */}
            <mesh position={[0, -0.05, coldAisleZ]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[COLD_AISLE.width, COLD_AISLE.depth]} />
              <meshStandardMaterial color={COLORS.floor} roughness={0.9} />
            </mesh>

            {/* TETO do Cold Aisle (completamente fechado) */}
            <GalvanizedWall
              position={[0, COLD_AISLE.height, coldAisleZ]}
              size={[COLD_AISLE.width, ROOM.wallThickness, COLD_AISLE.depth]}
            />

            {/* PAREDE LATERAL ESQUERDA (completamente fechada) */}
            <GalvanizedWall
              position={[-COLD_AISLE.width / 2, COLD_AISLE.height / 2, coldAisleZ]}
              size={[ROOM.wallThickness, COLD_AISLE.height, COLD_AISLE.depth]}
            />

            {/* PAREDE LATERAL DIREITA (completamente fechada) */}
            <GalvanizedWall
              position={[COLD_AISLE.width / 2, COLD_AISLE.height / 2, coldAisleZ]}
              size={[ROOM.wallThickness, COLD_AISLE.height, COLD_AISLE.depth]}
            />

            {/* PAREDE COM COLMEIA EVAPORATIVA (no final do cold aisle) */}
            <EvaporativePanel
              position={[0, COLD_AISLE.height / 2, colmeiaZ]}
              width={COLD_AISLE.width - 0.4}
              height={COLD_AISLE.height - 0.3}
            />

            {/* Moldura ao redor da colmeia */}
            {/* Parte inferior */}
            <GalvanizedWall
              position={[0, 0.075, colmeiaZ]}
              size={[COLD_AISLE.width, 0.15, ROOM.wallThickness]}
            />
            {/* Parte superior */}
            <GalvanizedWall
              position={[0, COLD_AISLE.height - 0.075, colmeiaZ]}
              size={[COLD_AISLE.width, 0.15, ROOM.wallThickness]}
            />
            {/* Lateral esquerda */}
            <GalvanizedWall
              position={[-COLD_AISLE.width / 2 + 0.1, COLD_AISLE.height / 2, colmeiaZ]}
              size={[0.2, COLD_AISLE.height, ROOM.wallThickness]}
            />
            {/* Lateral direita */}
            <GalvanizedWall
              position={[COLD_AISLE.width / 2 - 0.1, COLD_AISLE.height / 2, colmeiaZ]}
              size={[0.2, COLD_AISLE.height, ROOM.wallThickness]}
            />

            {/* SETAS - Ar frio da colmeia → máquinas */}
            <AirflowArrow 
              start={[0, 1.2, colmeiaZ - 0.3]} 
              end={[0, 1.2, shelfBackZ + 0.1]} 
              color={COLORS.coldAir} 
            />
            <AirflowArrow 
              start={[-1.5, 1.2, colmeiaZ - 0.3]} 
              end={[-1.5, 1.2, shelfBackZ + 0.1]} 
              color={COLORS.coldAir} 
            />
            <AirflowArrow 
              start={[1.5, 1.2, colmeiaZ - 0.3]} 
              end={[1.5, 1.2, shelfBackZ + 0.1]} 
              color={COLORS.coldAir} 
            />

            {/* Label do Cold Aisle */}
            <Text
              position={[0, COLD_AISLE.height + 0.3, coldAisleZ]}
              fontSize={0.18}
              color={COLORS.coldAir}
              anchorX="center"
            >
              🧊 COLD AISLE - AMBIENTE REFRIGERADO (FECHADO)
            </Text>
            
            {/* Label da colmeia */}
            <Text
              position={[0, 0.3, colmeiaZ + 0.3]}
              fontSize={0.15}
              color={COLORS.coldAir}
              anchorX="center"
            >
              🟢 AR FRIO DA COLMEIA
            </Text>

            {/* ========== CAIXA DE 3 PAREDES ATRÁS DA COLMEIA (SEM TELHADO) ========== */}
            {/* Para esconder a colmeia e abafar o som das máquinas */}
            {(() => {
              const boxDepth = 1.5 // Profundidade da caixa (1.5m para fora)
              const boxHeight = COLD_AISLE.height // Mesma altura
              const boxWidth = COLD_AISLE.width + 0.4 // Um pouco mais larga
              const boxZ = colmeiaZ + boxDepth / 2 + 0.1 // Posição Z da caixa
              const doorWidth = 0.9 // Largura da porta
              const doorHeight = 2.1 // Altura da porta
              
              return (
                <group>
                  {/* PAREDE TRASEIRA (fundo da caixa) - COM ABERTURA PARA PORTA */}
                  {/* Lado esquerdo da porta */}
                  <GalvanizedWall
                    position={[-(boxWidth / 4 + doorWidth / 4), boxHeight / 2, colmeiaZ + boxDepth]}
                    size={[boxWidth / 2 - doorWidth / 2, boxHeight, ROOM.wallThickness]}
                  />
                  {/* Lado direito da porta */}
                  <GalvanizedWall
                    position={[(boxWidth / 4 + doorWidth / 4), boxHeight / 2, colmeiaZ + boxDepth]}
                    size={[boxWidth / 2 - doorWidth / 2, boxHeight, ROOM.wallThickness]}
                  />
                  {/* Em cima da porta */}
                  <GalvanizedWall
                    position={[0, doorHeight + (boxHeight - doorHeight) / 2, colmeiaZ + boxDepth]}
                    size={[doorWidth + 0.1, boxHeight - doorHeight, ROOM.wallThickness]}
                  />
                  
                  {/* PORTA DA CAIXA ACÚSTICA (acesso externo para limpeza) */}
                  <group position={[0, 0, colmeiaZ + boxDepth + 0.05]}>
                    {/* Moldura */}
                    <mesh position={[0, doorHeight / 2, 0]}>
                      <boxGeometry args={[doorWidth + 0.1, doorHeight + 0.1, 0.08]} />
                      <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.4} />
                    </mesh>
                    {/* Porta */}
                    <mesh position={[0, doorHeight / 2, 0.02]}>
                      <boxGeometry args={[doorWidth, doorHeight, 0.05]} />
                      <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
                    </mesh>
                    {/* Maçaneta */}
                    <mesh position={[doorWidth / 2 - 0.15, doorHeight / 2, 0.05]}>
                      <boxGeometry args={[0.1, 0.03, 0.05]} />
                      <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
                    </mesh>
                    {/* Label */}
                    <Text
                      position={[0, doorHeight + 0.15, 0]}
                      fontSize={0.08}
                      color="#fbbf24"
                      anchorX="center"
                    >
                      🚪 ACESSO LIMPEZA/MANUTENÇÃO
                    </Text>
                  </group>
                  
                  {/* PAREDE LATERAL ESQUERDA */}
                  <GalvanizedWall
                    position={[-boxWidth / 2, boxHeight / 2, boxZ]}
                    size={[ROOM.wallThickness, boxHeight, boxDepth]}
                  />
                  
                  {/* PAREDE LATERAL DIREITA */}
                  <GalvanizedWall
                    position={[boxWidth / 2, boxHeight / 2, boxZ]}
                    size={[ROOM.wallThickness, boxHeight, boxDepth]}
                  />
                  
                  {/* PISO da caixa */}
                  <mesh position={[0, 0.02, boxZ]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[boxWidth, boxDepth]} />
                    <meshStandardMaterial color={COLORS.floor} roughness={0.9} />
                  </mesh>
                  
                  {/* SEM TELHADO - aberto em cima */}
                  
                  {/* Label */}
                  <Text
                    position={[0, boxHeight + 0.2, boxZ]}
                    fontSize={0.12}
                    color="#94a3b8"
                    anchorX="center"
                  >
                    🔇 CAIXA ACÚSTICA (SEM TELHADO)
                  </Text>
                </group>
              )
            })()}
            
            {/* ========== PORTA DE ACESSO AO COLD AISLE (lateral) ========== */}
            {(() => {
              const doorWidth = 0.9
              const doorHeight = 2.1
              const doorZ = coldAisleZ // No meio do cold aisle
              
              return (
                <group>
                  {/* Abertura na parede lateral direita do cold aisle */}
                  {/* A parede lateral direita precisa ter uma abertura para a porta */}
                  
                  {/* PORTA DO COLD AISLE (acesso interno) */}
                  <group position={[COLD_AISLE.width / 2 + 0.05, 0, doorZ]} rotation={[0, Math.PI / 2, 0]}>
                    {/* Moldura */}
                    <mesh position={[0, doorHeight / 2, 0]}>
                      <boxGeometry args={[doorWidth + 0.1, doorHeight + 0.1, 0.08]} />
                      <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.4} />
                    </mesh>
                    {/* Porta */}
                    <mesh position={[0, doorHeight / 2, 0.02]}>
                      <boxGeometry args={[doorWidth, doorHeight, 0.05]} />
                      <meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.4} />
                    </mesh>
                    {/* Maçaneta */}
                    <mesh position={[doorWidth / 2 - 0.15, doorHeight / 2, 0.05]}>
                      <boxGeometry args={[0.1, 0.03, 0.05]} />
                      <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
                    </mesh>
                    {/* Label */}
                    <Text
                      position={[0, doorHeight + 0.15, 0]}
                      fontSize={0.08}
                      color="#22c55e"
                      anchorX="center"
                    >
                      🚪 ACESSO COLD AISLE
                    </Text>
                  </group>
                </group>
              )
            })()}
          </group>
        )
      })()}

      {/* ========== LABELS ========== */}
      <Text
        position={[-ROOM.width / 2 - 0.3, ROOM.height - 0.8, 0]}
        fontSize={0.12}
        color={COLORS.hotAir}
        anchorX="center"
        rotation={[0, Math.PI / 2, 0]}
      >
        🔴 SAÍDA AR QUENTE
      </Text>
      <Text
        position={[ROOM.width / 2 + 0.3, ROOM.height - 0.8, 0]}
        fontSize={0.12}
        color={COLORS.hotAir}
        anchorX="center"
        rotation={[0, -Math.PI / 2, 0]}
      >
        🔴 SAÍDA AR QUENTE
      </Text>
      <Text
        position={[0, ROOM.height - 0.3, -ROOM.depth / 2 - 0.3]}
        fontSize={0.1}
        color={COLORS.hotAir}
        anchorX="center"
      >
        🔴 SAÍDA (cima porta)
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
