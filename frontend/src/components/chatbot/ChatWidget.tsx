import { useState } from 'react';
import {useRef } from 'react';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import * as chatbotApi from '../../api/chatbot';

interface Message {
  from: 'user' | 'bot';
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: "Hi! I can help with registration, uploads, purchases, and general platform questions. What do you need help with?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { from: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatbotApi.askChatbot(userMessage);
      setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
    } catch (err: any) {
      const msg = err.response?.status === 503
        ? "The chatbot isn't available right now — please check the FAQs or contact support."
        : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { from: 'bot', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {open && (
        <div
          style={{
            width: '320px',
            height: '420px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '10px',
            overflow: 'hidden',
          }}
        >
          <div className="bg-dark text-white p-2 d-flex justify-content-between align-items-center">
            <strong>Platform Help</strong>
            <Button
              variant="link"
              className="text-white p-0"
              onClick={() => setOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              ✕
            </Button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 d-flex ${msg.from === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded ${msg.from === 'user' ? 'bg-primary text-white' : 'bg-light'}`}
                  style={{ maxWidth: '80%', fontSize: '0.9rem' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="d-flex justify-content-start mb-2">
                <Spinner animation="border" size="sm" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <Form onSubmit={handleSend} className="p-2 border-top d-flex gap-2">
            <Form.Control
              size="sm"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" size="sm" disabled={loading || !input.trim()}>
              Send
            </Button>
          </Form>
        </div>
      )}

      <Button
        onClick={() => setOpen(!open)}
        style={{
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          fontSize: '1.4rem',
        }}
        variant="primary"
      >
        💬
      </Button>
    </div>
  );
}