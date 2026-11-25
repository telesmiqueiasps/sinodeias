/**
 * SINODEIAS AI CHAT ENGINE
 * Interatividade de ponta baseada no DESIGN.md:
 * - Simulação de streaming de resposta token a token
 * - Bloco de raciocínio profundo (Deep Reasoning)
 * - Síntese de voz (TTS Web Speech) e reconhecimento de fala (STT)
 * - Gerenciamento de histórico de conversas e temas
 */

// Estado da Aplicação
const state = {
  currentModel: 'Sinodeias 3.0 Ultra',
  isGenerating: false,
  activeChatId: 'chat-current',
  activeModes: {
    reasoning: true,
    webSearch: false,
    code: false
  },
  attachedFile: null,
  isRecording: false
};

// Banco de Respostas Especializadas para Demonstração Interativa
const KNOWLEDGE_BASE = {
  software: {
    reasoning: "Analisando padrões de arquitetura orientada a eventos. Avaliando throughput de Kafka, particionamento por hash de chave, idempotência de consumidores com Redis e política de outbox pattern com PostgreSQL...",
    content: `### Arquitetura de Microsserviços com Apache Kafka

Para garantir **alta resiliência** e **baixa latência** em sistemas distribuídos de escala crítica, a seguinte topologia é recomendada:

1. **Transactional Outbox Pattern**: Evita inconsistências de duas fases (2PC) salvando o evento na mesma transação de banco de dados do microsserviço produtor.
2. **Kafka Partitioning Strategy**: Distribuição com chaves consistentes para assegurar ordenação estrita por entidade (ex: \`tenant_id\` ou \`account_id\`).
3. **Dead Letter Queue (DLQ)**: Isolamento automático de mensagens corrompidas com retenção de 7 dias e alertas para SRE.

\`\`\`go
package main

import (
    "context"
    "fmt"
    "github.com/segmentio/kafka-go"
)

// DispatchEvent envia o evento com garantia de entrega At-Least-Once
func DispatchEvent(ctx context.Context, topic, key string, payload []byte) error {
    writer := kafka.NewWriter(kafka.WriterConfig{
        Brokers:      []string{"kafka-cluster.internal:9092"},
        Topic:        topic,
        Balancer:     &kafka.LeastBytes{},
        RequiredAcks: int(kafka.RequireAll), // Máxima durabilidade
    })
    defer writer.Close()

    return writer.WriteMessages(ctx, kafka.Message{
        Key:   []byte(key),
        Value: payload,
    })
}
\`\`\`

> **Nota Técnica:** O tempo médio de replicação com \`acks=all\` em cluster com 3 réplicas é inferior a **4.8ms** com compressão Snappy habilitada.`
  },

  editorial: {
    reasoning: "Carregando preceitos do DESIGN.md: minimalismo editorial, alto contraste (60-30-10), tipografia com tracking negativo e ausência de ruídos visuais. Formatando manifesto de lançamento...",
    content: `### Estratégia Editorial de Lançamento — Impacto & Rigor

Uma campanha de alta precisão baseia-se na eliminação sistemática do supérfluo para evidenciar a substância técnica:

* **Tese Central:** *"A inteligência não grita, ela executa com precisão geométrica."*
* **Paleta Predominante:** 60% Azul Marinho Profundo (\`#050B18\`), 30% Superfície Arquitetural (\`#101C38\`) e 10% Destaques de Contraste Branco Puro com acentos em Azul Elétrico (\`#0057FF\`).
* **Ritmo Tipográfico:**
  - Títulos monumentais com espaçamento apertado (\`-0.04em\`).
  - Blocos de texto contidos a \`60ch\` para ergonomia de leitura máxima.

#### Fases de Dispersão:
1. **Teaser Técnico (Semana 1):** Demonstração do benchmark de raciocínio puro sem ornamentos.
2. **Manifesto Visual (Semana 2):** Lançamento da interface fluida com motion sob curva de Bézier \`cubic-bezier(0.22, 1, 0.36, 1)\`.
3. **Acesso por Convites (Semana 3):** Onboarding seletivo para líderes de engenharia e produto.`
  },

  code: {
    reasoning: "Inspecionando planos de execução EXPLAIN ANALYZE em PostgreSQL. Identificando gargalo de sequential scan, I/O wait e lock contention em consultas analíticas...",
    content: `### Otimização Extrema de Consultas SQL (PostgreSQL / CockroachDB)

Ao analisar planos de execução onde o tempo de resposta excedeu 450ms, a causa principal frequentemente decorre de **Sequential Scans** e cálculos de junção na CPU:

\`\`\`sql
-- Antes: Custo computacional elevado O(N) com Sequential Scan
-- SELECT * FROM orders WHERE customer_id = 'c_994' AND status = 'COMPLETED' ORDER BY created_at DESC;

-- Solução: Índice Composto com Cobertura (Covering Index)
CREATE INDEX CONCURRENTLY idx_orders_customer_status_created 
ON orders (customer_id, status, created_at DESC)
INCLUDE (total_amount, currency);

-- Consulta Otimizada utilizando Index Only Scan:
EXPLAIN ANALYZE
SELECT customer_id, status, created_at, total_amount, currency
FROM orders
WHERE customer_id = 'c_994' 
  AND status = 'COMPLETED'
ORDER BY created_at DESC
LIMIT 20;
\`\`\`

**Resultados do Benchmark:**
- Latência: Redução de **380ms** para **1.8ms** (99.5% de melhora).
- Consumo de memória: Cache hit ratio elevado para **99.8%**.`
  },

  research: {
    reasoning: "Consultando bases conceituais de transformadores esparsos, modelos de raciocínio tipo test-time compute scaling (MCTS) e quantização dinâmica em 4-bits...",
    content: `### Síntese: Fronteiras em Modelos de Linguagem e Raciocínio (2026+)

A evolução dos modelos de fundação transicionou de puramente escalar parâmetros pré-treinados para **Test-Time Compute Scaling** e verificação formal:

1. **Test-Time Reasoning (Raciocínio em Tempo de Inferência):**
   - Em vez de gerar a resposta imediatamente, o modelo formula cadeias de pensamento paralelas e utiliza avaliadores de consistência lógica antes da emissão final.
2. **Arquiteturas Híbridas (State Space Models + Attention):**
   - Combinação de camadas Mamba/SSM com blocos de Multi-Head Attention para processar contextos de múltiplos milhões de tokens com complexidade linear $O(N)$.
3. **Agentes Autônomos de Loop Fechado:**
   - Integração de ambientes de sandbox onde a IA escreve código, roda testes de regressão automatizados e corrige seus próprios erros sem intervenção humana.`
  }
};

