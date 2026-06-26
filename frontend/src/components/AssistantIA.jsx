import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import chatbotService from '@/services/chatbotService';

export default function AssistantIA() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis InnoBot, l'assistant de la Cite de l'Innovation. Comment puis-je vous aider ?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now(), text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      const botResponse = await chatbotService.sendMessage(userMessage);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: botResponse.text, isBot: true }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: `Erreur de connexion : ${error.message}`, isBot: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E07A5F] text-white shadow-xl transition-transform hover:scale-105"
          aria-label="Ouvrir InnoBot"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="flex h-[500px] w-[360px] flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl sm:w-[400px]">
          <div className="flex items-center justify-between rounded-t-2xl bg-stone-900 px-4 py-3 text-white">
            <span className="text-xs font-bold">ASSISTANT VIRTUEL</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-white"
              aria-label="Fermer InnoBot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50 p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-2.5 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
                    msg.isBot ? 'bg-stone-700' : 'bg-[#E07A5F]'
                  }`}
                >
                  {msg.isBot ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.isBot ? 'border bg-white text-stone-800' : 'bg-[#E07A5F] text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-700 text-white">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl border bg-white px-4 py-3 text-stone-500 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-stone-200 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez une question..."
              className="flex-1 rounded-xl border bg-stone-50/50 px-4 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-stone-900 px-3 py-2 text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Envoyer le message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
