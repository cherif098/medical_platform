import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Upload, Loader2, Send, X, Trash2 } from "lucide-react";

export default function MedicalChatInterface() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };


  const handleSubmit = async () => {
    if (!inputMessage.trim() && !image) {
      setError("Please enter a message or upload an image");
      return;
    }
  
    setLoading(true);
    setError("");
  
    const newUserMessage = {
      type: "user",
      text: inputMessage,
      image: previewImage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
  
    const formData = new FormData();
    formData.append("query", inputMessage);
    if (image) {
      formData.append("image", image);
    }
  
    try {
      // Création du message assistant vide au début
      const assistantMessage = {
        type: "assistant",
        text: "",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
  
      const response = await fetch("http://localhost:8000/api/v1/process", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      // Simuler un streaming du texte
      const finalText = data.response;
      const words = finalText.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Délai entre chaque mot
        setMessages(prev => prev.map((msg, idx) => {
          if (idx === prev.length - 1) {
            return {
              ...msg,
              text: words.slice(0, i + 1).join(' ')
            };
          }
          return msg;
        }));
      }
  
    } catch (err) {
      setError("An error occurred while sending the message");
      console.error(err);
    } finally {
      setLoading(false);
      setInputMessage("");
      clearImage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const Message = ({ message }) => (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[80%] ${
          message.type === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-900"
        } rounded-lg px-4 py-2`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="Uploaded"
            className="max-w-sm mb-2 rounded"
          />
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
        <p
          className={`text-xs mt-1 ${
            message.type === "user" ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">
            Medical AI Assistant
          </h1>
        </div>
        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-4" />
            <p className="text-lg">
              Start a conversation with the Medical AI Assistant
            </p>
            <p className="text-sm mt-2">
              You can ask questions and upload medical images for analysis
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message key={index} message={message} />
          ))
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
      <div className="border-t bg-white p-6 shrink-0">
        {previewImage && (
          <div className="relative inline-block mb-4">
            <img src={previewImage} alt="Preview" className="h-20 rounded" />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
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
              placeholder="Type your message..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
            <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Upload className="w-6 h-6 text-gray-500 hover:text-blue-600" />
            </label>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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
