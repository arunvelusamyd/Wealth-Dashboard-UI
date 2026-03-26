import React, { useState, useCallback, useRef, useEffect } from 'react';

export default function ChatDrawer({ keycloak }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);
    try {
      await keycloak.updateToken(30);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keycloak.token}` },
        body: JSON.stringify({ message: userText }),
      });
      if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not process your request. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, keycloak]);

  return (
    <>
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="Ask your portfolio assistant">
        {chatOpen ? '✕' : '💬'}
      </button>

      {chatOpen && (
        <div className="chat-drawer">
          <div className="chat-drawer-header"><span>Portfolio Assistant</span></div>
          <div className="chat-messages">
            {chatMessages.length === 0 && (
              <div className="chat-empty">
                Ask me anything about your portfolio — holdings, P&amp;L, allocation, or fund details.
              </div>
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
              placeholder="Ask about your portfolio..."
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
