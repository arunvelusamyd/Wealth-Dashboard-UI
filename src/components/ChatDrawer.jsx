import { useState, useCallback, useRef, useEffect } from 'react';
import { DEV_MODE } from '../config/devConfig';

const TAB_CONFIG = {
  'Portfolio Overview': {
    label: 'Portfolio context',
    placeholder: 'Ask about your holdings, P&L, allocation…',
    emptyHint: 'Ask me anything about your portfolio — holdings, P&L, allocation, or fund details.',
  },
  'Watchlist': {
    label: 'Watchlist context',
    placeholder: 'Ask about your watched stocks…',
    emptyHint: 'Ask me about your watchlist — which stocks you\'re tracking, what to watch next, or general stock questions.',
  },
  'Subscriptions': {
    label: 'Subscriptions context',
    placeholder: 'Ask about upcoming or missed payments…',
    emptyHint: 'Ask me about your subscriptions — payments due this week, missed payments, total monthly cost, or category breakdown.',
  },
  'Fundamentals': {
    label: 'Fundamentals context',
    placeholder: 'Ask about the loaded stock metrics…',
    emptyHint: 'Ask me about the fundamentals of any stock loaded above — PE ratio, ROE, comparisons, or whether a stock looks undervalued.',
  },
};

function buildTabContext(selectedTab) {
  try {
    switch (selectedTab) {
      case 'Watchlist': {
        const watchlist = JSON.parse(localStorage.getItem('wealthWatchlist') || '[]');
        return { watchlist };
      }
      case 'Subscriptions': {
        const subscriptions = JSON.parse(localStorage.getItem('wealthSubscriptions') || '[]');
        return { subscriptions };
      }
      case 'Fundamentals': {
        const raw = sessionStorage.getItem('fundTabContext');
        return raw ? JSON.parse(raw) : null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export default function ChatDrawer({ keycloak, selectedTab }) {
  const [chatOpen, setChatOpen]       = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput]     = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const tabConfig = TAB_CONFIG[selectedTab] ?? TAB_CONFIG['Portfolio Overview'];

  const sendMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);
    try {
      if (DEV_MODE) {
        await new Promise(r => setTimeout(r, 600));
        setChatMessages(prev => [...prev, { role: 'assistant', text: '(Dev mode) Portfolio assistant is not available without a live backend. Start the backend with DEV_MODE=false to enable AI responses.' }]);
        return;
      }
      await keycloak.updateToken(30);
      const tabContext = buildTabContext(selectedTab);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keycloak.token}` },
        body: JSON.stringify({ message: userText, tab: selectedTab, tabContext }),
      });
      if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not process your request. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, keycloak, selectedTab]);

  return (
    <>
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="Ask your portfolio assistant">
        {chatOpen ? '✕' : '💬'}
      </button>

      {chatOpen && (
        <div className="chat-drawer">
          <div className="chat-drawer-header">
            <span>Portfolio Assistant</span>
            <span className="chat-context-label">{tabConfig.label}</span>
          </div>
          <div className="chat-messages">
            {chatMessages.length === 0 && (
              <div className="chat-empty">{tabConfig.emptyHint}</div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>{msg.text}</div>
            ))}
            {chatLoading && (
              <div className="chat-bubble chat-bubble--assistant chat-thinking">
                <span className="chat-dot" /><span className="chat-dot" /><span className="chat-dot" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={tabConfig.placeholder}
              disabled={chatLoading}
            />
            <button className="chat-send" onClick={sendMessage} disabled={chatLoading || !chatInput.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
