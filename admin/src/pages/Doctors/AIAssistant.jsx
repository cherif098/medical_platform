import React, { useState, useRef, useEffect, useContext } from "react";
import {
  PaperAirplaneIcon,
  DocumentArrowUpIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  User2,
  Bot,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  X,
} from "lucide-react";
import { DoctorContext } from "../../context/DoctorContext";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const AIAssistant = () => {
  const { profileData } = useContext(DoctorContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversationDetails, setCurrentConversationDetails] =
    useState(null);
  const [showToast, setShowToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadConversations();
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      loadConversationDetails(currentConversationId);
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get("http://localhost:8000/conversations");
      setConversations(response.data);
    } catch (error) {
      showToastMessage("Erreur lors du chargement des conversations", "error");
    }
  };

  const loadConversationDetails = async (conversationId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/conversation/${conversationId}`
      );
      setCurrentConversationDetails(response.data);
    } catch (error) {
      showToastMessage("Erreur lors du chargement des détails", "error");
    }
  };

  const showToastMessage = (message, type = "info") => {
    setShowToast({ show: true, message, type });
    setTimeout(
      () => setShowToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:8000/upload-documents",
        formData
      );
      const { conversation_id, patient_name, doctor_name } = response.data;

      setCurrentConversationId(conversation_id);
      setMessages([
        {
          type: "system",
          content: `Nouvelle consultation démarrée pour le patient ${patient_name} avec Dr. ${doctor_name}`,
        },
      ]);
      await loadConversations();
      showToastMessage("Documents chargés avec succès");
    } catch (error) {
      showToastMessage("Erreur lors du chargement des documents", "error");
    } finally {
      setIsLoading(false);
      event.target.value = null;
    }
  };

  const handleConversationSelect = (conversationId) => {
    setCurrentConversationId(conversationId);
    setMessages([]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setCurrentConversationDetails(null);
    setMessages([]);
    fileInputRef.current?.click();
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
    if (!input.trim() || !currentConversationId) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:8000/ask", {
        question: userMessage,
        conversation_id: currentConversationId,
      });

      const streamedText = await simulateStream(response.data.answer);
      setMessages((prev) => [
        ...prev,
        { type: "assistant", content: streamedText },
      ]);
      await loadConversations();
    } catch (error) {
      showToastMessage("Erreur lors de l'envoi du message", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const MessageComponent = ({ message }) => {
    const isUser = message.type === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        )}
        <div
          className={`max-w-2xl rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-white"
              : message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-gray-50 text-gray-700"
          }`}
        >
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="my-1" {...props} />,
              code: ({ node, ...props }) => (
                <code
                  className={`${
                    isUser ? "bg-primary-700" : "bg-gray-100"
                  } px-1 rounded`}
                  {...props}
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {isUser && profileData?.IMAGE && (
          <div className="w-8 h-8 rounded-full overflow-hidden ml-3">
            <img
              src={profileData.IMAGE}
              alt="Doctor"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  };

  const ConversationItem = ({ conversation, isSelected }) => (
    <button
      onClick={() => handleConversationSelect(conversation.id)}
      className={`w-full p-4 text-left rounded-xl transition-colors ${
        isSelected ? "bg-primary text-white" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <User2
            className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-600"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {conversation.patient_name}
          </div>
          <div
            className={`text-sm truncate ${
              isSelected ? "text-white/80" : "text-gray-500"
            }`}
          >
            {conversation.diagnosis}
          </div>
        </div>
      </div>
      <div
        className={`flex items-center gap-2 mt-2 text-sm ${
          isSelected ? "text-white/70" : "text-gray-400"
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span>{formatDate(conversation.consultation_date)}</span>
      </div>
    </button>
  );

  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Stethoscope className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Assistant Médical IA
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        Téléversez des documents médicaux pour démarrer une nouvelle
        consultation ou sélectionnez une consultation existante.
      </p>
    </div>
  );
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-80 h-full border-r bg-white flex flex-col z-40 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Consultations</h2>
            <button
              onClick={startNewConversation}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
            >
              <PlusCircleIcon className="w-6 h-6" />
            </button>
          </div>
          {profileData && (
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
              {profileData.IMAGE ? (
                <img
                  src={profileData.IMAGE}
                  alt="Doctor"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  Dr. {profileData.NAME}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {profileData.SPECIALTY}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={currentConversationId === conversation.id}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <User2 className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {currentConversationDetails ? (
          <>
            <div className="px-6 py-4 border-b bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User2 className="w-7 h-7 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-800 truncate">
                    {currentConversationDetails.patient_name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 overflow-x-auto">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      {currentConversationDetails.diagnosis}
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      {formatDate(currentConversationDetails.consultation_date)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.map((message, idx) => (
                <MessageComponent key={idx} message={message} />
              ))}
              {currentStreamedMessage && (
                <MessageComponent
                  message={{
                    type: "assistant",
                    content: currentStreamedMessage,
                  }}
                />
              )}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <EmptyState />
        )}

        {/* File upload input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
          accept=".pdf"
        />

        {/* Toast notifications */}
        {showToast.show && (
          <div
            className={`fixed bottom-4 right-4 max-w-md p-4 rounded-xl shadow-lg animate-fade-in ${
              showToast.type === "error" ? "bg-red-500" : "bg-primary"
            } text-white`}
          >
            <div className="flex items-center gap-2">
              <span>{showToast.message}</span>
              <button
                onClick={() =>
                  setShowToast({ show: false, message: "", type: "info" })
                }
                className="p-1 hover:opacity-80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