// Elementos DOM
const dom = {
  chatScroll: document.getElementById('chat-scroll'),
  chatInner: document.getElementById('chat-inner'),
  welcomeScreen: document.getElementById('welcome-screen'),
  promptInput: document.getElementById('prompt-input'),
  btnSend: document.getElementById('btn-send'),
  btnNewChat: document.getElementById('btn-new-chat'),
  btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
  btnMobileToggle: document.getElementById('btn-mobile-toggle'),
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  modelPillBtn: document.getElementById('model-pill-btn'),
  modelDropdown: document.getElementById('model-dropdown'),
  currentModelLabel: document.getElementById('current-model-label'),
  themeToggleBtn: document.getElementById('btn-theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  micBtn: document.getElementById('btn-mic'),
  attachBtn: document.getElementById('btn-attach'),
  attachmentBar: document.getElementById('attachment-bar'),
  attachmentName: document.getElementById('attachment-name'),
  btnRemoveAttachment: document.getElementById('btn-remove-attachment'),
  fileInputHidden: document.getElementById('hidden-file-input'),
  historyList: document.getElementById('history-list'),
  searchInput: document.getElementById('sidebar-search')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initAutoResizeTextarea();
});

function initEventListeners() {
  // Input e envio
  dom.promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  });

  dom.promptInput.addEventListener('input', () => {
    const hasValue = dom.promptInput.value.trim().length > 0;
    dom.btnSend.disabled = !hasValue && !state.attachedFile;
  });

  dom.btnSend.addEventListener('click', handleSendPrompt);
  dom.btnNewChat.addEventListener('click', handleNewChat);

  // Toggle Sidebar Desktop & Mobile
  if (dom.btnToggleSidebar) {
    dom.btnToggleSidebar.addEventListener('click', toggleSidebarDesktop);
  }
  if (dom.btnMobileToggle) {
    dom.btnMobileToggle.addEventListener('click', toggleSidebarMobile);
  }
  if (dom.sidebarOverlay) {
    dom.sidebarOverlay.addEventListener('click', closeSidebarMobile);
  }

  // Model Dropdown
  dom.modelPillBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.modelDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!dom.modelPillBtn.contains(e.target) && !dom.modelDropdown.contains(e.target)) {
      dom.modelDropdown.classList.remove('show');
    }
  });

  document.querySelectorAll('.model-option').forEach(option => {
    option.addEventListener('click', () => {
      const model = option.getAttribute('data-model');
      state.currentModel = model;
      dom.currentModelLabel.textContent = model;
      document.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      dom.modelDropdown.classList.remove('show');
    });
  });

  // Theme Toggle (Azul Escuro padrão vs Modo Claro Editorial)
  dom.themeToggleBtn.addEventListener('click', toggleTheme);

  // Cards de sugestão da tela inicial
  document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', () => {
      const promptText = card.getAttribute('data-prompt');
      dom.promptInput.value = promptText;
      handleSendPrompt();
    });
  });

  // Feature Mode Pills (Raciocínio, Web, Código)
  document.querySelectorAll('.mode-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      const mode = pill.getAttribute('data-mode');
      if (mode && state.activeModes.hasOwnProperty(mode)) {
        state.activeModes[mode] = pill.classList.contains('active');
      }
    });
  });

  // Anexo de arquivo
  dom.attachBtn.addEventListener('click', () => {
    dom.fileInputHidden.click();
  });

  dom.fileInputHidden.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      state.attachedFile = file;
      dom.attachmentName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      dom.attachmentBar.classList.add('show');
      dom.btnSend.disabled = false;
    }
  });

  dom.btnRemoveAttachment.addEventListener('click', () => {
    state.attachedFile = null;
    dom.fileInputHidden.value = '';
    dom.attachmentBar.classList.remove('show');
    if (!dom.promptInput.value.trim()) {
      dom.btnSend.disabled = true;
    }
  });

  // Microfone (STT ou Simulação de Voz)
  dom.micBtn.addEventListener('click', handleVoiceInput);

  // Filtro de Histórico
  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.history-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    });
  }

  // Itens de histórico
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.history-action-btn')) return;
      document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      loadHistoricChat(item.getAttribute('data-chat-type') || 'software');
      if (window.innerWidth <= 768) closeSidebarMobile();
    });
  });
}

