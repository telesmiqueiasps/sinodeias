# DESIGN.md — Editorial Precision & Fluid Motion

## 1. Direção Estética
Interface minimalista, editorial e de alto contraste. Zero poluição visual, zero gradientes roxos genéricos. O impacto visual vem de **tipografia grande com espaçamento negativo (tracking apertado)**, **fotografia/mídia limpa**, **grids rígidos de 8px** e **animações com física suave**.

---

## 2. Paleta de Cores (Regra 60-30-10)

### Modo Claro (Base Editorial)
- **Background Principal (60%):** `#FFFFFF` (puro) ou `#F8F9FA` (off-white sutil)
- **Superfícies / Cards (30%):** `#F1F3F5` ou vidro fosco `rgba(255, 255, 255, 0.85)` com `backdrop-filter: blur(12px)`
- **Texto Primário:** `#09090B` (grafite profundo, nunca cinza lavado)
- **Texto Secundário:** `#52525B`
- **Accent / Destaque (10%):** `#0057FF` (azul elétrico de alta precisão) — Hover: `#0044CC`
- **Bordas Sutis:** `1px solid rgba(9, 9, 11, 0.08)`

### Modo Escuro (Seções de Contraste / Hero)
- **Background:** `#09090B` ou `#121214` (evitar `#000000` chapado em grandes blocos)
- **Superfícies:** `#18181B`
- **Texto Primário:** `#FAFAFA`
- **Bordas Sutis:** `1px solid rgba(255, 255, 255, 0.12)`

---

## 3. Tipografia & Hierarquia
- **Display / Títulos (Sans-Serif Geométrica):** `Inter`, `Plus Jakarta Sans` ou `Neue Haas Grotesk`
  - **Hero H1:** `clamp(2.75rem, 6vw, 5.25rem)` | `font-weight: 400` ou `500` | `line-height: 1.05` | `letter-spacing: -0.04em`
  - **Section H2:** `clamp(2rem, 4vw, 3.25rem)` | `font-weight: 500` | `line-height: 1.1` | `letter-spacing: -0.03em`
- **Marca / Detalhe Editorial (Opcional):** Serifada fina (`Cormorant Garamond` ou `Playfair Display`) apenas para o logotipo ou pequenos destaques.
- **Corpo de Texto:** `1rem` a `1.125rem` | `line-height: 1.6` | máximo de `60ch` de largura por linha.
- **Micro-labels / Badges:** `0.75rem` | `uppercase` | `letter-spacing: 0.08em`.

---

## 4. Layout, Grid & Componentes

- **Grid & Ritmo:** Sistema estrito baseado em múltiplos de `4px` e `8px`. Espaçamento vertical generoso entre seções (`py-24` a `py-32`).
- **Hero Emoldurado ou Full-Bleed:**
  - *Opção A (Framed):* Container principal com margem externa de `12px` a `20px` sobre fundo branco e `border-radius: 20px` a `24px`.
  - *Opção B (Full-Bleed):* Mídia ocupando `100vw` x `100vh` com título ancorado no canto inferior esquerdo e CTA ancorado no canto inferior direito.
- **Navegação Flutuante:** Navbar limpa em formato de pílula branca flutuante (`rounded-full`, `shadow-sm`) ou barra superior transparente com recorte centralizado (*notch*) para o logo.
- **Botões (Padrão Agência):**
  - *Estilo Pílula Dupla:* Botão principal em pílula (`rounded-full`) acompanhado de um botão circular separado ao lado contendo apenas a seta (`↗` ou `→`). No hover, a seta faz rotação/deslocamento sutil.
  - *Estilo Bloco Técnico:* Retângulo azul elétrico (`rounded-lg`, `padding: 16px 24px`) com texto alinhado à esquerda e seta ancorada no canto inferior direito.
- **Cards:** Cantos arredondados (`12px` a `16px`), borda translúcida de `1px`, sombras amplas e suaves (`0 20px 40px -15px rgba(0,0,0,0.08)`).

---

## 5. Engenharia de Animações (Motion System)
**PROIBIDO:** Animações genéricas de `bounce`, `fade-in` seco ou transições lineares.

### Stack Obrigatória
- **Scroll Suave:** `Lenis` (`@studio-freight/lenis` ou `lenis`) configurado globalmente para dar sensação de peso e fluidez ao rolar a página.
- **Animações de UI & Scroll:** `Framer Motion` (React/Next.js) ou `GSAP` + `ScrollTrigger` (HTML/JS ou React).

### Curvas de Easing (O segredo da fluidez)
- **Entrada de elementos / Texto:** `cubic-bezier(0.22, 1, 0.36, 1)` (duração: `0.7s` a `0.9s`).
- **Micro-interações (Hover/Botões):** `cubic-bezier(0.16, 1, 0.3, 1)` (duração: `200ms` a `300ms`).

### Padrões de Movimento para Implementar
1. **Masked Text Reveal (Títulos):** Cada linha do H1/H2 fica dentro de um container com `overflow: hidden` e sobe de `translateY(110%)` para `0%` com *stagger* de `0.08s` entre linhas.
2. **Carrossel em Perspectiva 3D:** Cards dispostos em arco/cilindro usando `perspective: 1200px` e `rotateY()` calculado conforme a posição do item em relação ao centro, respondendo ao arrasto ou scroll.
3. **Parallax Sutil em Mídia:** Imagens de fundo com `scale(1.1)` que se movem levemente no eixo Y (`-5%` a `+5%`) vinculadas ao scroll.
4. **Hover Magnético / Seta Viva:** Ao passar o mouse nos botões, a seta sai pelo canto superior direito e uma segunda seta idêntica entra pelo canto inferior esquerdo simultaneamente.
5. **Performance:** Animar exclusivamente propriedades compostas pela GPU (`transform`, `opacity`, `clip-path`). Sempre respeitar `prefers-reduced-motion`.