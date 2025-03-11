import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import { Search , User} from "lucide-react";

const ChatSidebar = ({ onSelectConversation }) => {
  const { dToken} = useContext(DoctorContext);
  const { nToken} = useContext(NurseContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchRecentChats = async () => {
    try {
      const token = dToken || nToken;
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/messages/recent`, {
        headers: { dtoken: dToken || "", ntoken: nToken || "" },
      });

      if (data && Array.isArray(data)) {
        const uniqueConversations = {};
        data.forEach(chat => {
          const normalizedId = chat.CONVERSATION_ID;
          if (!uniqueConversations[normalizedId]) {
            uniqueConversations[normalizedId] = {
              ...chat,
              last_message: chat.LAST_MESSAGE || "Aucun message",
              last_sender: chat.LAST_SENDER,
              unread_count: chat.UNREAD_COUNT || 0,
            };
          }
        });

        setConversations(Object.values(uniqueConversations));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations :", error);
    }
  };

  useEffect(() => {
    fetchRecentChats();
    const interval = setInterval(() => {
      fetchRecentChats();
    }, 2000);
    return () => clearInterval(interval);
  }, [dToken, nToken, backendUrl]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/messages/search?q=${query}`, {
        headers: { dtoken: dToken || "", ntoken: nToken || "" },
      });

      setSearchResults(data.map(user => ({
        ...user,
        CONTACT_ID: user.ID,
        CONTACT_TYPE: user.TYPE,
        ROLE: user.TYPE === "DOCTOR" ? user.DETAIL : "Nurse",
      })));
    } catch (error) {
      console.error("Erreur de recherche :", error);
    }
  };
  const Avatar = ({ image }) => {
  return image ? (
    <img src={image} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
  ) : (
    <User className="w-10 h-10 text-gray-500" />
  );
};

  const handleSelectUser = (user) => {
    console.log("Utilisateur sélectionné :", user);
    const senderType = dToken ? "DOCTOR" : "NURSE";
    const receiverType = user.CONTACT_TYPE.toUpperCase();

    const formattedSender = `${senderType}_${user.ID}`;
    const formattedReceiver = `${receiverType}_${user.CONTACT_ID || user.ID}`;

    const generatedConversationId = [formattedSender, formattedReceiver].sort().join('-');

    onSelectConversation({
      contact_id: user.CONTACT_ID || user.ID,
      contact_type: user.CONTACT_TYPE || user.TYPE,
      name: user.NAME,
      image: user.IMAGE,
      conversation_id: user.CONVERSATION_ID || generatedConversationId, 
    });

  };

  return (
    <div className="w-[20%] h-screen bg-white border-r border-gray-300 flex flex-col">
      <div className="px-3 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {searchTerm.length > 1 ? (
          <ul className="mb-4">
            {searchResults.map((user) => (
              <li
                key={user.CONTACT_ID}
                className="flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-gray-100 rounded-md"
                onClick={() => handleSelectUser(user)}
              >
                <img
                  src={user.IMAGE || "/default-avatar.png"}
                  alt={user.NAME}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user.NAME}</p>
                  <p className="text-sm text-gray-500">{user.ROLE}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {conversations.map((chat) => (
              <li
                key={chat.CONVERSATION_ID}
                className="flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-gray-100 rounded-md"
                onClick={() => handleSelectUser(chat)}
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={chat.IMAGE || "/default-avatar.png"} 
                    alt={chat.NAME} 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div>
                    <p className="font-semibold">{chat.NAME}</p>
                    <p className={`text-sm ${chat.ISUNREAD ? "font-bold text-black" : "text-gray-500"}`}>
                      {chat.last_message}
                    </p>
                  </div>
                </div>
                {chat.ISUNREAD && <span className="bg-blue-500 w-3 h-3 rounded-full block"></span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
