import { Message } from "../models/messageModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import moment from "moment-timezone";


export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.DOCTOR_ID || req.user.nurseId;
    const senderType = req.user.DOCTOR_ID ? "DOCTOR" : "NURSE";
    const { receiverId, receiverType, content } = req.body;
    
    const senderPrefix = senderType.toUpperCase();
    const receiverPrefix = receiverType.toUpperCase();

    const formattedSender = `${senderPrefix}_${senderId}`;
    const formattedReceiver = `${receiverPrefix}_${receiverId}`;

    const [firstParticipant, secondParticipant] = [formattedSender, formattedReceiver].sort();

    const conversationId = `${firstParticipant}-${secondParticipant}`;

    let fileUrl = null;

    if (req.file) {
      try {
        const uploadedFile = await cloudinary.uploader.upload(req.file.path, { 
          folder: "messages",
          resource_type: "image",
          access_mode: "public"
        });
        fileUrl = uploadedFile.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error("Erreur Cloudinary :", error);
        return res.status(500).json({ error: "Erreur lors de l'upload du fichier." });
      }
    }

    const sentAt = moment().utc().format();
    
    // enregistrement du message
    const result = await Message.send({ 
      senderId, 
      senderType, 
      receiverId, 
      receiverType: receiverType.toUpperCase(), 
      content, 
      fileUrl, 
      sentAt 
    });

   
    const newMessage = {
      message_id: result.insertId, 
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
      file_url: fileUrl,
      sent_at: sentAt,
      sender_type: senderType, 
    };
    const io = req.app.get('io');

    // emission Socket.io
    io.to(conversationId).emit('newMessage', newMessage);
    if (!io) {
        console.error("❌ Erreur : io (Socket.io) n'est pas défini !");
        return res.status(500).json({ error: "Erreur serveur WebSocket" });
    }
    console.log('Émission Socket.io - Conversation:', conversationId);
    console.log('Message:', newMessage);
    console.log(`Tentative d'émission WebSocket pour : ${conversationId}`);
    console.log("Expéditeur :", senderId, "| Destinataire :", receiverId);

    
    res.status(201).json({ success: true, fileUrl });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
    res.status(500).json({ error: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
  
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const senderId = req.user.DOCTOR_ID || req.user.nurseId;
    const senderType = req.user.DOCTOR_ID ? "DOCTOR" : "NURSE";
    const { otherUserId, otherUserType } = req.params;

    if (!senderId || !otherUserId) {
      console.error("Erreur : senderId ou otherUserId est null !");
      return res.status(400).json({ error: "ID de l'expéditeur ou du destinataire manquant" });
    }

    
    await Message.updateMessageReadStatus(
      senderId,          
      otherUserId,      
      senderType,       
      otherUserType      
    );

    const messages = await Message.getConversation(senderId, otherUserId, senderType, otherUserType);
    
    res.json(messages);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des messages :", error);
    res.status(500).json({ error: error.message });
  }
};


// récupérer les conversations récentes
export const getRecentChats = async (req, res) => {
  try {
    const userId = req.user.DOCTOR_ID || req.user.nurseId;
    const userType = req.user.DOCTOR_ID ? "DOCTOR" : "NURSE";

    const chats = await Message.getRecentChats(userId, userType);

    res.json(chats);

  } catch (error) {
    console.error("Erreur lors de la récupération des conversations :", error);
    res.status(500).json({ error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    const user = req.user; 

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({ error: "Requiert au moins 2 caractères" });
    }

    let excludeId, excludeType;
    if (user) {
      excludeType = user.type;
      excludeId = user.type === 'DOCTOR' ? user.DOCTOR_ID : user.nurseId;
    }

    const results = await Message.searchUsers(searchTerm, excludeId, excludeType);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Erreur de recherche", details: error.message });
  }
};


export const getSharedMedia = async (req, res) => {
  try {
    console.log("🔍 Headers reçus :", req.headers);

    const senderId = req.user.DOCTOR_ID || req.user.nurseId;
    const senderType = req.user.DOCTOR_ID ? "DOCTOR" : "NURSE";
    const { otherUserId, otherUserType } = req.params;

  
    const firstType = senderType === "DOCTOR" ? senderType : otherUserType;
    const secondType = senderType === "DOCTOR" ? otherUserType : senderType;

    const firstId = senderType === "DOCTOR" ? senderId : otherUserId;
    const secondId = senderType === "DOCTOR" ? otherUserId : senderId;

    const conversationId = `${firstType}_${firstId}-${secondType}_${secondId}`;


    // récupérer les médias
    const media = await Message.getSharedMedia(conversationId);

    let specialty = "";
    let about = ""; 

    if (otherUserType === "DOCTOR") {
      const doctorInfo = await Message.getDoctorInfo(otherUserId);
      if (doctorInfo.length > 0) {
        specialty = doctorInfo[0].SPECIALTY || "Médecin";
        about = doctorInfo[0].ABOUT || "Pas de description disponible";
      }
    } else if (otherUserType === "NURSE") {
      const nurseInfo = await Message.getNurseInfo(otherUserId);
      if (nurseInfo.length > 0) {
        about = nurseInfo[0].ABOUT || "Pas de description disponible";
      }
    }

    res.json({ media, specialty, about });
  } catch (error) {
    console.error("Erreur lors de la récupération des médias partagés :", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadChatCount = async (req, res) => {
  try {
    const userId = req.user.DOCTOR_ID || req.user.nurseId;
    const unreadCount = await Message.getUnreadChatCount(userId);
    
    res.json({ unreadCount });
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de discussions non lues :", error);
    res.status(500).json({ error: error.message });
  }
};


export const getUserStatus = async (req, res) => {
  try {
    const { contact_id, contact_type } = req.params;

    if (!contact_id || !contact_type) {
      return res.status(400).json({ success: false, message: "Missing parameters." });
    }

    const isOnline = await Message.getUserOnlineStatus(contact_id, contact_type);

    if (isOnline === null) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      online: isOnline, 
    });

  } catch (error) {
    console.error("Error fetching user status:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { contact_id, contact_type, is_online } = req.body;

    if (!contact_id || !contact_type || is_online === undefined) {
      return res.status(400).json({ success: false, message: "Missing parameters." });
    }

    await Message.updateUserOnlineStatus(contact_id, contact_type, is_online);

    res.status(200).json({ success: true, message: "User status updated." });

  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};



