import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { getAuthToken } from "../utils/api";
import {
  Send,
  Plus,
  Search as SearchIcon,
  Check,
  CheckCheck,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [attachment, setAttachment] = useState(null);
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
  const selectedConversationRef = useRef(null);
  const userEmailRef = useRef(null);

  // Get passed state (doctor info from DoctorProfile page)
  const passedDoctorEmail = location.state?.doctorEmail;
  const passedDoctorName = location.state?.doctorName;

  // Log whenever state changes
  useEffect(() => {
    console.log("=== CHAT COMPONENT MOUNTED ===");
    console.log("Received from location.state:", {
      passedDoctorEmail,
      passedDoctorName,
    });
    console.log("User:", { email: user?.email, name: user?.name });
  }, []);

  // Initialize Socket.io connection
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    userEmailRef.current = user?.email || null;
  }, [user?.email]);

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
      const currentUserEmail = userEmailRef.current;
      const currentConversation = selectedConversationRef.current;

      if (!currentUserEmail) return;

      const belongsToOpenConversation =
        currentConversation &&
        ((data.senderEmail === currentUserEmail &&
          data.recipientEmail === currentConversation.otherEmail) ||
          (data.senderEmail === currentConversation.otherEmail &&
            data.recipientEmail === currentUserEmail));

      if (belongsToOpenConversation) {
        setMessages((prev) => [...prev, data]);
      }

      fetchConversations();

      if (
        currentConversation &&
        data.senderEmail === currentConversation.otherEmail &&
        data.recipientEmail === currentUserEmail
      ) {
        markConversationAsRead(
          currentUserEmail,
          currentConversation.otherEmail,
        );
      }
    });

    socketRef.current.on("message:sent", (payload) => {
      const message = payload?.data;
      if (!message) return;

      const currentUserEmail = userEmailRef.current;
      const currentConversation = selectedConversationRef.current;

      if (!currentUserEmail || !currentConversation) return;

      const belongsToOpenConversation =
        message.senderEmail === currentUserEmail &&
        message.recipientEmail === currentConversation.otherEmail;

      if (belongsToOpenConversation) {
        setMessages((prev) => [...prev, message]);
      }

      fetchConversations();
    });

    socketRef.current.on("messages:seen", ({ readerEmail }) => {
      if (!readerEmail) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderEmail === userEmailRef.current &&
          msg.recipientEmail === readerEmail
            ? { ...msg, read: true }
            : msg,
        ),
      );
      fetchConversations();
    });

    socketRef.current.on("message:deleted", ({ messageId }) => {
      if (!messageId) return;
      setMessages((prev) =>
        prev.filter((msg) => String(msg._id) !== String(messageId)),
      );
      fetchConversations();
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
  }, [user?.email]);

  // Auto-select doctor conversation if coming from DoctorProfile
  useEffect(() => {
    console.log("Auto-select effect - Doctor email:", passedDoctorEmail);

    if (passedDoctorEmail && passedDoctorName) {
      console.log("✅ Doctor info received, auto-selecting...");

      const doctorConversation = {
        otherEmail: passedDoctorEmail,
        otherName: passedDoctorName,
        lastMessage: "New conversation",
        timestamp: new Date().toISOString(),
        unreadCount: 0,
      };

      setSelectedConversation(doctorConversation);
      setShowMobileChat(true);

      // Also add to conversations list if not already there
      setConversations((prev) => {
        const exists = prev.some(
          (conv) => conv.otherEmail === passedDoctorEmail,
        );
        if (!exists) {
          console.log("Adding doctor to conversations list");
          return [doctorConversation, ...prev];
        }
        return prev;
      });

      console.log("✅ New conversation set for doctor:", passedDoctorEmail);
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/messages/conversations",
        {
          params: { userEmail: user.email },
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
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
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      setMessages(response.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const markConversationAsRead = async (userEmail, otherEmail) => {
    try {
      await axios.put(
        "http://localhost:3000/messages/read-conversation",
        { userEmail, otherEmail },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.recipientEmail === userEmail && msg.senderEmail === otherEmail
            ? { ...msg, read: true }
            : msg,
        ),
      );
      fetchConversations();
    } catch (err) {
      console.error("Error marking conversation as read:", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;

    const confirmed = window.confirm("Delete this message?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3000/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      setMessages((prev) =>
        prev.filter((msg) => String(msg._id) !== String(messageId)),
      );
      fetchConversations();
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachment) || !selectedConversation) return;

    setLoading(true);

    let attachmentUrl = null;
    if (attachment) {
      // Upload attachment to server
      const formData = new FormData();
      formData.append("attachment", attachment);
      try {
        const uploadRes = await axios.post(
          "http://localhost:3000/messages/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        attachmentUrl = uploadRes.data.filePath;
      } catch (err) {
        alert("Failed to upload attachment");
        setLoading(false);
        return;
      }
    }

    const messageData = {
      senderEmail: user.email,
      senderName: user.name,
      recipientEmail: selectedConversation.otherEmail,
      recipientName: selectedConversation.otherName,
      message: messageInput,
      attachment: attachmentUrl,
    };

    // Emit via Socket.io
    socketRef.current.emit("message:send", messageData);
    socketRef.current.emit("user:stopped-typing", {
      senderEmail: user.email,
      recipientEmail: selectedConversation.otherEmail,
    });

    setMessageInput("");
    setAttachment(null);
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
    conv.otherName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isUserOnline = onlineUsers.includes(selectedConversation?.otherEmail);

  const getMessageId = (msg) => {
    if (!msg?._id) return null;
    if (typeof msg._id === "string") return msg._id;
    if (msg._id.$oid) return msg._id.$oid;
    if (typeof msg._id.toString === "function") return msg._id.toString();
    return null;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!user?.email || !selectedConversation?.otherEmail) return;

    fetchMessages(user.email, selectedConversation.otherEmail);
    markConversationAsRead(user.email, selectedConversation.otherEmail);
  }, [user?.email, selectedConversation?.otherEmail]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff]">
      {/* Sidebar */}
      <div
        className={`${
          showMobileChat ? "hidden" : "flex"
        } md:flex w-full md:w-64 bg-white border-r border-gray-200 flex-col`}
      >
        {/* Header */}
        <div className="p-1 border-b border-[#67cffe]/20 bg-gradient-to-r from-[#67cffe]/5 to-transparent">
          <h1 className="text-base font-bold text-[#304d5d] mb-1">Messages</h1>

          {/* Search */}
          <div className="relative mb-1">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 pl-8 text-sm border-2 border-[#67cffe]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67cffe] focus:border-[#67cffe]"
            />
            <SearchIcon
              className="absolute left-2 top-2 text-gray-400"
              size={16}
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-lg hover:shadow-[#67cffe]/20 text-white font-semibold py-1 text-xs rounded-full transition-all duration-300 flex items-center justify-center gap-0.5"
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-2 text-center text-gray-500">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.otherEmail}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full p-2 border-b border-gray-100 text-left hover:bg-[#67cffe]/10 transition ${
                  selectedConversation?.otherEmail === conv.otherEmail
                    ? "bg-gradient-to-r from-[#67cffe]/20 to-transparent border-l-4 border-[#67cffe]"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-[#304d5d] text-sm">
                      {conv.otherName}
                    </h3>
                    {onlineUsers.includes(conv.otherEmail) && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {conv.lastMessage}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
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
            <div className="p-1 border-b border-[#67cffe]/30 bg-gradient-to-r from-[#304d5d] to-[#67cffe] shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Back button for mobile */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-0.5 hover:bg-white/20 rounded-full transition"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </button>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {selectedConversation.otherName}
                    </h2>
                    <p className="text-xs text-white/80">
                      {isUserOnline ? (
                        <span className="flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
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
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const messageId = getMessageId(msg);
                  return (
                    <div
                      key={messageId || idx}
                      className={`flex ${
                        msg.senderEmail === user.email
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-3 py-1.5 rounded-lg shadow ${
                          msg.senderEmail === user.email
                            ? "bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <span className="flex items-center gap-2">
                            <p>{msg.message}</p>
                            {msg.senderEmail === user.email &&
                              (msg.read ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Check size={14} />
                              ))}
                          </span>
                          {msg.attachment && (
                            <div className="mt-2">
                              {msg.attachment.match(
                                /\.(jpg|jpeg|png|gif|webp)$/i,
                              ) ? (
                                <img
                                  src={
                                    msg.attachment.startsWith("/uploads/")
                                      ? `http://localhost:3000${msg.attachment}`
                                      : msg.attachment
                                  }
                                  alt="attachment"
                                  className="max-h-48 rounded border border-gray-200"
                                />
                              ) : msg.attachment.match(/\.(pdf)$/i) ? (
                                <a
                                  href={
                                    msg.attachment.startsWith("/uploads/")
                                      ? `http://localhost:3000${msg.attachment}`
                                      : msg.attachment
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View PDF
                                </a>
                              ) : (
                                <a
                                  href={
                                    msg.attachment.startsWith("/uploads/")
                                      ? `http://localhost:3000${msg.attachment}`
                                      : msg.attachment
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  Download Attachment
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                        {msg.senderEmail === user.email && messageId && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(messageId)}
                            className="mt-0.5 text-xs opacity-70 hover:opacity-100 inline-flex items-center gap-0.5"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {typingUser && typingUser === selectedConversation.otherEmail && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg rounded-bl-none">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-2 border-t border-gray-200 bg-white"
              encType="multipart/form-data"
            >
              <div className="flex gap-1 items-center">
                <label className="cursor-pointer flex items-center">
                  <Plus size={18} className="text-[#67cffe]" />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setAttachment(e.target.files[0])}
                    disabled={loading}
                  />
                </label>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-1.5 text-sm border border-[#67cffe]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67cffe] focus:border-[#67cffe]"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || (!messageInput.trim() && !attachment)}
                  className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-md hover:shadow-[#67cffe]/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-full transition-all duration-300 flex items-center"
                >
                  <Send size={16} />
                </button>
              </div>
              {attachment && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-red-500 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-1">
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
