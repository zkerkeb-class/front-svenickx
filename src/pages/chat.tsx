import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Loader from "../components/loader";
import LogOutButton from "../components/logoutButton";
import { IMessage } from "../models/message";
import { IUser } from "../models/user";
import { fetchApi } from "../services/fetch.service";
import { socket } from "../socket";
import { sortMessages } from "../utils/sortedMessages";

type MessageStatus = "pending" | "sent" | "error";

function Home() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [me, setMe] = useState<IUser | undefined>(undefined);
  const [messages, setMessages] = useState<
    (IMessage & { status: MessageStatus })[]
  >([]);
  const [message, setMessage] = useState<string>("");
  const [previewMessage, setPreviewMessage] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  //#region GetMe
  const getMe = async () => {
    const response = await fetchApi<IUser>(
      `${import.meta.env.VITE_DB_SERVICE_URL}auth/me`,
      "get"
    );
    if (!response.success) {
      setIsAuthorized(false);
      window.location.href = "/login";
      return;
    }
    if (response.data.redirectUrl) {
      window.location.href = response.data.redirectUrl;
      return;
    }
    setIsAuthorized(true);
    setMe(response.data.data.user);
    setIsLoadingPage(false);
  };
  //#endregion

  //#region GetMessages
  const getMessages = async () => {
    const response = await fetchApi<string[]>(
      `${import.meta.env.VITE_DB_SERVICE_URL}message`,
      "get"
    );
    if (!response.success) {
      console.error("Error fetching messages:", response.code);
      return;
    }
    const msgs = (response.data as IMessage[]).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setMessages(
      msgs.map((msg) => ({ ...msg, status: "sent" as MessageStatus }))
    );
    setIsLoadingMessages(false);

    const sortedMsgs = sortMessages(msgs, 10); // 10 derniers messages
    if (sortedMsgs.length && sortedMsgs[0].userId !== me?.id) {
      preview(msgs);
    }
  };
  //#endregion

  //#region SendMessage
  const sendMessage = async () => {
    const msg = message.trim();
    if (!msg || !me) return;

    setMessages((prev) => [
      ...prev,
      {
        content: msg,
        userId: me.id,
        status: "pending",
        createdAt: new Date(),
        firstname: me.firstname,
        lastname: me.lastname,
      },
    ]);

    setMessage("");
    const response = await fetchApi<boolean>(
      `${import.meta.env.VITE_DB_SERVICE_URL}message`,
      "post",
      {
        content: msg,
      }
    );
    if (!response.success) {
      console.error("Error :", response.code);
      setMessages((prev) =>
        prev.map((message) => {
          return message.content === msg && message.status === "pending"
            ? { ...message, status: "error" as MessageStatus }
            : message;
        })
      );
      return;
    }
  };
  //#endregion

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const preview = async (msg: IMessage[]) => {
    if (msg.length === 0) return;

    const lastMessages = sortMessages(msg, 10); // 10 derniers messages

    const response = await fetchApi<string[]>(
      `${import.meta.env.VITE_IA_SERVICE_URL}message/preview`,
      "post",
      { messages: lastMessages }
    );
    if (!response.success) {
      console.error("Error fetching messages:", response.code);
      return;
    }
    setPreviewMessage(response.data);
  };

  useEffect(() => {
    if (!isLoadingMessages) {
      scrollToBottom();
    }
  }, [messages, isLoadingMessages]);

  useEffect(() => {
    getMe();
  }, []);

  useEffect(() => {
    if (!isLoadingPage) {
      if (isAuthorized) {
        getMessages();
      } else {
        window.location.href = "/login";
      }
    }
  }, [isAuthorized, isLoadingPage]);

  useEffect(() => {
    if (me?.id) {
      //#region Socket
      socket.on("message", async (data: IMessage) => {
        if (data.userId === me.id) {
          // Message from me
          setMessages((prev) =>
            prev.map((message) => {
              return message.content === data.content &&
                message.status === "pending"
                ? {
                    ...message,
                    status: "sent" as MessageStatus,
                    createdAt: data.createdAt,
                  }
                : { ...message, createdAt: data.createdAt };
            })
          );
        } else {
          // Message from another user
          setMessages((prev) => {
            const newMessages = [
              ...prev,
              { ...data, status: "sent" as MessageStatus },
            ];
            const uniqueMessages = newMessages.filter(
              (message, index, self) =>
                index === self.findIndex((m) => m.id === message.id)
            );
            preview(uniqueMessages);
            return uniqueMessages;
          });
        }
      });
      //#endregion
    }

    return () => {
      socket.off("message");
    };
  }, [me]);

  if (isLoadingPage) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-200">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-blue-700 font-bold text-xl hover:underline"
          >
            <ArrowLeft size={22} />
            Chatty
          </a>
        </div>
        <div>
          <LogOutButton />
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-4 max-h-[86.5vh]">
        <div className="w-full max-w-lg flex flex-col bg-white/90 rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          {/* Messages */}
          <div className="scroll-container flex-1 overflow-y-auto px-4 py-6 space-y-3 h-[60vh]">
            {isLoadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <Loader />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="flex justify-center text-gray-400">
                    <p>Aucun message pour le moment.</p>
                  </div>
                )}
                {messages
                  .sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                  )
                  .map((msg, i) => {
                    const isMe = msg.userId === me?.id;
                    return (
                      <div
                        key={i}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[80%] ${
                            isMe ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div>
                            <div
                              className={`
                                px-4 py-2 rounded-2xl shadow
                                ${
                                  isMe
                                    ? "bg-blue-600 text-white"
                                    : "bg-green-100 text-gray-900"
                                }
                                ${msg.status === "pending" ? "opacity-70" : ""}
                                ${
                                  msg.status === "error"
                                    ? "line-through bg-red-200 text-red-700"
                                    : ""
                                }
                              `}
                            >
                              <span className="break-words">{msg.content}</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                                isMe ? "flex-row-reverse" : ""
                              }`}
                            >
                              {!isMe && (
                                <span>
                                  {msg.firstname} {msg.lastname}
                                </span>
                              )}
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                              {isMe && (
                                <span>
                                  {msg.status === "pending"
                                    ? "⏳"
                                    : msg.status === "error"
                                    ? "❌"
                                    : "✔️"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
          {/* IA Preview */}
          {previewMessage && (
            <div
              onClick={() => {
                setMessage(previewMessage);
                setPreviewMessage("");
              }}
              className="cursor-pointer hover:bg-blue-100 transition-colors flex gap-2 items-center text-xs text-blue-700 px-4 py-2 border-t border-blue-100 bg-blue-50"
            >
              <Sparkles size={16} className="min-w-4" />
              <span className="truncate">{previewMessage}</span>
            </div>
          )}
          {/* Input */}
          <form
            className="flex items-center gap-2 px-4 py-3 bg-white border-t border-blue-100"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              name="message"
              placeholder="Écrivez un message..."
              className="flex-1 border border-blue-200 rounded-lg px-3 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 bg-blue-50"
              value={message}
              rows={1}
              maxLength={500}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-full p-2 shadow flex items-center justify-center"
              title="Envoyer"
              disabled={!message.trim()}
            >
              <Send size={22} />
            </button>
          </form>
        </div>
      </main>
      <footer className="w-full text-center py-3 text-gray-400 text-xs bg-white border-t">
        Chatty — Messagerie instantanée moderne et sécurisée.
      </footer>
    </div>
  );
}

export default Home;