// Auto resize textarea
function initAutoResizeTextarea() {
  const tx = dom.promptInput;
  tx.addEventListener('input', () => {
    tx.style.height = 'auto';
    tx.style.height = Math.min(tx.scrollHeight, 180) + 'px';
  });
}

// Alternar Sidebar Desktop
function toggleSidebarDesktop() {
  dom.sidebar.classList.toggle('collapsed');
}

// Alternar Sidebar Mobile
function toggleSidebarMobile() {
  dom.sidebar.classList.toggle('mobile-open');
  dom.sidebarOverlay.classList.toggle('show');
}

function closeSidebarMobile() {
  dom.sidebar.classList.remove('mobile-open');
  dom.sidebarOverlay.classList.remove('show');
}

// Alternar Tema
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  dom.themeIcon.innerHTML = isLight
    ? `<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>`
    : `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
}

// Enviar Mensagem
function handleSendPrompt() {
  const prompt = dom.promptInput.value.trim();
  if ((!prompt && !state.attachedFile) || state.isGenerating) return;

  // Esconder tela de boas vindas
  if (dom.welcomeScreen) {
    dom.welcomeScreen.style.display = 'none';
  }

  // Montar conteúdo da mensagem do usuário
  let userText = prompt;
  if (state.attachedFile) {
    userText = `📎 **[Arquivo: ${state.attachedFile.name}]**\n\n` + (prompt || 'Analise este arquivo anexado com o Sinodeias.');
  }

  // Renderizar mensagem do usuário
  renderUserMessage(userText);

  // Limpar campo de entrada
  dom.promptInput.value = '';
  dom.promptInput.style.height = 'auto';
  dom.btnSend.disabled = true;

  if (state.attachedFile) {
    state.attachedFile = null;
    dom.attachmentBar.classList.remove('show');
    dom.fileInputHidden.value = '';
  }

  // Simular resposta da IA com streaming
  state.isGenerating = true;
  triggerAIResponse(prompt);
}

// Renderizar mensagem do usuário
function renderUserMessage(text) {
  const row = document.createElement('div');
  row.className = 'message-row user-message';
  row.innerHTML = `
    <div class="message-content-wrapper">
      <div class="message-bubble-user">
        ${escapeHtml(text).replace(/\n/g, '<br>')}
      </div>
    </div>
    <div class="message-avatar user">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
  `;
  dom.chatInner.appendChild(row);
  scrollToBottom();
}

// Gerar resposta inteligente
function triggerAIResponse(userPrompt) {
  // Identificar tópicos ou usar IA generativa padrão
  const lower = userPrompt.toLowerCase();
  let selected = null;

  if (lower.includes('microsservi') || lower.includes('kafka') || lower.includes('arquitetura')) {
    selected = KNOWLEDGE_BASE.software;
  } else if (lower.includes('editorial') || lower.includes('estratégia') || lower.includes('marketing') || lower.includes('design')) {
    selected = KNOWLEDGE_BASE.editorial;
  } else if (lower.includes('sql') || lower.includes('código') || lower.includes('banco') || lower.includes('otimizar')) {
    selected = KNOWLEDGE_BASE.code;
  } else if (lower.includes('pesquisa') || lower.includes('ia') || lower.includes('modelo') || lower.includes('futuro')) {
    selected = KNOWLEDGE_BASE.research;
  } else {
    // Resposta contextual rica gerada dinamicamente
    selected = {
      reasoning: `Contexto compreendido com sucesso. Ativando modelo de alta fidelidade ${state.currentModel} com inferência vetorial e validação de consistência...`,
      content: `### Resposta do Sinodeias

