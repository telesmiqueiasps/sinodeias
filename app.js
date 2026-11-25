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

// Banco de Respostas Especializadas no Contexto Presbiteriano e Sinodal da Paraíba
const KNOWLEDGE_BASE = {
  congresso: {
    reasoning: "Consultando diretrizes sinodais, cronograma da Sinodal de Mocidades da Paraíba (SMPB/IPB), temas reformados para congressos e dinâmica de acolhimento de federações e sociedades locais...",
    content: `### Planejamento Estratégico — Congresso Sinodal de Mocidades da Paraíba

O planejamento do **Congresso da Sinodal de Mocidades da Paraíba** deve unir profundidade bíblica reformada, comunhão fraternal e excelência organizacional:

1. **Tema e Teologia Bíblica:**
   - Foco centrado no lema da UMP: *"Alegres na esperança, fortes na fé, dedicados no amor, unidos no trabalho"* (Romanos 12:12).
   - Sessões plenárias com pastores preletores comprometidos com a sã doutrina e a confessionalidade de Westminster.

2. **Integração das Federações Presbiteriais:**
   - Participação ativa das federações da Paraíba (litoral, brejo e sertão paraibano).
   - Momentos dedicados para apresentação de projetos missionários, vigílias e painéis vocacionais.

3. **Cronograma Sugerido de Atividades:**
   - **Sexta-feira (Noite):** Recepção das caravanas, Culto de Abertura e Louvor Congregacional.
   - **Sábado (Manhã e Tarde):** Oficinas temáticas de liderança cristã, evangelismo urbano e plenária geral.
   - **Domingo (Manhã):** Ceia do Senhor, consagração da nova diretoria sinodal e comissionamento das mocidades locais.

> *"A mocidade presbiteriana é força viva na proclamação do Evangelho em todo o solo paraibano."*`
  },

  lideranca: {
    reasoning: "Acessando Manual Unificado das Sociedades Internas da IPB, Constituição da IPB e princípios de liderança servidora para executivas de UMP...",
    content: `### Liderança Eficaz na UMP (União de Mocidade Presbiteriana)

A liderança de jovens no contexto presbiteriano fundamenta-se no princípio bíblico da **mordomia cristã e serviço voluntário**:

* **Conselho da Igreja e Sinodal:** Manter alinhamento e submissão amorosa aos presbíteros e pastores relatores, promovendo transparência e prestação de contas.
* **Pilares de Gestão da Diretoria:**
  1. **Espiritualidade:** Oração contínua e estudo fiel das Escrituras Sagradas.
  2. **Comunhão & Discipulado:** Cuidado individual com os jovens recém-chegados e fortalecimento das sociedades locais.
  3. **Ação Social e Evangelismo:** Projetos de impacto comunitário nas cidades da Paraíba.

#### Boas Práticas Administrativas:
- Atas e relatórios estatísticos mantidos rigorosamente em dia para encaminhamento ao Sínodo e Presbitérios.
- Comunicação assertiva e visualmente inspiradora através das mídias sociais da Sinodal.`
  },

  devocional: {
    reasoning: "Elaborando esboço devocional com exegese bíblica reformada para jovens em acampamentos e retiros espirituais...",
    content: `### Devocional: Firmes na Fé em Tempos Desafiadores

**Texto Bíblico:** 1 Timóteo 4:12 — *"Ninguém despreze a tua mocidade; pelo contrário, torna-te padrão dos fiéis, na palavra, no procedimento, no amor, na fé, na pureza."*

#### Reflexão Pastoral para Jovens:
O apóstolo Paulo instrui o jovem Timóteo a não se intimidar pela sua pouca idade, mas a demonstrar maturidade através de um testemunho irrepreensível:

1. **Na Palavra e no Procedimento:** Nossa fala e atitudes no cotidiano devem refletir a cosmovisão cristã bíblica.
2. **No Amor e na Fé:** O amor prático aos irmãos e a confiança inabalável na soberania de Deus.
3. **Na Pureza:** Santidade de coração, mente e conduta em meio à cultura contemporânea.

**Oração:** *Senhor nosso Deus, capacita os jovens da Sinodal da Paraíba a viverem como luz de Cristo, servindo com fidelidade e fervor à Tua Igreja.*`
  },

  historia: {
    reasoning: "Resgatando marcos históricos da Igreja Presbiteriana do Brasil no Nordeste, pioneirismo na Paraíba e a fundação dos movimentos de mocidade presbiteriana...",
    content: `### Memória Histórica: Presbiterianismo na Paraíba

A presença presbiteriana no estado da Paraíba é marcada por pioneirismo missionário e compromisso educacional e evangelístico:

* **Início da Obra:** Os primeiros trabalhos presbiterianos na Paraíba remontam ao final do século XIX, com a expansão missionária a partir de Pernambuco pelo pioneiro Rev. J. R. Smith e colportores dedicados.
* **Consolidação das Igrejas e Federações:** A organização da Primeira Igreja Presbiteriana de João Pessoa e a subsequente interiorização para cidades como Campina Grande, Guarabira, Patos e Sousa.
* **A Força da Juventude (UMP):** O movimento sinodal de mocidades desempenhou e continua desempenhando papel vital na formação de futuros presbíteros, diáconos, missionários e líderes que servem a Deus em nossa terra.`
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
  // Identificar tópicos ou usar IA generativa focada no contexto presbiteriano e sinodal
  const lower = userPrompt.toLowerCase();
  let selected = null;

  if (lower.includes('congresso') || lower.includes('evento') || lower.includes('cronograma')) {
    selected = KNOWLEDGE_BASE.congresso;
  } else if (lower.includes('liderança') || lower.includes('lideranca') || lower.includes('gestão') || lower.includes('ump') || lower.includes('diretoria')) {
    selected = KNOWLEDGE_BASE.lideranca;
  } else if (lower.includes('devocional') || lower.includes('bíblia') || lower.includes('biblia') || lower.includes('estudo') || lower.includes('oração')) {
    selected = KNOWLEDGE_BASE.devocional;
  } else if (lower.includes('história') || lower.includes('historia') || lower.includes('paraíba') || lower.includes('paraiba') || lower.includes('ipb')) {
    selected = KNOWLEDGE_BASE.historia;
  } else {
    // Resposta contextual rica gerada dinamicamente com ênfase na Sinodal de Mocidades da Paraíba
    selected = {
      reasoning: `Analisando demanda sob a cosmovisão bíblica reformada e diretrizes da Sinodal de Mocidades da Paraíba. Alinhando princípios confessionais (IPB), engajamento de jovens e metodologia sinodal...`,
      content: `### Resposta do Sinodeias

Compreendi sua consulta sobre **"${escapeHtml(userPrompt)}"**.

No contexto do ministério da juventude e da **Sinodal de Mocidades da Paraíba (IPB)**, destacamos três orientações estratégicas:

1. **Fundamentação Bíblica e Confessional:**
   - Toda iniciativa deve ter como alicerce as Escrituras Sagradas e os símbolos de fé de Westminster, promovendo jovens teologicamente conscientes e firmes na fé.

2. **Engajamento Comunitário e Fraternal:**
   - Fortalecer a comunhão entre as federações e sociedades locais da Paraíba, incentivando projetos que unam evangelismo, serviço ao próximo e acolhimento.

3. **Planejamento e Liderança Servidora:**
   - Trabalhar com metas claras, oração contínua e comunicação inspiradora, honrando o lema: *"Alegres na esperança, fortes na fé, dedicados no amor, unidos no trabalho"*.

Deseja que eu elabore um plano de ação, esboço de projeto ou proposta de atividade específica para a sua UMP ou Federação?`
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

  const demoData = KNOWLEDGE_BASE[type] || KNOWLEDGE_BASE.congresso;
  const promptMap = {
    congresso: "Como organizar a programação e acolhimento para o Congresso Sinodal de Mocidades?",
    lideranca: "Quais são as melhores práticas para a gestão e liderança da diretoria da UMP?",
    devocional: "Escreva um devocional bíblico reformado para o retiro da mocidade.",
    historia: "Conte sobre a história e os marcos do presbiterianismo e da mocidade na Paraíba."
  };

  const userPrompt = promptMap[type] || "Orientações sobre o ministério de mocidades.";
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
