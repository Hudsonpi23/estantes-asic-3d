'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const ProjetoSerralheiro3D = dynamic(
  () => import('@/components/ProjetoSerralheiro3D'),
  { ssr: false }
)

export default function SerralheiroPage() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <h1>🔩 Projeto Estantes - VISÃO DO SERRALHEIRO</h1>
          <nav className="nav-buttons">
            <Link href="/" className="nav-btn">
              🖥️ Modelo Completo
            </Link>
            <Link href="/serralheiro" className="nav-btn active">
              🔩 Visão Serralheiro
            </Link>
            <Link href="/ambiente" className="nav-btn">
              🏭 Ambiente
            </Link>
            <Link href="/cold-aisle" className="nav-btn">
              🧊 Cold Aisle
            </Link>
          </nav>
        </div>
        <p>Estrutura metálica para montagem • Compensado sem aberturas</p>
      </header>
      
      <main className="main-content">
        <div className="canvas-container">
          <ProjetoSerralheiro3D />
        </div>
        
        <aside className="controls-panel">
          <h2>📋 Especificações</h2>
          
          <div className="spec-section">
            <h3>Dimensões Gerais</h3>
            <ul className="spec-list">
              <li><strong>Comprimento:</strong> 3,00 m</li>
              <li><strong>Altura Total:</strong> 2,40 m</li>
              <li><strong>Altura dos Pés:</strong> 0,60 m</li>
              <li><strong>Profundidade:</strong> 0,60 m</li>
            </ul>
          </div>
          
          <div className="spec-section">
            <h3>Estrutura</h3>
            <ul className="spec-list">
              <li><strong>Níveis:</strong> 5 prateleiras</li>
              <li><strong>Altura por nível:</strong> 35 cm</li>
              <li><strong>Metalon:</strong> 40mm x 40mm</li>
              <li><strong>Colunas:</strong> 6 (4 cantos + 2 meio)</li>
            </ul>
          </div>
          
          <div className="spec-section">
            <h3>Compensado (Fundo)</h3>
            <ul className="spec-list">
              <li><strong>Espessura:</strong> 18mm</li>
              <li><strong>Largura:</strong> ~2,92 m</li>
              <li><strong>Altura:</strong> ~1,75 m</li>
              <li><strong>Aberturas:</strong> Fazer no local</li>
            </ul>
          </div>
          
          <div className="spec-section">
            <h3>Conduítes (Frente)</h3>
            <ul className="spec-list">
              <li><strong>Diâmetro:</strong> 50mm</li>
              <li><strong>Quantidade:</strong> 5 por estante</li>
              <li><strong>Abraçadeiras:</strong> 7 por nível</li>
            </ul>
          </div>
          
          <div className="note-box">
            <strong>⚠️ NOTA:</strong> As aberturas no compensado serão feitas no local após posicionar as máquinas.
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
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid #f97316;
          border-radius: 8px;
          padding: 1rem;
          color: #f97316;
          font-size: 0.85rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  )
}
