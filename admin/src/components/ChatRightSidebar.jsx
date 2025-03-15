import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import { socket } from "../socket";
import {
  Circle,
  Clock,
  X,
  Image as ImageIcon,
  Phone,
  Video,
  AlertCircle,
  XCircle,
} from "lucide-react";
import moment from "moment-timezone";

const ChatRightSidebar = ({ conversation, onClose }) => {
  const [sharedMedia, setSharedMedia] = useState([]);
  const [specialty, setSpecialty] = useState("");
  const [about, setAbout] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { dToken } = useContext(DoctorContext);
  const { nToken } = useContext(NurseContext);

  useEffect(() => {
    if (!conversation?.contact_id) return;

    const handleStatusUpdate = ({ userId, isOnline, lastSeen }) => {
      if (userId === conversation.contact_id) {
        setIsOnline(isOnline);
        if (lastSeen) setLastSeen(lastSeen);
      }
    };

    socket.on("userStatusUpdate", handleStatusUpdate);

    return () => {
      socket.off("userStatusUpdate", handleStatusUpdate);
    };
  }, [conversation]);

  // Récupérer les médias et informations du contact
  const fetchSharedMedia = async () => {
    if (!conversation?.contact_id) return;
    setLoading(true);

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/messages/media/${conversation.contact_id}/${conversation.contact_type}`,
        {
          headers: {
            dtoken: dToken || "",
            ntoken: nToken || "",
          },
        }
      );

      setSharedMedia(data.media || []);
      setAbout(data.about || "Aucune description disponible");

      if (conversation.contact_type === "DOCTOR") {
        setSpecialty(data.specialty || "Médecin");
      } else {
        setSpecialty("Infirmier(ère)");
      }
    } catch (error) {
      console.error("Erreur chargement médias :", error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le statut en ligne
  const fetchUserStatus = async () => {
    if (!conversation?.contact_id) return;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/messages/status/${conversation.contact_id}/${conversation.contact_type}`,
        {
          headers: {
            dtoken: dToken || "",
            ntoken: nToken || "",
          },
        }
      );

      setIsOnline(data.online);
      if (data.lastSeen) setLastSeen(data.lastSeen);
    } catch (error) {
      console.error("Erreur récupération du statut :", error);
    }
  };

  useEffect(() => {
    if (!conversation?.contact_id || !socket) return;

    fetchUserStatus();
    fetchSharedMedia();

    const handleUserOnline = ({ userId, timestamp }) => {
      if (userId === conversation.contact_id) {
        setIsOnline(true);
        setLastSeen(timestamp);
      }
    };

    const handleUserOffline = ({ userId, timestamp }) => {
      if (userId === conversation.contact_id) {
        setIsOnline(false);
        setLastSeen(timestamp);
      }
    };

    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [conversation, socket]);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Inconnu";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const yesterday = today - 86400000;

    if (date.getTime() >= today) return `Aujourd'hui à ${hours}:${minutes}`;
    if (date.getTime() >= yesterday) return `Hier à ${hours}:${minutes}`;

    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")} à ${hours}:${minutes}`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-5 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-800">Informations</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Profile Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-50 shadow-md">
                <img
                  src={conversation?.image || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              {isOnline && (
                <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {conversation?.name}
            </h3>
            <p className="text-sm font-medium text-blue-600 mb-1">
              {specialty}
            </p>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              {isOnline ? (
                <Circle
                  size={10}
                  className="text-green-500 mr-1.5"
                  fill="currentColor"
                />
              ) : (
                <Clock size={12} className="text-gray-400 mr-1.5" />
              )}
              <span>
                {isOnline
                  ? "En ligne"
                  : lastSeen
                  ? `Vu ${formatLastSeen(lastSeen)}`
                  : "Hors ligne"}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-3 mb-6 mt-2">
            <button className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              <Video size={20} />
            </button>
            <button className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              <AlertCircle size={20} />
            </button>
          </div>

          {/* About Section */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">À propos</h4>
            <p className="text-sm text-gray-600">{about}</p>
          </div>

          {/* Shared Media */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Médias partagés
              </h4>
              {sharedMedia.length > 0 && (
                <button className="text-xs text-blue-600">Voir tout</button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : sharedMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {sharedMedia.slice(0, 9).map((media, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden shadow-sm border border-gray-100 relative group cursor-pointer"
                    onClick={() => setFullImage(media.FILE_URL)}
                  >
                    <img
                      src={media.FILE_URL}
                      alt={`Média partagé ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ))}
                {sharedMedia.length > 9 && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer">
                    <div className="text-center">
                      <span className="text-blue-600 font-medium">
                        +{sharedMedia.length - 9}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <ImageIcon size={28} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun média partagé</p>
              </div>
            )}
          </div>
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
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setFullImage(null)}
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRightSidebar;