Compreendi perfeitamente sua solicitação sobre **"${escapeHtml(userPrompt)}"**.

A abordagem recomendada sintetiza três princípios essenciais para alta eficiência:

1. **Estruturação Analítica:** Decomposição do problema em componentes modulares com responsabilidades estritas e mensuráveis.
2. **Execução Precisa:** Aplicação de padrões modernos, priorizando desempenho, legibilidade e manutenibilidade contínua.
3. **Iteração Baseada em Métricas:** Validação empírica contínua contra os objetivos definidos.

\`\`\`javascript
// Exemplo de pipeline de processamento em tempo real
async function processIdeaPipeline(input) {
  const normalized = input.trim().toLowerCase();
  const evaluation = await sinodeias.evaluate({
    context: normalized,
    precisionMode: "editorial-precision",
    timestamp: Date.now()
  });

  return evaluation.insights;
}
\`\`\`

Deseja que eu aprofunde algum aspecto técnico específico ou desenvolva um plano de ação detalhado?`
    };
  }

  // Criar elemento da mensagem de IA
  const row = document.createElement('div');
  row.className = 'message-row';
  
  const aiMessageId = 'msg-' + Date.now();
  row.innerHTML = `
    <div class="message-avatar ai">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    </div>
    <div class="message-content-wrapper" style="flex: 1;">
      <div class="message-meta-header">
        <span class="model-name-label">${state.currentModel}</span>
        <span class="model-time-badge">· agora</span>
      </div>

      <!-- Processo de Raciocínio (Deep Reasoning Box) -->
      <div class="reasoning-box" id="reasoning-${aiMessageId}">
        <div class="reasoning-toggle" onclick="toggleReasoning('${aiMessageId}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          <span class="reasoning-status">Raciocinando...</span>
        </div>
        <div class="reasoning-text" id="reasoning-text-${aiMessageId}"></div>
      </div>

      <!-- Corpo da Resposta -->
      <div class="message-bubble-ai" id="content-${aiMessageId}">
        <div class="typing-indicator" id="typing-${aiMessageId}">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>

      <!-- Barra de Ações -->
      <div class="ai-actions-bar" id="actions-${aiMessageId}" style="display: none;">
        <button class="action-pill-btn" onclick="copyMessage('${aiMessageId}')" title="Copiar resposta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copiar
        </button>
        <button class="action-pill-btn" onclick="speakMessage('${aiMessageId}')" title="Ouvir resposta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          Ouvir
        </button>
        <button class="action-pill-btn" onclick="toggleLike(this)" title="Gostei">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
        </button>
        <button class="action-pill-btn" onclick="regeneratePrompt('${escapeHtml(userPrompt)}')" title="Regenerar resposta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          Regenerar
        </button>
      </div>
    </div>
  `;

  dom.chatInner.appendChild(row);
  scrollToBottom();

  // Executar animação de pensamento e streaming
  simulateReasoningAndStreaming(aiMessageId, selected);
}

