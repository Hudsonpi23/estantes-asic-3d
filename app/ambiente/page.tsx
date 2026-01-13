'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const AmbienteCompleto3D = dynamic(
  () => import('@/components/AmbienteCompleto3D'),
  { ssr: false }
)

export default function AmbientePage() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <h1>🏭 Sala de Mineração - Ambiente Completo</h1>
          <nav className="nav-buttons">
            <Link href="/" className="nav-btn">
              🖥️ Modelo Completo
            </Link>
            <Link href="/serralheiro" className="nav-btn">
              🔩 Visão Serralheiro
            </Link>
            <Link href="/ambiente" className="nav-btn active">
              🏭 Ambiente
            </Link>
          </nav>
        </div>
        <p>Sala fechada com saída de ar lateral • Hot Aisle / Cold Aisle</p>
      </header>
      
      <main className="main-content">
        <div className="canvas-container">
          <AmbienteCompleto3D />
        </div>
        
        <aside className="controls-panel">
          <h2>📋 Especificações da Sala</h2>
          
          <div className="spec-section">
            <h3>Dimensões do Ambiente</h3>
            <ul className="spec-list">
              <li><strong>Largura:</strong> ~8,00 m</li>
              <li><strong>Profundidade:</strong> ~4,00 m</li>
              <li><strong>Altura:</strong> ~3,50 m</li>
            </ul>
          </div>
          
          <div className="spec-section">
            <h3>Paredes</h3>
            <ul className="spec-list">
              <li><strong>Material:</strong> Telha galvanizada</li>
              <li><strong>Frente:</strong> Fechada com porta</li>
              <li><strong>Fundo:</strong> Fechada (tijolo)</li>
              <li><strong>Laterais:</strong> Aberturas para ar</li>
            </ul>
          </div>
          
          <div className="spec-section">
            <h3>Fluxo de Ar</h3>
            <ul className="spec-list">
              <li><strong>Entrada (Frio):</strong> Frente das estantes</li>
              <li><strong>Saída (Quente):</strong> Laterais abertas</li>
              <li><strong>Sistema:</strong> Hot Aisle / Cold Aisle</li>
            </ul>
          </div>
          
          <div className="note-box">
            <strong>🌡️ FLUXO DE AR:</strong><br/>
            Ar frio entra pela frente → ASICs aquecem → Ar quente sai pelas laterais
          </div>
        </aside>
      </main>
      
      <style jsx>{`
        .spec-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #2a2a4a;
        }
        .spec-section h3 {
          color: #f97316;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .spec-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .spec-list li {
          color: #94a3b8;
          font-size: 0.85rem;
          padding: 0.25rem 0;
        }
        .spec-list strong {
          color: #e2e8f0;
        }
        .note-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 1rem;
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  )
}
