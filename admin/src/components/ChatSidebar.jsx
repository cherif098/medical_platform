import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import {
  Search,
  User,
  Users,
  Edit,
  Clock,
  Circle,
  Settings,
  Menu,
} from "lucide-react";
import moment from "moment-timezone";

const ChatSidebar = ({ onSelectConversation, selectedConversation }) => {
  const { dToken, profileData: doctorProfile } = useContext(DoctorContext);
  const { nToken, profileData: nurseProfile } = useContext(NurseContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("recent"); // recent, contacts, all
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Charger les données de profil dès que le contexte est disponible
  useEffect(() => {
    const loadProfileData = () => {
      setProfileLoading(true);
      const profile = doctorProfile || nurseProfile;

      // Pré-chargement de l'image pour améliorer la performance perçue
      if (profile?.IMAGE) {
        const img = new Image();
        img.src = profile.IMAGE;
        img.onload = () => {
          setProfileData(profile);
          setProfileLoading(false);
        };
        // Fallback en cas d'échec de chargement de l'image
        img.onerror = () => {
          setProfileData({ ...profile, IMAGE: "/default-avatar.png" });
          setProfileLoading(false);
        };

        // Timeout de sécurité pour ne pas bloquer trop longtemps
        setTimeout(() => {
          if (profileLoading) {
            setProfileData(profile);
            setProfileLoading(false);
          }
        }, 1500);
      } else {
        setProfileData(profile);
        setProfileLoading(false);
      }
    };

    if (doctorProfile || nurseProfile) {
      loadProfileData();
    }
  }, [doctorProfile, nurseProfile]);

  const fetchRecentChats = async () => {
    setLoading(true);
    try {
      const token = dToken || nToken;
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/messages/recent`, {
        headers: { dtoken: dToken || "", ntoken: nToken || "" },
      });

      if (data && Array.isArray(data)) {
        const uniqueConversations = {};
        data.forEach((chat) => {
          const normalizedId = chat.CONVERSATION_ID;
          if (
            !uniqueConversations[normalizedId] ||
            (chat.LAST_MESSAGE_TIME &&
              (!uniqueConversations[normalizedId].LAST_MESSAGE_TIME ||
                new Date(chat.LAST_MESSAGE_TIME) >
                  new Date(
                    uniqueConversations[normalizedId].LAST_MESSAGE_TIME
                  )))
          ) {
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

        // Sort by last message time (most recent first)
        const sortedConversations = Object.values(uniqueConversations).sort(
          (a, b) =>
            new Date(b.last_message_time) - new Date(a.last_message_time)
        );

        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentChats();
    const interval = setInterval(() => {
      fetchRecentChats();
    }, 30000); // Less frequent polling to reduce server load
    return () => clearInterval(interval);
  }, [dToken, nToken]);

  // Autres fonctions (handleSearch, handleSelectUser, etc.)
  // ...

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
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
    }
  };

  const handleSelectUser = (user) => {
    const senderType = dToken ? "DOCTOR" : "NURSE";
    const receiverType = user.CONTACT_TYPE
      ? user.CONTACT_TYPE.toUpperCase()
      : user.TYPE
      ? user.TYPE.toUpperCase()
      : "";

    const formattedSender = `${senderType}_${profileData?.ID}`;
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

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const date = moment(timestamp);
    const now = moment();

    if (date.isSame(now, "day")) {
      return date.format("HH:mm");
    } else if (date.isSame(now.clone().subtract(1, "day"), "day")) {
      return "Hier";
    } else if (date.isSame(now, "week")) {
      return date.format("ddd");
    } else {
      return date.format("DD/MM/YY");
    }
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return "";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const isSelected = (conversation) => {
    return (
      selectedConversation &&
      selectedConversation.contact_id === conversation.CONTACT_ID &&
      selectedConversation.contact_type === conversation.CONTACT_TYPE
    );
  };

  // Rendu du composant avec état de chargement pour l'en-tête du profil
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="px-4 py-4 border-b bg-white flex items-center justify-between">
        {profileLoading ? (
          // État de chargement avec placeholder
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
            <div>
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
            </div>
          </div>
        ) : (
          // Affichage du profil une fois chargé
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={profileData?.IMAGE || "/default-avatar.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-900">
                {profileData?.NAME || "Mon profil"}
              </h3>
              <p className="text-xs text-gray-500">
                {profileData?.ID
                  ? dToken
                    ? "Médecin"
                    : "Infirmier(ère)"
                  : "Chargement..."}
              </p>
            </div>
          </div>
        )}
        <button className="p-2 rounded-full hover:bg-slate-100">
          <Menu size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des contacts..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "recent"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("recent")}
        >
          Récents
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "contacts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("contacts")}
        >
          Contacts
        </button>
      </div>

      {/* New Message Button */}
      <div className="p-3">
        <button className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Edit size={16} />
          <span className="text-sm font-medium">Nouveau message</span>
        </button>
      </div>

      {/* Conversations/Search Results List */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-500">
              Chargement des conversations...
            </p>
          </div>
        ) : searchTerm.length > 1 ? (
          <div className="divide-y divide-gray-100">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.CONTACT_ID || user.ID}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    isSelected(user) ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="relative">
                    <img
                      src={user.IMAGE || "/default-avatar.png"}
                      alt={user.NAME}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-900 truncate">
                        {user.NAME}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.ROLE || user.TYPE}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Search size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">
                  Aucun résultat pour "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        ) : activeTab === "recent" ? (
          <div className="divide-y divide-gray-100">
            {conversations.length > 0 ? (
              conversations.map((chat) => (
                <div
                  key={chat.CONVERSATION_ID}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    isSelected(chat) ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectUser(chat)}
                >
                  <div className="relative">
                    <img
                      src={chat.IMAGE || "/default-avatar.png"}
                      alt={chat.NAME}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    {chat.IS_ONLINE && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p
                        className={`font-medium ${
                          chat.ISUNREAD ? "text-gray-900" : "text-gray-700"
                        } truncate`}
                      >
                        {chat.NAME}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(chat.last_message_time)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p
                        className={`text-xs truncate ${
                          chat.ISUNREAD
                            ? "font-medium text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {truncateMessage(chat.last_message)}
                      </p>
                      {chat.ISUNREAD && (
                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {chat.unread_count > 9 ? "9+" : chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Users size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Aucune conversation récente</p>
                <p className="text-xs text-gray-400 mt-1">
                  Commencez une nouvelle discussion
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <Users size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Liste des contacts</p>
            <p className="text-xs text-gray-400 mt-1">
              Fonctionnalité en développement
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