// Simulação de raciocínio e streaming de texto com markdown
function simulateReasoningAndStreaming(id, data) {
  const reasoningEl = document.getElementById(`reasoning-text-${id}`);
  const reasoningStatus = document.querySelector(`#reasoning-${id} .reasoning-status`);
  const contentEl = document.getElementById(`content-${id}`);
  const typingEl = document.getElementById(`typing-${id}`);
  const actionsEl = document.getElementById(`actions-${id}`);

  // Simular digitação do raciocínio
  let rIndex = 0;
  const rText = data.reasoning;
  const rInterval = setInterval(() => {
    if (rIndex < rText.length) {
      reasoningEl.textContent += rText.charAt(rIndex);
      rIndex++;
    } else {
      clearInterval(rInterval);
      reasoningStatus.textContent = 'Pensou por 1.8 segundos';
      
      // Iniciar streaming da resposta principal
      startContentStreaming();
    }
  }, 12);

  function startContentStreaming() {
    typingEl.remove();
    
    // Parse markdown básico
    const fullHtml = parseMarkdown(data.content);
    
    // Simular fluxo de caracteres suave
    let renderedChars = 0;
    const totalChars = data.content.length;
    
    const streamInterval = setInterval(() => {
      renderedChars += Math.floor(Math.random() * 8) + 4;
      
      if (renderedChars >= totalChars) {
        clearInterval(streamInterval);
        contentEl.innerHTML = fullHtml;
        actionsEl.style.display = 'flex';
        state.isGenerating = false;
        scrollToBottom();
      } else {
        const slice = data.content.slice(0, renderedChars);
        contentEl.innerHTML = parseMarkdown(slice);
        scrollToBottom();
      }
    }, 18);
  }
}

