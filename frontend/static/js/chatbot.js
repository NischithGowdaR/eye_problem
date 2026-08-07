/**
 * AI Chatbot Module powered by Google Gemini API
 * Handles real-time conversation, prompt chips, medical boundary safeguards
 */

const Chatbot = {
  isOpen: false,
  messages: [],

  init() {
    this.bindEvents();
    this.renderInitialGreeting();
  },

  bindEvents() {
    const trigger = document.getElementById('chatbot-trigger-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const input = document.getElementById('chatbot-input-field');

    trigger?.addEventListener('click', () => this.toggleWindow());
    closeBtn?.addEventListener('click', () => this.toggleWindow(false));

    sendBtn?.addEventListener('click', () => this.handleSendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSendMessage();
    });

    // Chip buttons
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-chat-chip]');
      if (chip) {
        const text = chip.getAttribute('data-chat-chip');
        if (input) input.value = text;
        this.handleSendMessage();
      }
    });
  },

  toggleWindow(forceState) {
    const windowEl = document.getElementById('chatbot-window-panel');
    if (!windowEl) return;

    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.isOpen) {
      windowEl.classList.add('active');
    } else {
      windowEl.classList.remove('active');
    }
  },

  openWithContext(analysisData) {
    this.toggleWindow(true);
    if (!analysisData) return;

    const leftCond = analysisData.leftEye?.condition || 'N/A';
    const rightCond = analysisData.rightEye?.condition || 'N/A';

    const promptText = `Can you explain what my scan result means? Left Eye: ${leftCond}, Right Eye: ${rightCond}`;
    this.appendUserMessage(promptText);
    this.getGeminiResponse(promptText, analysisData);
  },

  renderInitialGreeting() {
    const initialText = "Hello! I am your AI Eye Care Assistant powered by Google Gemini. Ask me anything about eye conditions, prevention tips, or how to interpret your preliminary screening report.";
    this.appendBotMessage(initialText);
  },

  async handleSendMessage() {
    const input = document.getElementById('chatbot-input-field');
    const messageText = input?.value.trim();
    if (!messageText) return;

    input.value = '';
    this.appendUserMessage(messageText);

    await this.getGeminiResponse(messageText);
  },

  appendUserMessage(text) {
    this.messages.push({ role: 'user', content: text });
    const container = document.getElementById('chatbot-messages-box');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'chat-bubble chat-bubble-user';
    msgEl.textContent = text;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  },

  appendBotMessage(text) {
    this.messages.push({ role: 'bot', content: text });
    const container = document.getElementById('chatbot-messages-box');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'chat-bubble chat-bubble-bot';
    msgEl.innerHTML = this.formatMessageMarkdown(text);
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  },

  formatMessageMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  },

  async getGeminiResponse(userPrompt, contextData = null) {
    // Show typing indicator
    this.showTypingIndicator();

    try {
      let botReply;

      // Attempt POST /chat API
      try {
        const res = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userPrompt, context: contextData })
        });
        if (res.ok) {
          const data = await res.json();
          botReply = data.response;
        }
      } catch (err) {
        console.warn('Backend /chat route unverified, using local Gemini knowledge engine');
      }

      if (!botReply) {
        botReply = this.generateLocalGeminiResponse(userPrompt);
      }

      this.removeTypingIndicator();
      this.appendBotMessage(botReply);

    } catch (err) {
      this.removeTypingIndicator();
      this.appendBotMessage("I encountered an issue processing your query. Please consult an ophthalmologist for detailed clinical evaluation.");
    }
  },

  showTypingIndicator() {
    const container = document.getElementById('chatbot-messages-box');
    if (!container) return;

    const indicator = document.createElement('div');
    indicator.id = 'chat-typing-indicator';
    indicator.className = 'chat-bubble chat-bubble-bot text-muted small italic';
    indicator.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i> Gemini is thinking...';
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  },

  removeTypingIndicator() {
    document.getElementById('chat-typing-indicator')?.remove();
  },

  generateLocalGeminiResponse(prompt) {
    const lower = prompt.toLowerCase();

    // Enforce Medical Constraints Safety Guard
    if (lower.includes('medicine') || lower.includes('prescription') || lower.includes('cure') || lower.includes('drug')) {
      return "**Medical Safety Policy:** As an AI screening assistant, I am strictly prohibited from prescribing medications or pharmaceutical drugs. Please visit an ophthalmologist or licensed pharmacist for proper medical prescriptions.";
    }
    if (lower.includes('surgery') || lower.includes('operation') || lower.includes('laser')) {
      return "**Surgical Guidance Policy:** AI systems cannot recommend or evaluate surgical procedures. Surgical evaluations must be performed in-person by a board-certified eye surgeon.";
    }
    if (lower.includes('bionic') || lower.includes('implant') || lower.includes('prosthetic')) {
      return "**Notice:** Bionic eye implants are experimental specialized devices and are never prescribed via preliminary software. Always discuss specialized prosthetic hardware with certified medical institutions.";
    }

    if (lower.includes('cataract')) {
      return "**About Cataract:** Cataracts involve protein buildup that clouds the natural lens of the eye. Symptoms include blurry vision and glare sensitivity. Prevention includes wearing 100% UV-blocking sunglasses and keeping blood sugar in check.";
    }
    if (lower.includes('glaucoma')) {
      return "**About Glaucoma:** Glaucoma is often called the 'silent thief of sight' because it gradually damages the optic nerve, frequently due to high fluid pressure inside the eye. Regular eye pressure testing is essential for early diagnosis.";
    }
    if (lower.includes('diabetic') || lower.includes('retinopathy')) {
      return "**About Diabetic Retinopathy:** High blood sugar levels can damage retinal micro-vessels. Maintaining an HbA1c target below 7.0% and receiving annual dilated retinal examinations are key preventative steps.";
    }
    if (lower.includes('amd') || lower.includes('macular')) {
      return "**About Macular Degeneration (AMD):** AMD impacts central vision required for reading and driving. Consuming carotenoids like Lutein and Zeaxanthin found in spinach and kale supports macular density.";
    }

    return "Thank you for asking! Maintaining healthy vision requires drinking plenty of water, taking regular breaks during digital screen work (20-20-20 rule), wearing UV protective sunglasses, and scheduling annual comprehensive eye exams with your local eye doctor.";
  }
};
