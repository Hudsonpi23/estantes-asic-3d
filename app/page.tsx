'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Link from 'next/link'

// Importação dinâmica para evitar erros de SSR com Three.js
const ProjetoEstantes3D = dynamic(
  () => import('@/components/ProjetoEstantes3D'),
  { ssr: false }
)

export default function Home() {
  // ========================================
  // PARÂMETROS EDITÁVEIS - Altere aqui!
  // ========================================
  const [numLevels, setNumLevels] = useState(5)           // Número de níveis/fileiras por estante
  const [machinesPerLevel, setMachinesPerLevel] = useState(11) // Máquinas por nível
  const [shelfDepth, setShelfDepth] = useState(0.60)      // Profundidade da estante (m)
  const [conduitDia, setConduitDia] = useState(0.05)      // Diâmetro do conduíte (m)
  const [gap, setGap] = useState(0.05)                    // Espaçamento entre máquinas (m)

  // Cálculos derivados
  const totalMachines = numLevels * machinesPerLevel * 2  // 2 estantes
  const totalOutlets = totalMachines * 2                  // 2 tomadas por máquina
  const clampsPerLevel = 7
  const totalClamps = clampsPerLevel * numLevels * 2      // 2 estantes

  return (
    <div className="container">
      <header className="header">
        <div className="header-top">
          <h1>🔧 Projeto Estantes ASIC - Modelo 3D Paramétrico</h1>
          <nav className="nav-buttons">
            <Link href="/" className="nav-btn active">
              🖥️ Modelo Completo
            </Link>
            <Link href="/serralheiro" className="nav-btn">
              🔩 Visão Serralheiro
            </Link>
            <Link href="/ambiente" className="nav-btn">
              🏭 Ambiente
            </Link>
          </nav>
        </div>
        <p>Estrutura metálica para 110 Antminer S19k Pro • Lado frio + Lado quente</p>
      </header>

      <div className="main-content">
        <div className="canvas-container">
          <ProjetoEstantes3D
            numLevels={numLevels}
            machinesPerLevel={machinesPerLevel}
            shelfDepth={shelfDepth}
            conduitDia={conduitDia}
            gap={gap}
          />
        </div>

        <aside className="controls-panel">
          <h2>⚙️ Parâmetros</h2>

          <div className="control-group">
            <label>Níveis por Estante</label>
            <input
              type="range"
              min="1"
              max="8"
              value={numLevels}
              onChange={(e) => setNumLevels(Number(e.target.value))}
            />
            <div className="control-value">{numLevels} níveis</div>
          </div>

          <div className="control-group">
            <label>Máquinas por Nível</label>
            <input
              type="range"
              min="1"
              max="15"
              value={machinesPerLevel}
              onChange={(e) => setMachinesPerLevel(Number(e.target.value))}
            />
            <div className="control-value">{machinesPerLevel} máquinas</div>
          </div>

          <div className="control-group">
            <label>Profundidade (m)</label>
            <input
              type="range"
              min="0.4"
              max="1.0"
              step="0.05"
              value={shelfDepth}
              onChange={(e) => setShelfDepth(Number(e.target.value))}
            />
            <div className="control-value">{shelfDepth.toFixed(2)} m</div>
          </div>

          <div className="control-group">
            <label>Diâmetro Conduíte (mm)</label>
            <input
              type="range"
              min="30"
              max="80"
              step="5"
              value={conduitDia * 1000}
              onChange={(e) => setConduitDia(Number(e.target.value) / 1000)}
            />
            <div className="control-value">{(conduitDia * 1000).toFixed(0)} mm</div>
          </div>

          <div className="control-group">
            <label>Gap entre Máquinas (cm)</label>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={gap * 100}
              onChange={(e) => setGap(Number(e.target.value) / 100)}
            />
            <div className="control-value">{(gap * 100).toFixed(0)} cm</div>
          </div>

          <div className="stats-box">
            <h3>📊 Estatísticas</h3>
            <div className="stat-item">
              <span>Total de Máquinas</span>
              <span>{totalMachines}</span>
            </div>
            <div className="stat-item">
              <span>Total de Tomadas</span>
              <span>{totalOutlets}</span>
            </div>
            <div className="stat-item">
              <span>Braçadeiras</span>
              <span>{totalClamps}</span>
            </div>
            <div className="stat-item">
              <span>Estantes</span>
              <span>2</span>
            </div>
          </div>

          <div className="legend">
            <h3>Legenda</h3>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#4a5568' }}></div>
              <span>Estrutura metálica</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#1a1a1a' }}></div>
              <span>ASICs (máquinas)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#f97316' }}></div>
              <span>Conduíte PVC (lado frio)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#22c55e' }}></div>
              <span>Caixas de tomada</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#94a3b8' }}></div>
              <span>Chapa galvanizada (lado quente)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#ef4444' }}></div>
              <span>Recortes (saída de ar)</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