// Markdown Parser Simples e Robusto
function parseMarkdown(md) {
  let html = md;

  // Code blocks ```lang ... ```
  html = html.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, function(match, lang, code) {
    const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
    return `
      <div class="code-block-container">
        <div class="code-header">
          <span>${lang ? lang.toUpperCase() : 'CÓDIGO'}</span>
          <button class="btn-copy-code" onclick="copyCodeSnippet('${codeId}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar
          </button>
        </div>
        <pre class="code-pre"><code id="${codeId}">${escapeHtml(code.trim())}</code></pre>
      </div>
    `;
  });

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 style="font-size:1rem;margin:12px 0 6px;color:var(--text-accent);">$1</h4>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<div style="border-left:3px solid var(--accent-blue);padding:8px 12px;background:var(--bg-surface);border-radius:4px;margin:10px 0;font-size:0.9rem;">$1</div>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background:var(--bg-surface-active);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.85em;color:var(--text-accent);">$1</code>');

  // Listas
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

  // Parágrafos
  const lines = html.split('\n\n');
  return lines.map(line => {
    line = line.trim();
    if (!line) return '';
    if (line.startsWith('<div') || line.startsWith('<h') || line.startsWith('<li>') || line.startsWith('<pre')) {
      return line;
    }
    return `<p>${line.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

// Toggle Reasoning Box
window.toggleReasoning = function(id) {
  const box = document.getElementById(`reasoning-${id}`);
  if (box) box.classList.toggle('collapsed');
};

// Copiar Snippet de Código
window.copyCodeSnippet = function(codeId) {
  const el = document.getElementById(codeId);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(() => {
    const btn = el.closest('.code-block-container').querySelector('.btn-copy-code');
    const originalText = btn.innerHTML;
    btn.innerHTML = `✓ Copiado!`;
    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
  });
};

// Copiar Mensagem Inteira
window.copyMessage = function(msgId) {
  const content = document.getElementById(`content-${msgId}`);
  if (!content) return;
  navigator.clipboard.writeText(content.innerText).then(() => {
    alert('Resposta copiada para a área de transferência!');
  });
};

// Ouvir Mensagem via Web Speech Synthesis (TTS)
window.speakMessage = function(msgId) {
  const content = document.getElementById(`content-${msgId}`);
  if (!content) return;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content.innerText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Síntese de voz não suportada pelo seu navegador.');
  }
};

// Like / Dislike
window.toggleLike = function(btn) {
  btn.classList.toggle('active');
};

// Regenerar Prompt
window.regeneratePrompt = function(promptText) {
  if (state.isGenerating) return;
  state.isGenerating = true;
  triggerAIResponse(promptText);
};

// Microfone / Reconhecimento de Voz
function handleVoiceInput() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    // Simulação visual agradável caso a API de voz não esteja autorizada ou suportada
    if (!state.isRecording) {
      state.isRecording = true;
      dom.micBtn.classList.add('recording');
      dom.promptInput.placeholder = "Ouvindo sua voz com o Sinodeias...";
      setTimeout(() => {
        dom.promptInput.value = "Como otimizar a latência de consultas SQL complexas?";
        dom.promptInput.dispatchEvent(new Event('input'));
        dom.micBtn.classList.remove('recording');
        dom.promptInput.placeholder = "Pergunte algo ao Sinodeias ou use Shift+Enter para quebra de linha...";
        state.isRecording = false;
      }, 2500);
    }
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;

  recognition.onstart = () => {
    state.isRecording = true;
    dom.micBtn.classList.add('recording');
    dom.promptInput.placeholder = "Ouvindo com Sinodeias...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    dom.promptInput.value = transcript;
    dom.promptInput.dispatchEvent(new Event('input'));
  };

  recognition.onend = () => {
    state.isRecording = false;
    dom.micBtn.classList.remove('recording');
    dom.promptInput.placeholder = "Pergunte algo ao Sinodeias ou use Shift+Enter para quebra de linha...";
  };

  recognition.start();
}

// Novo Chat
function handleNewChat() {
  dom.chatInner.innerHTML = '';
  if (dom.welcomeScreen) {
    dom.chatInner.appendChild(dom.welcomeScreen);
    dom.welcomeScreen.style.display = 'flex';
  }
  dom.promptInput.value = '';
  dom.promptInput.focus();
  document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
}

// Carregar Chat Histórico de Demonstração
function loadHistoricChat(type) {
  dom.chatInner.innerHTML = '';
  if (dom.welcomeScreen) dom.welcomeScreen.style.display = 'none';

  const demoData = KNOWLEDGE_BASE[type] || KNOWLEDGE_BASE.software;
  const promptMap = {
    software: "Como projetar uma arquitetura de microsserviços orientada a eventos usando Kafka?",
    editorial: "Crie uma estratégia editorial e manifesto visual de lançamento para um produto de IA.",
    code: "Como otimizar consultas analíticas complexas no PostgreSQL?",
    research: "Quais são as principais tendências e avanços recentes em arquiteturas de IA?"
  };

  const userPrompt = promptMap[type] || "Explique o padrão de arquitetura.";
  renderUserMessage(userPrompt);

  // Renderizar resposta completa instantânea
  const aiMessageId = 'msg-hist-' + Date.now();
  const row = document.createElement('div');
  row.className = 'message-row';
  row.innerHTML = `
    <div class="message-avatar ai">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    </div>
    <div class="message-content-wrapper" style="flex: 1;">
      <div class="message-meta-header">
        <span class="model-name-label">${state.currentModel}</span>
        <span class="model-time-badge">· arquivado</span>
      </div>
      <div class="reasoning-box" id="reasoning-${aiMessageId}">
        <div class="reasoning-toggle" onclick="toggleReasoning('${aiMessageId}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          <span class="reasoning-status">Raciocínio concluído</span>
        </div>
        <div class="reasoning-text" id="reasoning-text-${aiMessageId}">${demoData.reasoning}</div>
      </div>
      <div class="message-bubble-ai" id="content-${aiMessageId}">
        ${parseMarkdown(demoData.content)}
      </div>
      <div class="ai-actions-bar" id="actions-${aiMessageId}">
        <button class="action-pill-btn" onclick="copyMessage('${aiMessageId}')">Copiar</button>
        <button class="action-pill-btn" onclick="speakMessage('${aiMessageId}')">Ouvir</button>
        <button class="action-pill-btn" onclick="toggleLike(this)">Curtir</button>
      </div>
    </div>
  `;
  dom.chatInner.appendChild(row);
  scrollToBottom();
}

function scrollToBottom() {
  dom.chatScroll.scrollTop = dom.chatScroll.scrollHeight;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
