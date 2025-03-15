import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import { Image, Send, XCircle, Info, X, ArrowDown } from "lucide-react";
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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

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
    console.log({
      socket: !!socket,
      isSocketConnected,
      userId,
      userType,
      contactId: conversation?.contact_id,
    });
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

          return [
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
        scrollToBottom();
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
      scrollToBottom();

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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      setShowScrollToBottom(!isUserAtBottom());
    }
  };

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => chatContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const wasAtBottom = isUserAtBottom();
      fetchMessages().then(() => {
        if (wasAtBottom) scrollToBottom();
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [conversation]);

  const isUserAtBottom = () => {
    if (!messagesEndRef.current || !chatContainerRef.current) return false;

    const chatContainer = chatContainerRef.current;
    const threshold = 100;

    return (
      chatContainer.scrollHeight -
        chatContainer.scrollTop -
        chatContainer.clientHeight <
      threshold
    );
  };

  // Rejoindre la conversation et charger les messages quand la conversation change
  useEffect(() => {
    if (conversation?.contact_id) {
      joinConversation();
      fetchMessages();
    }
  }, [conversation]);

  // Faire défiler vers le bas quand les messages changent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gérer l'envoi avec Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Fonction pour grouper les messages par date
  const groupMessagesByDate = () => {
    const groups = {};

    messages.forEach((msg) => {
      const date = moment(msg.SENT_AT)
        .tz("America/Montreal")
        .format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });

    return groups;
  };

  // Formater la date pour l'affichage
  const formatDateHeader = (dateStr) => {
    const today = moment().tz("America/Montreal").format("YYYY-MM-DD");
    const yesterday = moment()
      .subtract(1, "days")
      .tz("America/Montreal")
      .format("YYYY-MM-DD");

    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterday) return "Hier";
    return moment(dateStr).tz("America/Montreal").format("DD MMMM YYYY");
  };

  // Obtenir les groupes de messages
  const messageGroups = groupMessagesByDate();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-4 py-3 flex items-center justify-between border-b bg-white shadow-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-blue-100 overflow-hidden border border-blue-200">
            <img
              src={conversation.image || "/default-avatar.png"}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-3">
            <p className="text-lg font-semibold text-gray-800">
              {conversation.name}
            </p>
            {isSocketConnected && (
              <p className="text-xs text-green-500 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                En ligne
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <Info size={22} className="text-gray-600" />
        </button>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 relative bg-gradient-to-b from-blue-50 to-gray-50"
      >
        {Object.keys(messageGroups).map((date) => (
          <div key={date} className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-200 rounded-full px-4 py-1 text-xs text-gray-600 font-medium">
                {formatDateHeader(date)}
              </div>
            </div>

            {messageGroups[date].map((msg, index) => {
              const isSender = msg.SENDER_ID !== conversation.contact_id;
              const isFirstInGroup =
                index === 0 ||
                messageGroups[date][index - 1].SENDER_ID !== msg.SENDER_ID;
              const isLastInGroup =
                index === messageGroups[date].length - 1 ||
                messageGroups[date][index + 1].SENDER_ID !== msg.SENDER_ID;

              return (
                <div
                  key={msg.MESSAGE_ID || `message-${date}-${index}`}
                  className={`flex flex-col mb-1 ${
                    isSender ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex max-w-xs md:max-w-md">
                    {!isSender && isFirstInGroup && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 self-end mb-1 overflow-hidden flex-shrink-0">
                        <img
                          src={conversation.image || "/default-avatar.png"}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!isSender && !isFirstInGroup && (
                      <div className="w-8 mr-2"></div>
                    )}

                    <div className="flex flex-col">
                      {msg.CONTENT && (
                        <div
                          className={`p-3 text-sm rounded-2xl shadow-sm
                            ${
                              isSender
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                            }
                            ${isFirstInGroup ? "mt-2" : ""}
                            ${msg.FAILED ? "opacity-60" : ""}
                            ${!isLastInGroup ? "mb-1" : "mb-0"}`}
                        >
                          {msg.CONTENT}
                          {msg.FAILED && (
                            <div className="text-xs mt-1 flex items-center text-red-200">
                              <XCircle size={12} className="mr-1" />
                              Échec de l'envoi
                            </div>
                          )}
                        </div>
                      )}

                      {msg.FILE_URL && (
                        <div
                          className={`mt-1 mb-1 overflow-hidden ${
                            isSender ? "rounded-lg" : "rounded-lg"
                          } shadow-sm border ${
                            isSender ? "border-blue-400" : "border-gray-200"
                          }`}
                        >
                          <img
                            src={msg.FILE_URL}
                            alt="Image envoyée"
                            className={`w-48 h-auto cursor-pointer ${
                              msg.FAILED ? "opacity-60" : ""
                            }`}
                            onClick={() => setFullImage(msg.FILE_URL)}
                          />
                        </div>
                      )}

                      {isLastInGroup && (
                        <p
                          className={`text-xs text-gray-400 ${
                            isSender ? "text-right" : "text-left"
                          } mt-1`}
                        >
                          {moment(msg.SENT_AT)
                            .tz("America/Montreal")
                            .format("HH:mm")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef}></div>

        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowDown size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {fullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <img
            src={fullImage}
            alt="Image agrandie"
            className="max-w-[90%] max-h-[90%] object-contain"
          />
          <button
            className="absolute top-5 right-5 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-colors duration-200"
            onClick={() => setFullImage(null)}
          >
            <X size={24} />
          </button>
        </div>
      )}

      {preview && (
        <div className="px-4 py-2 flex items-center bg-gray-100 border-t">
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
              className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full shadow-md border border-gray-200"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={sendMessage}
        className="bg-white p-3 flex items-end gap-2 border-t"
      >
        <label
          htmlFor="fileInput"
          className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <Image size={22} className="text-gray-600" />
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

        <div className="flex-1 border rounded-2xl bg-gray-50 focus-within:bg-white focus-within:border-blue-300 transition-all duration-200 overflow-hidden">
          <textarea
            placeholder="Écrire un message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 bg-transparent resize-none focus:outline-none min-h-[40px] max-h-[120px] text-gray-800"
          />
        </div>

        <button
          type="submit"
          className={`p-3 rounded-full ${
            message.trim() || file
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400"
          } transition-colors duration-200`}
          disabled={!message.trim() && !file}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
