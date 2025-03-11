import { executeQuery } from "../config/snowflake.js";

export const Message = {

send: async ({ senderId, senderType, receiverId, receiverType, content, fileUrl }) => {
  const id1 = String(senderId);
  const id2 = String(receiverId);
  const [firstId, secondId] = [id1, id2].sort((a, b) => a.localeCompare(b));
  const firstType = firstId === id1 ? senderType : receiverType;
  const secondType = secondId === id2 ? receiverType : senderType;

  const conversationId = `${firstType}_${firstId}-${secondType}_${secondId}`;

  const query = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.MESSAGES 
    (CONVERSATION_ID, SENDER_ID, SENDER_TYPE, RECEIVER_ID, RECEIVER_TYPE, CONTENT, FILE_URL, SENT_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  return executeQuery(query, [
    conversationId,
    senderId,
    senderType,
    receiverId,
    receiverType,
    content,
    fileUrl
  ]);
},

  getRecentChats: async (userId) => {
    const query = `
      WITH last_messages AS (
        SELECT 
          CONVERSATION_ID, 
          CONTENT AS last_message, 
          FILE_URL AS last_file_url,
          SENDER_ID AS last_sender, 
          READ AS last_read,
          SENT_AT
        FROM MEDICAL_DB.MEDICAL_SCHEMA.MESSAGES 
        WHERE (SENDER_ID = ? OR RECEIVER_ID = ?)
        QUALIFY ROW_NUMBER() OVER (PARTITION BY CONVERSATION_ID ORDER BY SENT_AT DESC) = 1
      )
      SELECT 
        m.CONVERSATION_ID, 
  
        CASE 
            WHEN lm.last_sender = ? THEN CONCAT('You : ', COALESCE(NULLIF(lm.last_message, ''), 'Photo'))
            ELSE COALESCE(NULLIF(lm.last_message, ''), 'Photo')
        END AS last_message,
  
        lm.last_file_url,  
        lm.last_sender,
        lm.last_read,
        MAX(m.SENT_AT) AS last_message_time,
  
        CASE 
            WHEN m.SENDER_ID = ? THEN m.RECEIVER_ID
            ELSE m.SENDER_ID
        END as contact_id,
  
        CASE 
            WHEN m.SENDER_ID = ? THEN m.RECEIVER_TYPE
            ELSE m.SENDER_TYPE
        END as contact_type,
  
      
        CASE 
            WHEN lm.last_sender != ? AND lm.last_read = FALSE THEN TRUE
            ELSE FALSE
        END AS isUnread,
  
        COALESCE(d.NAME, n.NAME, 'Utilisateur inconnu') as name,
        COALESCE(d.IMAGE, n.IMAGE, '/default-avatar.png') as image, 
        COALESCE(d.SPECIALTY, 'Nurse') as specialty
  
      FROM MEDICAL_DB.MEDICAL_SCHEMA.MESSAGES m
      JOIN last_messages lm ON lm.CONVERSATION_ID = m.CONVERSATION_ID
      LEFT JOIN MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS d 
          ON (d.DOCTOR_ID = contact_id AND contact_type = 'DOCTOR')
      LEFT JOIN MEDICAL_DB.MEDICAL_SCHEMA.NURSES n 
          ON (n.NURSE_ID = contact_id AND contact_type = 'NURSE')
      WHERE (m.SENDER_ID = ? OR m.RECEIVER_ID = ?)
      GROUP BY m.CONVERSATION_ID, lm.last_message, lm.last_file_url, lm.last_sender, lm.last_read,
          contact_id, contact_type, d.NAME, n.NAME, d.SPECIALTY, d.IMAGE, n.IMAGE
      ORDER BY last_message_time DESC;
    `;

    const result = await executeQuery(query, [userId, userId, userId, userId, userId, userId, userId, userId]);
    return result;
  },

  getConversation: async (userId, otherUserId, userType, otherUserType) => {
    const senderPrefix = userType.toUpperCase();
    const receiverPrefix = otherUserType.toUpperCase();
    
    const formattedSender = `${senderPrefix}_${userId}`;
    const formattedReceiver = `${receiverPrefix}_${otherUserId}`;
    
    const [firstParticipant, secondParticipant] = [formattedSender, formattedReceiver].sort();
    const conversationId = `${firstParticipant}-${secondParticipant}`;
    
    console.log(`conv id utilisé dans getConversation : ${conversationId}`);
  
    const query = `
      SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.MESSAGES 
      WHERE CONVERSATION_ID = ?
      ORDER BY SENT_AT ASC;
    `;
  
    return executeQuery(query, [conversationId]);
  },
  
  
  searchUsers: async (searchTerm, excludeId, excludeType) => {
    let doctorWhere = 'NAME ILIKE ?';
    let nurseWhere = 'NAME ILIKE ?';
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];
    if (excludeType === 'DOCTOR') {
      doctorWhere += ' AND DOCTOR_ID != ?';
      params.splice(1, 0, excludeId); 
    } 
    else if (excludeType === 'NURSE') {
      nurseWhere += ' AND NURSE_ID != ?';
      params.push(excludeId); 
    }
  
    const query = `
      (SELECT 
        DOCTOR_ID as id,
        NAME,
        IMAGE,
        'DOCTOR' as type,
        SPECIALTY as detail
      FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS 
      WHERE ${doctorWhere})
  
      UNION ALL
  
      (SELECT 
        NURSE_ID as id,
        NAME,
        IMAGE,
        'NURSE' as type,
        'Nurse' as detail
      FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES 
      WHERE ${nurseWhere})
  
      ORDER BY NAME
      LIMIT 20;
    `;
  
    return executeQuery(query, params);
  },

  getSharedMedia: async (conversationId) => {
    const query = `
      SELECT FILE_URL 
      FROM MEDICAL_DB.MEDICAL_SCHEMA.MESSAGES
      WHERE CONVERSATION_ID = ? AND FILE_URL IS NOT NULL
      ORDER BY SENT_AT DESC
    `;
    return executeQuery(query, [conversationId]);
  },

 
  getDoctorInfo: async (doctorId) => {
    const query = `
      SELECT SPECIALTY, ABOUT
      FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
      WHERE DOCTOR_ID = ?
    `;
    return executeQuery(query, [doctorId]);
  },

  
  getNurseInfo: async (nurseId) => {
    const query = `
      SELECT ABOUT
      FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES
      WHERE NURSE_ID = ?
    `;
    return executeQuery(query, [nurseId]);
  },

  updateMessageReadStatus: async (userId, otherUserId, userType, otherUserType) => {
    const formattedSender = `${userType.toUpperCase()}_${userId}`;
    const formattedReceiver = `${otherUserType.toUpperCase()}_${otherUserId}`;

    const [firstParticipant, secondParticipant] = [formattedSender, formattedReceiver].sort();
    const conversationId = `${firstParticipant}-${secondParticipant}`;

    console.log("Mise à jour des messages lus pour :", conversationId);

    const query = `
      UPDATE MEDICAL_DB.MEDICAL_SCHEMA.MESSAGES
      SET READ = TRUE
      WHERE CONVERSATION_ID = ? 
        AND RECEIVER_ID = ? 
        AND READ = FALSE
    `;

    return executeQuery(query, [conversationId, userId]); 
},


  getUnreadChatCount: async (userId) => {
    const query = `
      WITH unread_chats AS (
        SELECT DISTINCT SENDER_ID, SENDER_TYPE
        FROM MEDICAL_DB.MEDICAL_SCHEMA.MESSAGES
        WHERE RECEIVER_ID = ? AND READ = FALSE
      )
      SELECT COUNT(*) AS unread_count FROM unread_chats;
    `;
  
    const result = await executeQuery(query, [userId]);
    return result[0]?.UNREAD_COUNT || 0;
  },

  getUserOnlineStatus : async (contact_id, contact_type) => {
    const table = contact_type === "DOCTOR" ? "DOCTORS" : "NURSES";
    const idColumn = contact_type === "DOCTOR" ? "DOCTOR_ID" : "NURSE_ID";
  
    const query = `
      SELECT IS_ONLINE
      FROM MEDICAL_DB.MEDICAL_SCHEMA.${table}
      WHERE ${idColumn} = ?;
    `;
  
    try {
      const result = await executeQuery(query, [contact_id]);
      return result.length > 0 ? Boolean(result[0].IS_ONLINE) : null;
    } catch (error) {
      console.error("Error retrieving user online status:", error);
      throw error;
    }
  },
  
  
  updateUserOnlineStatus : async (contact_id, contact_type, isOnline) => {
    const table = contact_type === "DOCTOR" ? "DOCTORS" : "NURSES";
    const idColumn = contact_type === "DOCTOR" ? "DOCTOR_ID" : "NURSE_ID";
  
    const query = `
      UPDATE MEDICAL_DB.MEDICAL_SCHEMA.${table}
      SET IS_ONLINE = ?
      WHERE ${idColumn} = ?;
    `;
  
    try {
      await executeQuery(query, [isOnline, contact_id]);
    } catch (error) {
      console.error("Erreur mise à jour statut :", error);
    }
  },
  
  
  
};
