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

  const loadConversation = useCallback(
    (selectedUserData: any) => {
      if (!socketRef.current || !userId) return;

      setSelectedUser(selectedUserData);
      setMessages([]);

      localStorage.setItem("selectedUserId", selectedUserData._id);

      socketRef.current.emit("getHistory", {
        userId1: userId,
        userId2: selectedUserData._id
      });
    },
    [userId]
  );

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      if (userId && user?.name) {
        socket.emit("registerUser", {
          userId,
          userName: user.name
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

    socket.on("receiveMessage", (data: Message) => {
      setMessages((prev) => [...prev, data]);

      if (selectedUser && data.senderId === selectedUser._id) {
        socket.emit("markAsRead", {
          messageIds: [data._id]
        });
      }
    });

    socket.on("receiveFile", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("messageHistory", (data: { messages: Message[] }) => {
      const history = data.messages.reverse();
      setMessages(history);

      const unreadIds = history
        .filter((m) => m.senderId === selectedUser?._id && !m.isRead)
        .map((m) => m._id);

      if (unreadIds.length > 0) {
        socket.emit("markAsRead", {
          messageIds: unreadIds
        });
      }
    });

    socket.on("reactionUpdated", (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg
        )
      );
    });

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;

    socketRef.current.emit("sendMessage", {
      senderId: userId,
      senderName: user?.name || "You",
      recipientId: selectedUser._id,
      message: text
    });

    setText("");
    setIsTyping(false);
  };

  const handleTextChange = (value: string) => {
    setText(value);

    socketRef.current.emit("typing", {
      recipientId: selectedUser._id,
      isTyping: true
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing", {
        recipientId: selectedUser._id,
        isTyping: false
      });
    }, 900);
  };

  const addReaction = (messageId: string, emoji: string) => {
    socketRef.current.emit("addReaction", {
      messageId,
      emoji,
      senderId: userId,
      recipientId: selectedUser._id
    });
  };

  const removeReaction = (messageId: string, emoji: string) => {
    socketRef.current.emit("removeReaction", {
      messageId,
      emoji,
      senderId: userId,
      recipientId: selectedUser._id
    });
  };

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
        fileSize: file.size
      });
    };

    reader.readAsDataURL(file);
  };

  const downloadFile = (fileData: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName;
    link.click();
  };

  return (
    <div className='flex h-screen bg-gray-50 dark:bg-slate-950'>
      <div className='w-80 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-y-auto scrollbar flex flex-col'>
        <div className='sticky top-0 p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10'>
          <h1 className='font-bold text-xl text-gray-900 dark:text-white'>
            Messages
          </h1>
          <p className='text-xs text-gray-500 dark:text-slate-400 mt-1'>
            Your conversations
          </p>
        </div>

        {users.length > 0 ? (
          <div className='flex flex-col flex-1'>
            {users.map((userresp) => (
              <div
                key={userresp._id}
                onClick={() => loadConversation(userresp)}
                className={`px-4 py-3 mx-3 my-1 flex gap-3 cursor-pointer rounded-lg transition-all duration-200 ${
                  selectedUser?._id === userresp._id
                    ? "bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800"
                    : "hover:bg-gray-100 dark:hover:bg-slate-800/50"
                }`}
              >
                {userresp.profile_image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}${userresp.profile_image}`}
                    alt={userresp.name}
                    className='w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-gray-200 dark:ring-slate-700'
                  />
                ) : (
                  <div className='w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 ring-2 ring-gray-200 dark:ring-slate-700'>
                    <span className='text-white font-bold text-sm'>
                      {userresp.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-gray-900 dark:text-white text-sm truncate'>
                    {userresp._id === userId
                      ? `${userresp.name} (You)`
                      : userresp.name}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-slate-400 truncate'>
                    {userresp.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center text-gray-400 dark:text-slate-500'>
              <p className='text-sm'>No users available</p>
            </div>
          </div>
        )}
      </div>

      <div className='flex-1 flex flex-col h-screen bg-white dark:bg-slate-900'>
        {selectedUser ? (
          <>
            <div className='border-b border-gray-200 dark:border-slate-800 px-8 py-5 bg-white dark:bg-slate-900 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  {selectedUser.profile_image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}${selectedUser.profile_image}`}
                      alt={selectedUser.name}
                      className='w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-700'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-slate-700'>
                      <span className='text-white font-bold text-sm'>
                        {selectedUser.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div>
                    <h2 className='font-semibold text-gray-900 dark:text-white'>
                      {selectedUser.name}
                    </h2>
                    <p className='text-xs text-gray-500 dark:text-slate-400'>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto scrollbar p-8 space-y-4 bg-gray-50 dark:bg-slate-950'>
              {messages.length === 0 ? (
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center'>
                    <div className='text-5xl mb-4'>💬</div>
                    <p className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                      No messages yet
                    </p>
                    <p className='text-sm text-gray-500 dark:text-slate-400'>
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
                      className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                    >
                      <div
                        className={`max-w-sm px-5 py-3 rounded-2xl transition-all ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-sm shadow-md"
                            : "bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-bl-sm shadow border border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        {isFile ? (
                          <div className='flex flex-col gap-3'>
                            <p className='text-sm font-medium'>{msg.message}</p>
                            <button
                              onClick={() =>
                                downloadFile(msg.fileData!, msg.fileName!)
                              }
                              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 w-fit ${
                                isMe
                                  ? "bg-indigo-500 hover:bg-indigo-700 text-white"
                                  : "bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white"
                              }`}
                            >
                              📥 Download ({(msg.fileSize! / 1024).toFixed(1)}{" "}
                              KB)
                            </button>
                          </div>
                        ) : (
                          <p className='text-sm leading-relaxed'>
                            {msg.message}
                          </p>
                        )}

                        {msg.reactions &&
                          Object.keys(msg.reactions).length > 0 && (
                            <div className='flex gap-2 mt-3 flex-wrap'>
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
                                    className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                                      userIds.includes(userId)
                                        ? isMe
                                          ? "bg-indigo-500"
                                          : "bg-gray-300 dark:bg-slate-600"
                                        : isMe
                                          ? "bg-indigo-500 opacity-50 hover:opacity-100"
                                          : "bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600"
                                    }`}
                                  >
                                    {emoji} {userIds.length}
                                  </button>
                                )
                              )}
                            </div>
                          )}

                        <div className='flex justify-end gap-2 text-xs mt-2'>
                          <span
                            className={
                              isMe
                                ? "text-indigo-200"
                                : "text-gray-500 dark:text-slate-400"
                            }
                          >
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : ""}
                          </span>
                          {isMe && (
                            <span className='text-indigo-200 font-semibold'>
                              {msg.isRead ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-center'>
                        {EMOJI_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg._id, emoji)}
                            className='text-lg hover:scale-125 transition-transform p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full'
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
                <div className='flex justify-start'>
                  <div className='bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-5 py-3 rounded-2xl rounded-bl-sm shadow border border-gray-200 dark:border-slate-700'>
                    <p className='text-sm'>
                      {selectedUser.name} is typing
                      <span className='animate-bounce inline-block ml-1'>
                        .
                      </span>
                      <span
                        className='animate-bounce inline-block ml-0.5'
                        style={{ animationDelay: "0.1s" }}
                      >
                        .
                      </span>
                      <span
                        className='animate-bounce inline-block ml-0.5'
                        style={{ animationDelay: "0.2s" }}
                      >
                        .
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className='border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg'>
              <div className='flex gap-3'>
                <label className='cursor-pointer shrink-0'>
                  <input
                    type='file'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className='hidden'
                  />
                  <div className='w-11 h-11 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 font-medium cursor-pointer flex items-center justify-center transition-colors'>
                    📎
                  </div>
                </label>

                <input
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder='Type your message...'
                  className='flex-1 px-5 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-gray-500 dark:placeholder-slate-400'
                />

                <button
                  onClick={sendMessage}
                  className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2 shrink-0'
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='text-6xl mb-4'>💬</div>
              <p className='text-2xl font-semibold text-gray-900 dark:text-white mb-2'>
                Select a user to chat
              </p>
              <p className='text-gray-500 dark:text-slate-400'>
                Choose a contact from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
