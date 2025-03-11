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
      socket.emit("ping", { clientTime: new Date().toISOString() }, (response) => {
        console.log("Ping/pong réussi:", response);
      });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [userId, userType]);

  // Rejoindre la conversation
  const joinConversation = () => {
    if (!socket || !isSocketConnected || !userId || !userType || !conversation?.contact_id) {
      console.error("Impossible de rejoindre la conversation - prérequis manquants");
      return;
    }
    
    console.log("Tentative de rejoindre la conversation:", {
      userId,
      userType,
      otherUserId: conversation.contact_id,
      otherUserType: conversation.contact_type
    });
    
    socket.emit("joinConversation", {
      userId,
      userType,
      otherUserId: conversation.contact_id,
      otherUserType: conversation.contact_type
    }, (response) => {
      console.log("Résultat joinConversation:", response);
    });
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
        (newMessage.sender_id === conversation?.contact_id && newMessage.receiver_id === userId) ||
        (newMessage.sender_id === userId && newMessage.receiver_id === conversation?.contact_id);
      
      if (messageMatches) {
        // Ajouter le message s'il n'existe pas déjà
        setMessages(prev => {
          // Vérifier si le message existe déjà
          const exists = prev.some(m => 
            (m.MESSAGE_ID && m.MESSAGE_ID === newMessage.message_id) || 
            (m.SENT_AT === newMessage.sent_at && m.CONTENT === newMessage.content)
          );
          
          if (!exists) {
            
            setTimeout(scrollToBottom, 0);
          }
          
          return [...prev, {
            MESSAGE_ID: newMessage.message_id,
            CONVERSATION_ID: newMessage.conversation_id,
            SENDER_ID: newMessage.sender_id,
            RECEIVER_ID: newMessage.receiver_id,
            CONTENT: newMessage.content,
            FILE_URL: newMessage.file_url,
            SENT_AT: newMessage.sent_at
          }];
        });
        
        // Mettre à jour la liste des conversations
        if (refreshConversations) {
          refreshConversations({
            ...conversation,
            last_message: newMessage.content || "Image"
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
  
      const { data } = await axios.get(`${backendUrl}/api/messages/${conversation.contact_id}/${conversation.contact_type}`, {
        headers: { dtoken: dToken || "", ntoken: nToken || "" },
      });
  
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
        IS_TEMP: true  
      };
      
      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();
      
      // Envoyer au serveur
      const response = await axios.post(
        `${backendUrl}/api/messages`,
        formData,
        { headers: { dtoken: dToken || "", ntoken: nToken || "" } }
      );
      
      if (response.data.success) {
        // Si le message a été envoyé avec succès, remplacer le message temporaire
        setMessages(prev => prev.map(msg => 
          msg.MESSAGE_ID === tempMessageId ? {
            ...msg,
            MESSAGE_ID: response.data.messageId,
            FILE_URL: response.data.fileUrl || msg.FILE_URL,
            IS_TEMP: false
          } : msg
        ));
      }
      
      // Mettre à jour la liste des conversations
      if (refreshConversations) {
        refreshConversations({
          ...conversation,
          last_message: messageContent || "Image"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      
      // En cas d'erreur, marquer le message temporaire comme ayant échoué
      setMessages(prev => prev.map(msg => 
        msg.IS_TEMP ? {...msg, FAILED: true} : msg
      ));
    }
  };
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "instant",
        block: "end"
      });
    }
  };
  
  
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
    if (!messagesEndRef.current || !messagesEndRef.current.parentElement) return false;
  
    const chatContainer = messagesEndRef.current.parentElement;
    const threshold = 50; 
    
    return chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < threshold;
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 shadow-lg">
      <div className="px-4 py-3 flex items-center justify-between border-b bg-white">
        <div className="flex items-center">
          <img
            src={conversation.image || "/default-avatar.png"}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
          <p className="ml-3 text-lg font-semibold text-gray-700">
            {conversation.name}
          </p>
        </div>
        <button onClick={onOpenSidebar} className="p-2 rounded-full hover:bg-gray-200">
          <Info size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {messages.map((msg, index) => (
          <div 
            key={msg.MESSAGE_ID || `message-${index}`} 
            className={`flex flex-col mb-3 ${msg.SENDER_ID === conversation.contact_id ? "items-start" : "items-end"}`}
          >
            {msg.CONTENT && (
              <div 
                className={`p-4 text-[14px] max-w-[300px] rounded-lg shadow-md 
                  ${msg.SENDER_ID === conversation.contact_id ? "bg-gray-300 text-black rounded-bl-none" : "bg-blue-500 text-white rounded-br-none"}
                  ${msg.FAILED ? "opacity-50" : ""}`}
              >
                {msg.CONTENT}
                {msg.FAILED && <div className="text-xs mt-1 text-red-500">Échec de l'envoi</div>}
              </div>
            )}
            {msg.FILE_URL && (
              <img 
                src={msg.FILE_URL} 
                alt="Image envoyée" 
                className={`w-48 h-auto rounded-md shadow-md mt-2 cursor-pointer ${msg.FAILED ? "opacity-50" : ""}`}
                onClick={() => setFullImage(msg.FILE_URL)}
              />
            )}

            <p className="text-[10px] text-gray-500 mt-1">
              {moment(msg.SENT_AT).tz("America/Montreal").format("hh:mm A")}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {fullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <img src={fullImage} alt="Image agrandie" className="max-w-[90%] max-h-[90%] object-contain" />
          <button className="absolute top-5 right-5 text-white" onClick={() => setFullImage(null)}>
            <X size={32} />
          </button>
        </div>
      )}
      
      {preview && (
        <div className="p-3 flex items-center">
          <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-md mr-3" />
          <button onClick={() => { setFile(null); setPreview(null); }} className="text-red-500 ml-2">
            <XCircle size={20} />
          </button>
        </div>
      )}
      
      <form onSubmit={sendMessage} className="sticky bottom-0 z-10 bg-white p-4 flex items-center border-t shadow-lg">
        <label htmlFor="fileInput" className="cursor-pointer p-2 ml-2 rounded-full hover:bg-gray-200">
          <Image size={24} className="text-gray-600" />
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

        <textarea
          placeholder="Écrire un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-3 border rounded-lg resize-none focus:outline-none min-h-[40px] max-h-[100px] overflow-y-auto"
        />

        <button type="submit" className="p-2 ml-2 rounded-full hover:bg-blue-100">
          <Send size={24} className="text-blue-500" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;