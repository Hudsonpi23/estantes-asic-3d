'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const ColdAisleInterno3D = dynamic(
  () => import('@/components/ColdAisleInterno3D'),
  { ssr: false }
)

export default function ColdAislePage() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <h1>🧊 Cold Aisle - Vista Interna</h1>
          <nav className="nav-buttons">
            <Link href="/" className="nav-btn">
              🖥️ Modelo Completo
            </Link>
            <Link href="/serralheiro" className="nav-btn">
              🔩 Visão Serralheiro
            </Link>
            <Link href="/ambiente" className="nav-btn">
              🏭 Ambiente
            </Link>
            <Link href="/cold-aisle" className="nav-btn active">
              🧊 Cold Aisle
            </Link>
          </nav>
        </div>
        <p>Vista interna da sala refrigerada • Colmeia evaporativa + Estantes</p>
      </header>

      <main className="main-content">
        <div className="canvas-container">
          <ColdAisleInterno3D />
        </div>

        <aside className="controls-panel">
          <h2>📋 Cold Aisle - Especificações</h2>
          
          <div className="spec-section">
            <h3>📐 Dimensões</h3>
            <ul>
              <li><strong>Largura:</strong> 6.0 m</li>
              <li><strong>Profundidade:</strong> 3.5 m</li>
              <li><strong>Altura:</strong> 2.4 m</li>
            </ul>
          </div>

          <div className="spec-section">
            <h3>🐝 Colmeia Evaporativa</h3>
            <ul>
              <li><strong>Função:</strong> Resfriamento evaporativo</li>
              <li><strong>Posição:</strong> Parede frontal</li>
              <li><strong>Área:</strong> ~5.6m x 2.1m</li>
            </ul>
          </div>

          <div className="spec-section">
            <h3>🌡️ Fluxo de Ar</h3>
            <ul>
              <li>🟢 Ar frio entra pela colmeia</li>
              <li>💨 Atravessa o cold aisle</li>
              <li>📦 Máquinas sugam o ar frio</li>
              <li>🔴 Expelem ar quente no hot aisle</li>
            </ul>
          </div>

          <div className="spec-section">
            <h3>✅ Características</h3>
            <ul>
              <li>Ambiente 100% fechado</li>
              <li>Sem entrada de ar externo</li>
              <li>Refrigeração por evaporação</li>
              <li>Pressão positiva no cold aisle</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}
