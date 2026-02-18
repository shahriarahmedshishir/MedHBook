import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import {
  Send,
  Plus,
  Search as SearchIcon,
  Check,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import io from "socket.io-client";
import AuthContext from "../Components/Context/AuthContext";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorSearchResults, setDoctorSearchResults] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      if (user?.email) {
        socketRef.current.emit("user:join", user.email);
      }
    });

    // Listen for incoming messages
    socketRef.current.on("message:receive", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for typing indicators
    socketRef.current.on("user:typing", (data) => {
      setTypingUser(data.senderEmail);
    });

    socketRef.current.on("user:stopped-typing", () => {
      setTypingUser(null);
    });

    // Listen for online users
    socketRef.current.on("users:online", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Fetch initial conversations
  useEffect(() => {
    if (user?.email) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && user?.email) {
      fetchMessages(user.email, selectedConversation.otherEmail);
    }
  }, [selectedConversation, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/messages/conversations",
        {
          params: { userEmail: user.email },
        }
      );
      setConversations(response.data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const fetchMessages = async (userEmail, otherEmail) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/messages/conversation",
        {
          params: { userEmail, otherEmail },
        }
      );
      setMessages(response.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    setLoading(true);

    const messageData = {
      senderEmail: user.email,
      senderName: user.name,
      recipientEmail: selectedConversation.otherEmail,
      recipientName: selectedConversation.otherName,
      message: messageInput,
    };

    // Emit via Socket.io
    socketRef.current.emit("message:send", messageData);
    socketRef.current.emit("user:stopped-typing", {
      senderEmail: user.email,
      recipientEmail: selectedConversation.otherEmail,
    });

    setMessageInput("");
    setLoading(false);
  };

  const handleTyping = (value) => {
    setMessageInput(value);

    if (selectedConversation && value.trim()) {
      socketRef.current.emit("user:typing", {
        senderEmail: user.email,
        recipientEmail: selectedConversation.otherEmail,
      });
    }
  };

  const searchDoctors = async (query) => {
    if (!query.trim()) {
      setDoctorSearchResults([]);
      return;
    }

    try {
      const response = await axios.get("http://localhost:3000/search/doctors", {
        params: { name: query },
      });
      setDoctorSearchResults(response.data);
    } catch (err) {
      console.error("Error searching doctors:", err);
    }
  };

  const startNewChat = (doctor) => {
    setSelectedConversation({
      otherEmail: doctor.email,
      otherName: doctor.name,
    });
    setShowNewChatModal(false);
    setShowMobileChat(true);
    setDoctorSearch("");
    setDoctorSearchResults([]);
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUserOnline = onlineUsers.includes(selectedConversation?.otherEmail);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff]">
      {/* Sidebar */}
      <div
        className={`${
          showMobileChat ? "hidden" : "flex"
        } md:flex w-full md:w-80 bg-white border-r border-gray-200 flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-[#67cffe]/20 bg-gradient-to-r from-[#67cffe]/5 to-transparent">
          <h1 className="text-2xl font-bold text-[#304d5d] mb-4">Messages</h1>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border-2 border-[#67cffe]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67cffe] focus:border-[#67cffe]"
            />
            <SearchIcon
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/30 text-white font-semibold py-2 rounded-full transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">
                Start a new chat to begin messaging
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.otherEmail}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full p-4 border-b border-gray-100 text-left hover:bg-[#67cffe]/10 transition ${
                  selectedConversation?.otherEmail === conv.otherEmail
                    ? "bg-gradient-to-r from-[#67cffe]/20 to-transparent border-l-4 border-[#67cffe]"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#304d5d]">
                      {conv.otherName}
                    </h3>
                    {onlineUsers.includes(conv.otherEmail) && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(conv.timestamp).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${
          showMobileChat ? "flex" : "hidden"
        } md:flex flex-1 flex-col bg-white`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b-2 border-[#67cffe]/30 bg-gradient-to-r from-[#304d5d] to-[#67cffe] shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-1 hover:bg-white/20 rounded-full transition"
                  >
                    <ArrowLeft className="w-6 h-6 text-white" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedConversation.otherName}
                    </h2>
                    <p className="text-sm text-white/80">
                      {isUserOnline ? (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                          Online
                        </span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.senderEmail === user.email
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow-md ${
                        msg.senderEmail === user.email
                          ? "bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none border-2 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p>{msg.message}</p>
                        {msg.senderEmail === user.email &&
                          (msg.read ? (
                            <CheckCheck size={14} />
                          ) : (
                            <Check size={14} />
                          ))}
                      </div>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Typing Indicator */}
              {typingUser && typingUser === selectedConversation.otherEmail && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border-2 border-[#67cffe]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67cffe] focus:border-[#67cffe]"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !messageInput.trim()}
                  className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-lg hover:shadow-[#67cffe]/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-2xl mb-2">
                Select a conversation to start chatting
              </p>
              <p className="text-sm">or create a new chat with a doctor</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] md:max-h-96 flex flex-col shadow-2xl border-2 border-[#67cffe]/20">
            <h2 className="text-2xl font-bold text-[#304d5d] mb-4">
              Start a New Chat
            </h2>

            {/* Doctor Search */}
            <input
              type="text"
              placeholder="Search doctors..."
              value={doctorSearch}
              onChange={(e) => {
                setDoctorSearch(e.target.value);
                searchDoctors(e.target.value);
              }}
              className="w-full px-4 py-2 border-2 border-[#67cffe]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67cffe] focus:border-[#67cffe] mb-4"
            />

            {/* Doctor List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {doctorSearchResults.length === 0 && doctorSearch && (
                <p className="text-center text-gray-500 py-4">
                  No doctors found
                </p>
              )}

              {doctorSearchResults.map((doctor) => (
                <button
                  key={doctor.email}
                  onClick={() => startNewChat(doctor)}
                  className="w-full p-4 border-2 border-[#67cffe]/20 rounded-lg hover:bg-[#67cffe]/10 hover:border-[#67cffe] transition-all text-left"
                >
                  <h3 className="font-semibold text-[#304d5d]">
                    {doctor.name}
                  </h3>
                  {doctor.specialty && (
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  )}
                  <p className="text-sm text-gray-500">{doctor.email}</p>
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowNewChatModal(false);
                setDoctorSearch("");
                setDoctorSearchResults([]);
              }}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-[#304d5d] font-semibold py-2 rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
