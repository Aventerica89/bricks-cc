/**
 * Claude Client Portal - Chat Widget
 * Embeds a floating chat widget on WordPress sites
 */

(function() {
  'use strict';

  // Configuration from WordPress
  const config = window.claudePortalConfig || {};

  if (!config.apiUrl || !config.siteId) {
    console.warn('Claude Portal: Missing configuration');
    return;
  }

  // State
  let isOpen = false;
  let isMinimized = false;
  let isLoading = false;
  let messages = [];

  // DOM Elements
  let container, toggleBtn, chatWindow, messagesContainer, inputField;

  // Icons (SVG)
  const icons = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    minimize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    maximize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>'
  };

  /**
   * Initialize the widget
   */
  function init() {
    container = document.getElementById('claude-portal-widget-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'claude-portal-widget-container';
      document.body.appendChild(container);
    }

    container.className = config.position || 'bottom-right';

    renderToggleButton();
    loadHistory();
  }

  /**
   * Render the toggle button
   */
  function renderToggleButton() {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'claude-chat-toggle';
    toggleBtn.innerHTML = icons.chat;
    toggleBtn.setAttribute('aria-label', 'Open chat');
    toggleBtn.addEventListener('click', toggleChat);
    container.appendChild(toggleBtn);
  }

  /**
   * Render the chat window
   */
  function renderChatWindow() {
    chatWindow = document.createElement('div');
    chatWindow.className = 'claude-chat-window';

    chatWindow.innerHTML = `
      <div class="claude-chat-header">
        <div class="claude-chat-header-title">
          ${icons.chat}
          <span>AI Assistant</span>
        </div>
        <div class="claude-chat-header-actions">
          <button class="claude-chat-header-btn minimize-btn" aria-label="Minimize">
            ${icons.minimize}
          </button>
          <button class="claude-chat-header-btn close-btn" aria-label="Close">
            ${icons.close}
          </button>
        </div>
      </div>
      <div class="claude-chat-messages">
        <div class="claude-chat-welcome">
          <h4>Hello${config.clientName ? ', ' + config.clientName : ''}!</h4>
          <p>How can I help you today? You can ask about your project, request page edits, or submit feedback.</p>
        </div>
      </div>
      <div class="claude-chat-input-container">
        <textarea
          class="claude-chat-input"
          placeholder="Type your message..."
          rows="1"
        ></textarea>
        <button class="claude-chat-send-btn" aria-label="Send message">
          ${icons.send}
        </button>
      </div>
    `;

    // Bind events
    chatWindow.querySelector('.close-btn').addEventListener('click', closeChat);
    chatWindow.querySelector('.minimize-btn').addEventListener('click', minimizeChat);

    inputField = chatWindow.querySelector('.claude-chat-input');
    messagesContainer = chatWindow.querySelector('.claude-chat-messages');

    inputField.addEventListener('keydown', handleKeyDown);
    chatWindow.querySelector('.claude-chat-send-btn').addEventListener('click', sendMessage);

    // Auto-resize textarea
    inputField.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    container.appendChild(chatWindow);

    // Render existing messages
    if (messages.length > 0) {
      messagesContainer.innerHTML = '';
      messages.forEach(renderMessage);
    }
  }

  /**
   * Toggle chat window
   */
  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  /**
   * Open chat window
   */
  function openChat() {
    isOpen = true;
    toggleBtn.style.display = 'none';
    renderChatWindow();
    inputField.focus();
  }

  /**
   * Close chat window
   */
  function closeChat() {
    isOpen = false;
    if (chatWindow) {
      chatWindow.remove();
      chatWindow = null;
    }
    toggleBtn.style.display = 'flex';
  }

  /**
   * Minimize chat window
   */
  function minimizeChat() {
    isMinimized = !isMinimized;
    if (chatWindow) {
      chatWindow.style.height = isMinimized ? '56px' : '500px';
      const minBtn = chatWindow.querySelector('.minimize-btn');
      minBtn.innerHTML = isMinimized ? icons.maximize : icons.minimize;
    }
  }

  /**
   * Handle keydown in input
   */
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  /**
   * Send a message
   */
  async function sendMessage() {
    const text = inputField.value.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    messages.push(userMessage);
    renderMessage(userMessage);

    // Clear input
    inputField.value = '';
    inputField.style.height = 'auto';

    // Show loading
    isLoading = true;
    showTypingIndicator();

    try {
      const response = await fetch(`${config.apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: config.clientId,
          siteId: config.siteId,
          message: text,
          context: {
            currentPageId: config.currentPageId
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        actions: data.actions
      };
      messages.push(assistantMessage);
      hideTypingIndicator();
      renderMessage(assistantMessage);

    } catch (error) {
      console.error('Chat error:', error);
      hideTypingIndicator();

      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      renderMessage(errorMessage);
    }

    isLoading = false;
  }

  /**
   * Render a message
   */
  function renderMessage(message) {
    if (!messagesContainer) return;

    // Remove welcome message if present
    const welcome = messagesContainer.querySelector('.claude-chat-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `claude-chat-message ${message.role}`;

    const time = formatTime(message.timestamp);
    div.innerHTML = `
      <div class="claude-chat-message-content">${escapeHtml(message.content)}</div>
      <div class="claude-chat-message-time">${time}</div>
    `;

    // Show action indicators
    if (message.actions && message.actions.length > 0) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'claude-chat-message-actions';
      message.actions.forEach(action => {
        const actionSpan = document.createElement('span');
        actionSpan.textContent = formatActionLabel(action);
        actionsDiv.appendChild(actionSpan);
      });
      div.appendChild(actionsDiv);
    }

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Show typing indicator
   */
  function showTypingIndicator() {
    if (!messagesContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'claude-typing-indicator';
    indicator.innerHTML = `
      <div class="claude-typing-dot"></div>
      <div class="claude-typing-dot"></div>
      <div class="claude-typing-dot"></div>
    `;
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Hide typing indicator
   */
  function hideTypingIndicator() {
    if (!messagesContainer) return;
    const indicator = messagesContainer.querySelector('.claude-typing-indicator');
    if (indicator) indicator.remove();
  }

  /**
   * Load chat history
   */
  async function loadHistory() {
    try {
      const response = await fetch(
        `${config.apiUrl}/api/chat?clientId=${config.clientId}&siteId=${config.siteId}&limit=20`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach(msg => {
            messages.push({
              role: 'user',
              content: msg.userMessage,
              timestamp: new Date(msg.createdAt)
            });
            if (msg.claudeResponse) {
              messages.push({
                role: 'assistant',
                content: msg.claudeResponse,
                timestamp: new Date(msg.createdAt)
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error);
    }
  }

  /**
   * Format timestamp
   */
  function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Format action label
   */
  function formatActionLabel(action) {
    const labels = {
      'bricks_edit': 'Page updated',
      'basecamp_create_todo': 'Todo created',
      'basecamp_update_todo': 'Todo updated'
    };
    return labels[action.type] || action.type;
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
