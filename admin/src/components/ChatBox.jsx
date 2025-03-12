import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import { Image, Send, XCircle, Info, X } from "lucide-react";
import moment from "moment-timezone";
import { socket } from "../socket";

const ChatBox = ({ conversation, refreshConversations, onOpenSidebar }) => {
  const { dToken, profileData: doctorProfile } = useContext(DoctorContext);
  const { nToken, profileData: nurseProfile } = useContext(NurseContext);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const userId = doctorProfile?.ID || nurseProfile?.ID;
  const userType = doctorProfile?.ID ? "DOCTOR" : "NURSE";

  // Générer l'ID de conversation
  const generateConversationId = () => {
    if (!conversation?.contact_id) return null;

    const senderType = userType;
    const receiverType = conversation.contact_type.toUpperCase();

    const formattedSender = `${senderType}_${userId}`;
    const formattedReceiver = `${receiverType}_${conversation.contact_id}`;

    const [first, second] = [formattedSender, formattedReceiver].sort();
    return `${first}-${second}`;
  };

  // Vérifier la connexion Socket.io
  useEffect(() => {
    if (!socket) {
      console.error("Socket n'est pas initialisé!");
      return;
    }

    const handleConnect = () => {
      console.log("Socket.io connecté!");
      setIsSocketConnected(true);

      // Rejoindre les rooms nécessaires
      if (userId && userType) {
        socket.emit("userConnected", { userId, userType });

        // Si une conversation est déjà sélectionnée, la rejoindre
        if (conversation?.contact_id) {
          joinConversation();
        }
      }
    };

    const handleDisconnect = (reason) => {
      console.log("Socket.io déconnecté:", reason);
      setIsSocketConnected(false);
    };

    // Enregistrer les événements de connexion
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Vérifier l'état actuel
    setIsSocketConnected(socket.connected);

    // Test de ping/pong pour vérifier la connexion
    if (socket.connected) {
      socket.emit(
        "ping",
        { clientTime: new Date().toISOString() },
        (response) => {
          console.log("Ping/pong réussi:", response);
        }
      );
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [userId, userType]);

  // Rejoindre la conversation
  const joinConversation = () => {
    if (
      !socket ||
      !isSocketConnected ||
      !userId ||
      !userType ||
      !conversation?.contact_id
    ) {
      console.error(
        "Impossible de rejoindre la conversation - prérequis manquants"
      );
      return;
    }

    console.log("Tentative de rejoindre la conversation:", {
      userId,
      userType,
      otherUserId: conversation.contact_id,
      otherUserType: conversation.contact_type,
    });

    socket.emit(
      "joinConversation",
      {
        userId,
        userType,
        otherUserId: conversation.contact_id,
        otherUserType: conversation.contact_type,
      },
      (response) => {
        console.log("Résultat joinConversation:", response);
      }
    );
  };

  // Écouter les nouveaux messages
  useEffect(() => {
    if (!socket) return;

    const generatedId = generateConversationId();

    const handleNewMessage = (newMessage) => {
      console.log("Message reçu via Socket.io:", newMessage);

      // Vérifier si ce message appartient à la conversation actuelle
      const messageMatches =
        newMessage.conversation_id === conversation?.conversation_id ||
        newMessage.conversation_id === generatedId ||
        (newMessage.sender_id === conversation?.contact_id &&
          newMessage.receiver_id === userId) ||
        (newMessage.sender_id === userId &&
          newMessage.receiver_id === conversation?.contact_id);

      if (messageMatches) {
        // Ajouter le message s'il n'existe pas déjà
        setMessages((prev) => {
          // Vérifier si le message existe déjà
          const exists = prev.some(
            (m) =>
              (m.MESSAGE_ID && m.MESSAGE_ID === newMessage.message_id) ||
              (m.SENT_AT === newMessage.sent_at &&
                m.CONTENT === newMessage.content)
          );

          if (!exists) {
            setTimeout(scrollToBottom, 0);
          }

          return exists
            ? prev
            : [
                ...prev,
                {
                  MESSAGE_ID: newMessage.message_id,
                  CONVERSATION_ID: newMessage.conversation_id,
                  SENDER_ID: newMessage.sender_id,
                  RECEIVER_ID: newMessage.receiver_id,
                  CONTENT: newMessage.content,
                  FILE_URL: newMessage.file_url,
                  SENT_AT: newMessage.sent_at,
                },
              ];
        });

        // Mettre à jour la liste des conversations
        if (refreshConversations) {
          refreshConversations({
            ...conversation,
            last_message: newMessage.content || "Image",
          });
        }
      }
    };

    // Écouter à la fois les messages spécifiques et globaux
    socket.on("newMessage", handleNewMessage);
    socket.on("globalMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("globalMessage", handleNewMessage);
    };
  }, [conversation, userId]);

  const isUserAtBottom = () => {
    if (!chatContainerRef.current) return true;

    const container = chatContainerRef.current;
    const threshold = 100; // pixels

    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold
    );
  };

  const fetchMessages = async () => {
    try {
      const wasAtBottom = isUserAtBottom();

      const { data } = await axios.get(
        `${backendUrl}/api/messages/${conversation.contact_id}/${conversation.contact_type}`,
        {
          headers: { dtoken: dToken || "", ntoken: nToken || "" },
        }
      );

      setMessages(data || []);

      if (wasAtBottom) {
        setTimeout(scrollToBottom, 50);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages :", error);
    }
  };

  // Envoyer un message
  const sendMessage = async (e) => {
    e?.preventDefault();

    if ((!message.trim() && !file) || !conversation?.contact_id) return;

    try {
      const formData = new FormData();
      formData.append("receiverId", conversation.contact_id);
      formData.append("receiverType", conversation.contact_type);
      formData.append("content", message);
      if (file) formData.append("file", file);

      // Sauvegarder le contenu avant de vider les champs
      const messageContent = message;
      const messageFile = file;

      // Vider les champs immédiatement pour une meilleure UX
      setMessage("");
      setFile(null);
      setPreview(null);

      // Ajouter le message localement immédiatement pour une meilleure UX
      const tempMessageId = `temp-${Date.now()}`;
      const tempMessage = {
        MESSAGE_ID: tempMessageId,
        SENDER_ID: userId,
        RECEIVER_ID: conversation.contact_id,
        CONTENT: messageContent,
        FILE_URL: preview,
        SENT_AT: new Date().toISOString(),
        IS_TEMP: true,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setTimeout(scrollToBottom, 0);

      // Envoyer au serveur
      const response = await axios.post(
        `${backendUrl}/api/messages`,
        formData,
        { headers: { dtoken: dToken || "", ntoken: nToken || "" } }
      );

      if (response.data.success) {
        // Si le message a été envoyé avec succès, remplacer le message temporaire
        setMessages((prev) =>
          prev.map((msg) =>
            msg.MESSAGE_ID === tempMessageId
              ? {
                  ...msg,
                  MESSAGE_ID: response.data.messageId,
                  FILE_URL: response.data.fileUrl || msg.FILE_URL,
                  IS_TEMP: false,
                }
              : msg
          )
        );
      }

      // Mettre à jour la liste des conversations
      if (refreshConversations) {
        refreshConversations({
          ...conversation,
          last_message: messageContent || "Image",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);

      // En cas d'erreur, marquer le message temporaire comme ayant échoué
      setMessages((prev) =>
        prev.map((msg) => (msg.IS_TEMP ? { ...msg, FAILED: true } : msg))
      );
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const wasAtBottom = isUserAtBottom();
      fetchMessages().then(() => {
        if (wasAtBottom) {
          setTimeout(scrollToBottom, 50);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [conversation]);

  // Rejoindre la conversation et charger les messages quand la conversation change
  useEffect(() => {
    if (conversation?.contact_id) {
      joinConversation();
      fetchMessages();
    }
  }, [conversation]);

  // Faire défiler vers le bas quand les messages sont chargés initialement
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  // Gérer l'envoi avec Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Chat Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={conversation.image || "/default-avatar.png"}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{conversation.name}</p>
            <p className="text-xs text-gray-500">En ligne</p>
          </div>
        </div>
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.MESSAGE_ID || `message-${index}`}
              className={`flex flex-col ${
                msg.SENDER_ID === conversation.contact_id
                  ? "items-start"
                  : "items-end"
              }`}
            >
              <div className="flex items-end gap-2 max-w-[75%]">
                {msg.SENDER_ID === conversation.contact_id && (
                  <img
                    src={conversation.image || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mb-1 object-cover"
                  />
                )}

                <div className="flex flex-col">
                  {msg.CONTENT && (
                    <div
                      className={`p-3 rounded-2xl shadow-sm 
                        ${
                          msg.SENDER_ID === conversation.contact_id
                            ? "bg-white text-gray-800 rounded-bl-none"
                            : "bg-blue-600 text-white rounded-br-none"
                        }
                        ${msg.FAILED ? "opacity-60" : ""}`}
                    >
                      <p className="text-sm">{msg.CONTENT}</p>
                      {msg.FAILED && (
                        <div className="text-xs mt-1 text-red-300 flex items-center gap-1">
                          <XCircle size={12} />
                          Échec de l'envoi
                        </div>
                      )}
                    </div>
                  )}

                  {msg.FILE_URL && (
                    <div
                      className={`mt-1 rounded-lg overflow-hidden ${
                        msg.FAILED ? "opacity-60" : ""
                      }`}
                    >
                      <img
                        src={msg.FILE_URL}
                        alt="Image envoyée"
                        className="max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setFullImage(msg.FILE_URL)}
                      />
                    </div>
                  )}

                  <span className="text-[10px] text-gray-500 mt-1 self-end">
                    {moment(msg.SENT_AT).tz("America/Montreal").format("HH:mm")}
                  </span>
                </div>

                {msg.SENDER_ID !== conversation.contact_id && (
                  <img
                    src={
                      doctorProfile?.IMAGE ||
                      nurseProfile?.IMAGE ||
                      "/default-avatar.png"
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mb-1 object-cover"
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {/* Full Image Preview */}
      {fullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={fullImage}
              alt="Image agrandie"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setFullImage(null)}
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}

      {/* Message Input Area */}
      <div className="px-4 py-3 bg-white border-t">
        {preview && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg flex items-center">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-md"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute -top-2 -right-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-700"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex items-end gap-2">
          <label
            htmlFor="fileInput"
            className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-600 self-end"
          >
            <Image size={20} />
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreview(URL.createObjectURL(selectedFile));
                }
              }}
            />
          </label>

          <div className="flex-1 relative">
            <textarea
              placeholder="Écrire un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 pr-10 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent min-h-[44px] max-h-[120px] text-sm"
              style={{
                overflowY: message.split("\n").length > 2 ? "auto" : "hidden",
              }}
            />
          </div>

          <button
            type="submit"
            className={`p-3 rounded-full ${
              message.trim() || file
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            } hover:shadow-md transition-all`}
            disabled={!message.trim() && !file}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
