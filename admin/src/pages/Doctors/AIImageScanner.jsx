import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Upload,
  Loader2,
  Send,
  X,
  Trash2,
  Stethoscope,
  Bot,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MedicalChatInterface() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearHistory = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer l'historique ?")) {
      setMessages([]);
      localStorage.removeItem("chatMessages");
    }
  };

  const simulateStream = async (text) => {
    let currentText = "";
    const words = text.split(" ");

    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      currentText += (i === 0 ? "" : " ") + words[i];
      setStreamingText(currentText);
    }
    return text;
  };

  const handleSubmit = async () => {
    if (!inputMessage.trim() && !image) {
      setError("Veuillez entrer un message ou télécharger une image");
      return;
    }

    setLoading(true);
    setError("");
    setStreamingText("");

    const newUserMessage = {
      type: "user",
      text: inputMessage,
      image: previewImage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    const placeholderMessage = {
      type: "assistant",
      text: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, placeholderMessage]);

    const formData = new FormData();
    formData.append("query", inputMessage);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch("http://localhost:8001/api/v1/process", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const finalText = await simulateStream(data.response);

      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? {
                ...msg,
                text: finalText,
                isStreaming: false,
              }
            : msg
        )
      );
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi du message");
      console.error(err);
    } finally {
      setLoading(false);
      setInputMessage("");
      clearImage();
      setStreamingText("");
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const Message = ({ message }) => {
    const isUser = message.type === "user";
    const isStreaming = message.type === "assistant" && message.isStreaming;

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        {message.type === "assistant" && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        )}

        <div
          className={`max-w-2xl rounded-2xl px-4 py-3 ${
            isUser ? "bg-primary text-white" : "bg-blue-50 text-gray-700"
          }`}
        >
          {message.image && (
            <img
              src={message.image}
              alt="Uploaded"
              className="max-w-sm mb-2 rounded-lg"
            />
          )}
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold mb-4 mt-2" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold mb-3 mt-2" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-bold mb-2 mt-2" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc ml-6 mb-4" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal ml-6 mb-4" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              p: ({ node, ...props }) => (
                <p className="mb-2 last:mb-0 whitespace-pre-wrap" {...props} />
              ),
              code: ({ node, inline, ...props }) => (
                <code
                  className={`${
                    inline
                      ? "bg-blue-100 px-1 rounded"
                      : "block bg-blue-100 p-2 rounded-lg my-2"
                  }`}
                  {...props}
                />
              ),
            }}
          >
            {isStreaming ? streamingText || "..." : message.text}
          </ReactMarkdown>
          <p
            className={`text-xs mt-1 ${
              isUser ? "text-white/70" : "text-gray-500"
            }`}
          >
            {formatTimestamp(message.timestamp)}
          </p>
        </div>

        {isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ml-3 shrink-0">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="h-screen flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Assistant Médical IA
          </h1>
        </div>
        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Effacer</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xl font-semibold mb-2">
              Comment puis-je vous aider ?
            </p>
            <p className="text-sm">
              Posez vos questions ou téléchargez des images médicales pour
              analyse
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-gray-50 p-6 shrink-0">
        {previewImage && (
          <div className="relative inline-block mb-4">
            <img src={previewImage} alt="Preview" className="h-20 rounded-lg" />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full p-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows="3"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer p-2 hover:bg-white rounded-xl transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Upload className="w-6 h-6 text-gray-500 hover:text-primary" />
            </label>
            <button
              onClick={handleSubmit}
              disabled={loading || (!inputMessage.trim() && !image)}
              className="p-3 text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
