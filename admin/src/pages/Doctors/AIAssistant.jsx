import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  PaperAirplaneIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedMessage]);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setIsLoading(true);
      await axios.post("http://localhost:8000/upload-documents", formData);
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: "Documents uploaded and processed successfully!",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: "Error uploading documents: " + error.message,
        },
      ]);
    } finally {
      setIsLoading(false);
      event.target.value = null;
    }
  };

  const simulateStream = async (text) => {
    const words = text.split(" ");
    setCurrentStreamedMessage("");

    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      setCurrentStreamedMessage((prev) => prev + " " + words[i]);
    }

    setCurrentStreamedMessage("");
    return text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:8000/ask", {
        question: userMessage,
      });

      const streamedText = await simulateStream(response.data.answer);

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: streamedText,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: "Error: " + error.message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageComponent = ({ message }) => {
    const bgColor =
      message.type === "user"
        ? "bg-primary text-white"
        : message.type === "error"
        ? "bg-red-100 text-red-800"
        : "bg-gray-100";

    return (
      <div
        className={`w-full p-4 ${
          message.type === "user" ? "flex justify-end" : ""
        }`}
      >
        <div className={`max-w-3xl ${bgColor} rounded-lg p-4 shadow-sm`}>
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold my-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold my-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-bold my-2" {...props} />
              ),
              p: ({ node, ...props }) => <p className="my-2" {...props} />,
              strong: ({ node, ...props }) => (
                <strong className="font-bold" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="bg-gray-800 text-white p-1 rounded"
                  {...props}
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
      {/* En-tête */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-130px)]">
        <div className="max-w-6xl mx-auto w-full">
          {messages.map((message, idx) => (
            <MessageComponent key={idx} message={message} />
          ))}
          {currentStreamedMessage && (
            <div className="w-full p-4">
              <div className="max-w-3xl bg-gray-100 rounded-lg p-4 shadow-sm">
                <ReactMarkdown>{currentStreamedMessage}</ReactMarkdown>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="w-full border-t bg-white p-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-primary transition-colors"
              disabled={isLoading}
            >
              <DocumentArrowUpIcon className="w-6 h-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".pdf"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-2 text-white bg-primary rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
