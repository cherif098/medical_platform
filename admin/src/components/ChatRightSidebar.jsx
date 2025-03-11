import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import { socket } from "../socket";
import { Circle, XCircle, X } from "lucide-react";


const ChatRightSidebar = ({ conversation }) => {
  const [sharedMedia, setSharedMedia] = useState([]);
  const [specialty, setSpecialty] = useState("");
  const [about, setAbout] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [fullImage, setFullImage] = useState(null); 

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { dToken } = useContext(DoctorContext);
  const { nToken } = useContext(NurseContext);


useEffect(() => {
  if (!conversation?.contact_id) return;

  const handleStatusUpdate = ({ userId, isOnline }) => {
    if (userId === conversation.contact_id) {
      setIsOnline(isOnline);
    }
  };

  socket.on("userStatusUpdate", handleStatusUpdate);

  return () => {
    socket.off("userStatusUpdate", handleStatusUpdate);
  };
}, [conversation]);

  //récupérer les médias et informations du contact
  const fetchSharedMedia = async () => {
    if (!conversation?.contact_id) return;

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

      setSharedMedia(data.media);
      setAbout(data.about || "Aucune description disponible");

      if (conversation.contact_type === "DOCTOR") {
        setSpecialty(data.specialty || "Doctor");
      } else {
        setSpecialty("Nurse");
      }
    } catch (error) {
      console.error(" Erreur chargement médias :", error);
    }
  };

  //récupérer le statut en ligne
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
    } catch (error) {
      console.error(" Erreur récupération du statut :", error);
    }
  };

  
  useEffect(() => {
    if (!conversation?.contact_id || !socket) return;

    fetchUserStatus();
    fetchSharedMedia();

    const handleUserOnline = ({ userId }) => {
      if (userId === conversation.contact_id) {
        setIsOnline(true);
      }
    };

    const handleUserOffline = ({ userId }) => {
      if (userId === conversation.contact_id) {
        setIsOnline(false);
      }
    };

    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [conversation, socket]);

  return (
    <div className="w-1/4 bg-white shadow-md p-4 flex flex-col">
      <div className="flex flex-col items-center border-b pb-4 mb-4">
        <img
          src={conversation?.image || "/default-avatar.png"}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <h2 className="text-lg font-semibold mt-2">{conversation?.name}</h2>
      
              <p className="flex items-center text-sm font-medium">
        {isOnline ? (
          <Circle size={14} className="text-green-600 mr-1" fill="currentColor" />
        ) : (
          <XCircle size={16} className="text-gray-500 mr-1" />
        )}
        {isOnline ? "Online" : "Offline"}
      </p>

        {conversation?.contact_type  && (
          <p className="text-gray-500 text-sm">{specialty}</p>
        )}

        <p className="text-gray-600 text-xs text-center mt-2">{about}</p>
      </div>

      <h3 className="text-md font-semibold mb-2">Shared media</h3>
      <div className="flex flex-wrap gap-2 overflow-y-auto max-h-60">
        {sharedMedia.length > 0 ? (
          sharedMedia.map((media, index) => (
            <img
              key={index}
              src={media.FILE_URL}
              alt="Shared Media"
              className="w-16 h-16 rounded-md object-cover cursor-pointer shadow-md hover:opacity-80"
              onClick={() => setFullImage(media.FILE_URL)} 
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm">No shared media</p>
        )}
      </div>

      {fullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <img src={fullImage} alt="Image agrandie" className="max-w-[90%] max-h-[90%] object-contain" />
          <button className="absolute top-5 right-5 text-white" onClick={() => setFullImage(null)}>
            <X size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatRightSidebar;
