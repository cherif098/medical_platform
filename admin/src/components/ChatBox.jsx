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

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const messagesEndRef = useRef(null);

  const userId = doctorProfile?.ID || nurseProfile?.ID;

useEffect(() => {
const handleNewMessage = (newMessage) => {
  if (newMessage.conversation_id === conversation.conversation_id) {
    setMessages(prev => [...prev, {
      MESSAGE_ID: newMessage.message_id,
      CONVERSATION_ID: newMessage.conversation_id,
      SENDER_ID: newMessage.sender_id,
      RECEIVER_ID: newMessage.receiver_id,
      CONTENT: newMessage.content,
      FILE_URL: newMessage.file_url,
      SENT_AT: newMessage.sent_at
    }]);
    scrollToBottom();
  }
};

  socket.on("newMessage", handleNewMessage);
  return () => socket.off("newMessage", handleNewMessage);
}, [conversation?.conversation_id]);
  

  const markMessagesAsRead = async () => {
    if (!conversation?.conversation_id) return;
  
    try {
      await axios.get(`${backendUrl}/api/messages/${conversation.contact_id}/${conversation.contact_type}`, {
        headers: { dtoken: dToken || "", ntoken: nToken || "" },
      });
  
    } catch (error) {
      console.error(" Erreur lors de la mise à jour des messages lus :", error);
    }
  };
  
  
  const fetchMessages = async () => {
    if (!conversation?.conversation_id) return;
  
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/messages/${conversation.contact_id}/${conversation.contact_type}`,
        { headers: { dtoken: dToken, ntoken: nToken } }
      );
  
      setMessages(data || []);
      markMessagesAsRead(); 
      scrollToBottom();
    } catch (error) {
      console.error("Erreur lors de la récupération des messages :", error);
    }
  };
  

  const sendMessage = async () => {
    if (!message.trim() && !file) return;
  
    try {
      const formData = new FormData();
      formData.append("receiverId", conversation?.contact_id);
      formData.append("receiverType", conversation?.contact_type);
      formData.append("content", message);
      if (file) formData.append("file", file);
  
      const response = await axios.post(
        `${backendUrl}/api/messages`,
        formData,
        { headers: { dtoken: dToken, ntoken: nToken } }
      );
  
      if (response.data.success) {
        setMessage("");
        setFile(null);
        setPreview(null);
  
        const newMessage = {
          MESSAGE_ID: response.data.messageId,
          SENDER_ID: userId,
          RECEIVER_ID: conversation?.contact_id,
          CONTENT: message || null,
          FILE_URL: response.data.fileUrl || null, 
          SENT_AT: new Date().toISOString(),  
        };
  
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
        refreshConversations(); 
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };
  
  

  useEffect(() => {
    fetchMessages().then(() => {
      scrollToBottom(); 
    });
  }, [conversation]);
  
  useEffect(() => {
    scrollToBottom(); 
  }, [messages]);
  

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

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={msg.MESSAGE_ID || `message-${index}`} className={`flex flex-col mb-3 ${msg.SENDER_ID === conversation.contact_id ? "items-start" : "items-end"}`}>
        
            {msg.CONTENT && (
              <div className={`p-4 text-[14px] max-w-[300px] rounded-lg shadow-md ${msg.SENDER_ID === conversation.contact_id ? "bg-gray-300 text-black rounded-bl-none" : "bg-blue-500 text-white rounded-br-none"}`}>
                {msg.CONTENT}
              </div>
            )}
            {msg.FILE_URL && (
              <img 
                src={msg.FILE_URL} 
                alt="Image envoyée" 
                className="w-48 h-auto rounded-md shadow-md mt-2 cursor-pointer"
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
  <div className="sticky bottom-0 left-0 right-0 bg-white p-4 flex items-center border-t">
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
      className="flex-1 p-3 border rounded-lg resize-none focus:outline-none min-h-[40px] max-h-[100px] overflow-y-auto"
    />

    <button onClick={sendMessage} className="p-2 ml-2 rounded-full hover:bg-blue-100">
      <Send size={24} className="text-blue-500" />
    </button>
  </div>
    </div>
  );
};

export default ChatBox;