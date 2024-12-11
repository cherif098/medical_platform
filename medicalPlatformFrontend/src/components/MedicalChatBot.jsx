import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot } from "lucide-react";
import axios from "axios";

const MedicalChatbot = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour, je suis votre assistant médical. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Instance axios avec configuration de base
  const api = axios.create({
    baseURL: "http://localhost:8002",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const formatMessages = (msgs) => {
    return msgs.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError(null);

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCurrentResponse("");

    try {
      const response = await api.post(
        "/api/chat",
        {
          message: userMessage.content,
          history: formatMessages(messages),
          user_id: userId || "default",
        },
        {
          responseType: "text",
          onDownloadProgress: (progressEvent) => {
            const text = progressEvent.event.target.responseText;
            setCurrentResponse(text);
          },
        }
      );

      // Une fois la réponse complète reçue
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: currentResponse || response.data,
        },
      ]);
      setCurrentResponse("");
    } catch (err) {
      console.error("Error:", err);
      let errorMessage =
        "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.";

      if (err.response) {
        switch (err.response.status) {
          case 422:
            errorMessage = "Format de données invalide. Veuillez réessayer.";
            break;
          default:
            errorMessage = "Une erreur est survenue. Veuillez réessayer.";
        }
      } else if (err.request) {
        errorMessage =
          "Impossible de joindre le serveur. Vérifiez votre connexion.";
      }

      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Composant du bouton flottant (chat fermé)
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center space-x-4">
        <div className="bg-white p-3 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105">
          <span className="text-blue-600 font-semibold">Besoin d'aide ?</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300 group relative"
        >
          <Bot className="w-10 h-10 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-blue-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Assistant Médical</h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Zone d'erreur */}
      {error && (
        <div className="p-2 bg-red-100 text-red-600 text-sm">{error}</div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {currentResponse && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
              {currentResponse}
            </div>
          </div>
        )}
        {isLoading && !currentResponse && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalChatbot;
