import React, { useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatBox from "../components/ChatBox";
import ChatRightSidebar from "../components/ChatRightSidebar";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

const addConversation = (newConversation) => {
  if (!newConversation?.contact_id) {
    return; 
  }

  setConversations((prev) => 
    prev.some(conv => conv.contact_id === newConversation.contact_id) 
      ? prev 
      : [newConversation, ...prev]
  );
};

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowSidebar(false); 
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 mt-5 overflow-hidden rounded-lg shadow-lg">
      {/*  Sidebar */}
      <ChatSidebar
        onSelectConversation={handleSelectConversation}
        className="w-[20%] h-screen border-r border-gray-300 overflow-y-auto flex-shrink-0"
      />

      {/* chat */}
      <div className={`flex-1 flex flex-col bg-white shadow-lg h-screen overflow-hidden transition-all duration-300 ${showSidebar ? "w-[60%]" : "w-[80%]"}`}>
        {selectedConversation ? (
          <ChatBox
            conversation={selectedConversation}
            refreshConversations={addConversation}
            onOpenSidebar={() => setShowSidebar(!showSidebar)}
          />
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500 text-lg">
            Sélectionnez une conversation
          </div>
        )}
      </div>

      {/* RightSidebar  */}
      {selectedConversation && showSidebar && (
        <ChatRightSidebar
          conversation={selectedConversation}
          className="w-[20%] h-screen border-l border-gray-300 overflow-y-auto flex-shrink-0"
        />
      )}
    </div>
  );
};

export default ChatPage;
