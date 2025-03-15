import React, { useState, useEffect } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatBox from "../components/ChatBox";
import ChatRightSidebar from "../components/ChatRightSidebar";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-hide right sidebar on small screens
      if (window.innerWidth < 1024 && showSidebar) {
        setShowSidebar(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const addConversation = (newConversation) => {
    if (!newConversation?.contact_id) {
      return;
    }

    setConversations((prev) =>
      prev.some((conv) => conv.contact_id === newConversation.contact_id)
        ? prev.map((conv) =>
            conv.contact_id === newConversation.contact_id
              ? { ...conv, last_message: newConversation.last_message }
              : conv
          )
        : [newConversation, ...prev]
    );
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const toggleRightSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* Sidebar - collapsible on mobile */}
      <div
        className={`${
          isMobile
            ? selectedConversation
              ? "hidden"
              : "block w-full"
            : "w-1/4"
        } border-r border-gray-200 h-full`}
      >
        <ChatSidebar
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
        />
      </div>

      {/* Chat Box - full width on mobile when a conversation is selected */}
      <div
        className={`
          ${
            isMobile
              ? selectedConversation
                ? "block w-full"
                : "hidden"
              : showSidebar
              ? "w-1/2"
              : "w-3/4"
          } 
          flex-1 h-full flex flex-col overflow-hidden
        `}
      >
        {selectedConversation ? (
          <ChatBox
            conversation={selectedConversation}
            refreshConversations={addConversation}
            onOpenSidebar={toggleRightSidebar}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-50">
            <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
              <div className="mb-4 text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Aucune conversation sélectionnée
              </h3>
              <p className="text-gray-500 text-sm">
                Choisissez une conversation dans la liste pour commencer à
                discuter
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - hidden on mobile */}
      {selectedConversation && showSidebar && !isMobile && (
        <div className="w-1/4 border-l border-gray-200 bg-slate-50 h-full">
          <ChatRightSidebar
            conversation={selectedConversation}
            onClose={() => setShowSidebar(false)}
          />
        </div>
      )}

      {/* Modal for mobile right sidebar */}
      {selectedConversation && showSidebar && isMobile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">Détails</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <ChatRightSidebar
                conversation={selectedConversation}
                onClose={() => setShowSidebar(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
