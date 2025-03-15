import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import { Search, User, Clock, MessageCircle, Plus } from "lucide-react";
import moment from "moment-timezone";

const ChatSidebar = ({ onSelectConversation, activeConversationId }) => {
  const { dToken, profileData: doctorProfile } = useContext(DoctorContext);
  const { nToken, profileData: nurseProfile } = useContext(NurseContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("recent");
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Obtenir l'ID et le type d'utilisateur courant
  const userId = doctorProfile?.ID || nurseProfile?.ID;
  const userType = doctorProfile?.ID ? "DOCTOR" : "NURSE";

  const fetchRecentChats = async () => {
    try {
      setIsLoading(true);
      const token = dToken || nToken;
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/messages/recent`, {
        headers: { dtoken: dToken || "", ntoken: nToken || "" },
      });

      if (data && Array.isArray(data)) {
        const uniqueConversations = {};
        data.forEach((chat) => {
          const normalizedId = chat.CONVERSATION_ID;
          if (!uniqueConversations[normalizedId]) {
            uniqueConversations[normalizedId] = {
              ...chat,
              last_message: chat.LAST_MESSAGE || "Aucun message",
              last_message_time:
                chat.LAST_MESSAGE_TIME || new Date().toISOString(),
              last_sender: chat.LAST_SENDER,
              unread_count: chat.UNREAD_COUNT || 0,
            };
          }
        });

        setConversations(Object.values(uniqueConversations));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentChats();
    const interval = setInterval(() => {
      fetchRecentChats();
    }, 10000);
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
      setIsLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/messages/search?q=${query}`,
        {
          headers: { dtoken: dToken || "", ntoken: nToken || "" },
        }
      );

      setSearchResults(
        data.map((user) => ({
          ...user,
          CONTACT_ID: user.ID,
          CONTACT_TYPE: user.TYPE,
          ROLE: user.TYPE === "DOCTOR" ? user.DETAIL : "Infirmier(ère)",
        }))
      );
    } catch (error) {
      console.error("Erreur de recherche :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const Avatar = ({ image, name, status }) => {
    const initials = name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "?";

    return (
      <div className="relative">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
            {initials}
          </div>
        )}
        {status === "online" && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    );
  };

  const handleSelectUser = (user) => {
    console.log("Utilisateur sélectionné :", user);
    const senderType = userType;
    const receiverType = user.CONTACT_TYPE.toUpperCase();

    // Utiliser les IDs corrects extraits des profils
    const formattedSender = `${senderType}_${userId}`;
    const formattedReceiver = `${receiverType}_${user.CONTACT_ID || user.ID}`;

    const generatedConversationId = [formattedSender, formattedReceiver]
      .sort()
      .join("-");

    onSelectConversation({
      contact_id: user.CONTACT_ID || user.ID,
      contact_type: user.CONTACT_TYPE || user.TYPE,
      name: user.NAME,
      image: user.IMAGE,
      conversation_id: user.CONVERSATION_ID || generatedConversationId,
    });
  };

  // Format time or date based on recency
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const messageTime = moment(timestamp);
    const now = moment();

    if (now.diff(messageTime, "days") < 1) {
      return messageTime.format("HH:mm");
    } else if (now.diff(messageTime, "days") < 7) {
      return messageTime.format("ddd");
    } else {
      return messageTime.format("DD/MM/YY");
    }
  };

  // Truncate message to a specific length
  const truncateMessage = (message, length = 30) => {
    if (!message) return "";
    return message.length > length
      ? message.substring(0, length) + "..."
      : message;
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Messagerie</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un contact..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "recent"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            <div className="flex items-center justify-center">
              <Clock size={16} className="mr-2" />
              Récents
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("all")}
          >
            <div className="flex items-center justify-center">
              <MessageCircle size={16} className="mr-2" />
              Tous
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {isLoading && searchTerm.length > 1 && (
          <div className="flex justify-center items-center h-20">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        )}

        {searchTerm.length > 1 ? (
          <div className="p-2">
            <h3 className="text-xs font-medium text-gray-500 px-3 pb-2">
              RÉSULTATS DE RECHERCHE
            </h3>
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((user) => (
                  <li
                    key={user.CONTACT_ID}
                    className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-colors duration-200 ${
                      activeConversationId === user.CONVERSATION_ID
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-100 border-l-4 border-transparent"
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar image={user.IMAGE} name={user.NAME} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {user.NAME}
                      </p>
                      <p className="text-xs text-gray-500">{user.ROLE}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Aucun résultat trouvé</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center p-3">
              <h3 className="text-xs font-medium text-gray-500">
                CONVERSATIONS
              </h3>
              <button className="text-blue-500 hover:bg-blue-50 p-1 rounded-full">
                <Plus size={18} />
              </button>
            </div>

            {conversations.length > 0 ? (
              <ul className="space-y-1 px-2">
                {conversations.map((chat) => (
                  <li
                    key={chat.CONVERSATION_ID}
                    className={`flex items-center p-2 cursor-pointer rounded-lg transition-colors duration-200 ${
                      activeConversationId === chat.CONVERSATION_ID
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-100 border-l-4 border-transparent"
                    }`}
                    onClick={() => handleSelectUser(chat)}
                  >
                    <Avatar
                      image={chat.IMAGE}
                      name={chat.NAME}
                      status={Math.random() > 0.5 ? "online" : ""}
                    />

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p
                          className={`font-medium ${
                            chat.ISUNREAD ? "text-gray-900" : "text-gray-700"
                          } truncate`}
                        >
                          {chat.NAME}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-1">
                          {formatTime(chat.last_message_time)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <p
                          className={`text-sm ${
                            chat.ISUNREAD
                              ? "font-semibold text-gray-900"
                              : "text-gray-500"
                          } truncate`}
                        >
                          {truncateMessage(chat.last_message)}
                        </p>

                        {chat.ISUNREAD && (
                          <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                            {chat.unread_count > 9 ? "9+" : chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Aucune conversation</p>
                <p className="text-gray-500 text-sm mt-1">
                  Commencez à discuter avec vos contacts
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
