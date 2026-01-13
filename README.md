# Prateleira 3D - Projeto Estantes ASIC

Modelo 3D paramétrico de duas estantes metálicas para acomodar 110 ASICs Antminer S19k Pro.

## 🚀 Como executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

## 📐 Especificações Técnicas

### Estante (cada uma)
- **Comprimento**: 3,00 m
- **Altura total**: 2,40 m
- **Pés (sem máquinas)**: 0,60 m
- **Altura útil**: 1,80 m
- **Níveis/fileiras**: 5
- **Altura por nível**: 0,35 m
- **Profundidade**: 0,60 m (parametrizável)

### Capacidade
- 11 máquinas por fileira
- 5 fileiras por estante → 55 máquinas/estante
- 2 estantes → **110 máquinas total**

### Lado Frio (Frente)
- Conduíte PVC Ø50mm ao longo de cada nível
- 7 braçadeiras por nível (a cada ~45cm)
- Caixas de tomada (2 tomadas por máquina)

### Lado Quente (Fundo)
- Chapa galvanizada cobrindo toda traseira
- Recortes individuais por máquina (saída de ar)

## ⚙️ Parâmetros Editáveis

### No painel lateral da aplicação:
- Número de níveis
- Máquinas por nível
- Profundidade da estante
- Diâmetro do conduíte
- Gap entre máquinas

### No código (`components/ProjetoEstantes3D.tsx`):
```typescript
const PARAMS = {
  shelfLength: 3.0,        // Comprimento da estante (m)
  totalHeight: 2.4,        // Altura total (m)
  feetHeight: 0.6,         // Altura dos pés (m)
  usableHeight: 1.8,       // Altura útil (m)
  levelHeight: 0.35,       // Altura por nível (m)
  
  asicW: 0.20,             // Largura ASIC (m)
  asicH: 0.29,             // Altura ASIC (m)
  asicD: 0.40,             // Profundidade ASIC (m)
  
  beamSize: 0.04,          // Perfil metálico (m)
  clampsPerLevel: 7,       // Braçadeiras por nível
  shelfSpacing: 0.8,       // Espaço entre estantes (m)
}
```

## 🎨 Legenda de Cores

| Cor | Elemento |
|-----|----------|
| 🔘 Cinza escuro | Estrutura metálica |
| ⬛ Preto | ASICs (máquinas) |
| 🟠 Laranja | Conduíte PVC |
| 🟢 Verde | Caixas de tomada |
| ⬜ Cinza claro | Chapa galvanizada |
| 🔴 Vermelho | Recortes (saída de ar) |

## 🛠️ Tecnologias

- Next.js 14
- React 18
- React Three Fiber
- @react-three/drei
- Three.js
- TypeScript
