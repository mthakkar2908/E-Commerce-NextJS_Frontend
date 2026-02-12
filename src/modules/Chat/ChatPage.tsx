/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getSocket } from "@/src/lib/socket";
import { useAppDispatch } from "@/src/store";
import { getUsersForChat } from "@/src/store/authSlice";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

type Message = {
  senderId: string;
  senderName: string;
  message: string;
  createdAt?: Date;
  isRead?: boolean;
  _id: string;
  reactions?: {
    [emoji: string]: string[];
  };
  fileName?: string;
  fileType?: string;
  fileData?: string;
  fileSize?: number;
};

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const userId = user?.userId;
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);

  /* ============ USERS LIST ============ */
  useEffect(() => {
    const userData = async () => {
      try {
        const userResp = await dispatch(getUsersForChat()).unwrap();
        setUsers(userResp || []);
      } catch (error) {
        console.error("Error fetching users for chat:", error);
      }
    };

    userData();
  }, [dispatch]);

  /* ============ LOAD CONVERSATION ============ */
  const loadConversation = useCallback(
    (selectedUserData: any) => {
      if (!socketRef.current || !userId) return;

      setSelectedUser(selectedUserData);
      setMessages([]);

      localStorage.setItem("selectedUserId", selectedUserData._id);

      socketRef.current.emit("getHistory", {
        userId1: userId,
        userId2: selectedUserData._id,
      });
    },
    [userId],
  );

  /* ============ SOCKET SETUP ============ */
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      if (userId && user?.name) {
        socket.emit("registerUser", {
          userId,
          userName: user.name,
        });
      }

      const savedUserId = localStorage.getItem("selectedUserId");
      if (savedUserId && users.length > 0) {
        const previousUser = users.find((u) => u._id === savedUserId);
        if (previousUser) {
          loadConversation(previousUser);
        }
      }
    });

    /* RECEIVE MESSAGE */
    socket.on("receiveMessage", (data: Message) => {
      setMessages((prev) => [...prev, data]);

      if (selectedUser && data.senderId === selectedUser._id) {
        socket.emit("markAsRead", {
          messageIds: [data._id],
        });
      }
    });

    /* RECEIVE FILE */
    socket.on("receiveFile", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    /* MESSAGE HISTORY */
    socket.on("messageHistory", (data: { messages: Message[] }) => {
      const history = data.messages.reverse();
      setMessages(history);

      const unreadIds = history
        .filter((m) => m.senderId === selectedUser?._id && !m.isRead)
        .map((m) => m._id);

      if (unreadIds.length > 0) {
        socket.emit("markAsRead", {
          messageIds: unreadIds,
        });
      }
    });

    /* REACTION UPDATED */
    socket.on("reactionUpdated", (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg,
        ),
      );
    });

    /* TYPING INDICATOR */
    socket.on("userTyping", (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("receiveFile");
      socket.off("messageHistory");
      socket.off("reactionUpdated");
      socket.off("userTyping");
    };
  }, [userId, user?.name, users, loadConversation, selectedUser]);

  /* ============ AUTO SCROLL ============ */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ============ SEND MESSAGE ============ */
  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;

    socketRef.current.emit("sendMessage", {
      senderId: userId,
      senderName: user?.name || "You",
      recipientId: selectedUser._id,
      message: text,
    });

    setText("");
    setIsTyping(false);
  };

  const handleTextChange = (value: string) => {
    setText(value);

    socketRef.current.emit("typing", {
      recipientId: selectedUser._id,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing", {
        recipientId: selectedUser._id,
        isTyping: false,
      });
    }, 900);
  };

  /* ============ ADD REACTION ============ */
  const addReaction = (messageId: string, emoji: string) => {
    socketRef.current.emit("addReaction", {
      messageId,
      emoji,
      senderId: userId,
      recipientId: selectedUser._id,
    });
  };

  /* ============ REMOVE REACTION ============ */
  const removeReaction = (messageId: string, emoji: string) => {
    socketRef.current.emit("removeReaction", {
      messageId,
      emoji,
      senderId: userId,
      recipientId: selectedUser._id,
    });
  };

  /* ============ HANDLE FILE UPLOAD ============ */
  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileData = e.target?.result as string;

      socketRef.current.emit("sendFile", {
        senderId: userId,
        senderName: user?.name || "You",
        recipientId: selectedUser._id,
        fileName: file.name,
        fileType: file.type,
        fileData: fileData,
        fileSize: file.size,
      });
    };

    reader.readAsDataURL(file);
  };

  /* ============ DOWNLOAD FILE ============ */
  const downloadFile = (fileData: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName;
    link.click();
  };

  /* ============ UI ============ */
  return (
    <div className="flex h-screen bg-slate-50">
      {/* CONTACT LIST */}
      <div className="w-64 border-r bg-white shadow-sm overflow-y-auto">
        <div className="sticky top-0 p-4 border-b bg-white z-10">
          <h1 className="font-bold text-lg">Messages</h1>
        </div>

        {users.length > 0 && (
          <div className="flex flex-col">
            {users.map((userresp) => (
              <div
                key={userresp._id}
                onClick={() => loadConversation(userresp)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-100 border-b transition ${
                  selectedUser?._id === userresp._id
                    ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                    : ""
                }`}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}${userresp.profile_image}`}
                  alt={userresp.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">
                    {userresp._id === userId
                      ? `${userresp.name} (You)`
                      : userresp.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userresp.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col h-screen">
        {selectedUser ? (
          <>
            {/* HEADER */}
            <div className="bg-white border-b px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}${selectedUser.profile_image}`}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-500">
                      {selectedUser.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <p className="text-lg font-semibold mb-1">
                      No messages yet
                    </p>
                    <p className="text-sm">
                      Start a conversation with {selectedUser.name}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === userId;
                  const isFile = msg.fileName;

                  return (
                    <div
                      key={i}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      } group`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white text-slate-900 rounded-bl-none shadow border border-gray-200"
                        }`}
                      >
                        {isFile ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">{msg.message}</p>
                            <button
                              onClick={() =>
                                downloadFile(msg.fileData!, msg.fileName!)
                              }
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                isMe
                                  ? "bg-indigo-500 hover:bg-indigo-700"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              📥 Download ({(msg.fileSize! / 1024).toFixed(1)}
                              KB)
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.message}</p>
                        )}

                        {msg.reactions &&
                          Object.keys(msg.reactions).length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {Object.entries(msg.reactions).map(
                                ([emoji, userIds]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      if (userIds.includes(userId)) {
                                        removeReaction(msg._id, emoji);
                                      } else {
                                        addReaction(msg._id, emoji);
                                      }
                                    }}
                                    className={`text-xs px-2 py-0.5 rounded-full transition ${
                                      userIds.includes(userId)
                                        ? isMe
                                          ? "bg-indigo-500"
                                          : "bg-gray-300"
                                        : isMe
                                          ? "bg-indigo-500 opacity-60 hover:opacity-100"
                                          : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                                  >
                                    {emoji} {userIds.length}
                                  </button>
                                ),
                              )}
                            </div>
                          )}

                        <div className="flex justify-end gap-2 text-xs mt-1">
                          <span
                            className={
                              isMe ? "text-indigo-200" : "text-gray-500"
                            }
                          >
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                          {isMe && (
                            <span className={isMe ? "text-indigo-200" : ""}>
                              {msg.isRead ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* REACTION PICKER */}
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition">
                        {EMOJI_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg._id, emoji)}
                            className="text-lg hover:scale-125 transition p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-400 px-4 py-2 rounded-2xl rounded-bl-none shadow border border-gray-200">
                    <p className="text-sm">
                      {selectedUser.name} is typing
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </p>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="border-t bg-white p-4 shadow-lg">
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-600 font-medium cursor-pointer">
                    📎
                  </div>
                </label>

                <input
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-500 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  onClick={sendMessage}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 font-medium transition"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-xl font-semibold mb-1">
                Select a user to chat
              </p>
              <p className="text-sm">
                Choose a contact from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
