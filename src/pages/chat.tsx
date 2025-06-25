import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../components/loader";
import LogOutButton from "../components/logoutButton";
import { IMessage } from "../models/message";
import { IUser } from "../models/user";
import { fetchApi } from "../services/fetch.service";
import { socket } from "../socket";

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
    if (msgs[msgs.length - 1]?.userId !== me?.id) {
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
      { content: msg, userId: me.id, status: "pending", createdAt: new Date() },
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
      return;
    }
  };
  //#endregion

  const scrollToBottom = () => {
    const chatContainer = document.querySelector(".scroll-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  const preview = async (msg: IMessage[]) => {
    if (messages.length === 0) return;
    const response = await fetchApi<string[]>(
      `${import.meta.env.VITE_IA_SERVICE_URL}message/preview`,
      "post",
      {
        messages: msg
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .slice(-10),
      }
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
  }, [messages]);

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
      <div className="h-screen w-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-gray-900 flex justify-center text-white">
      <div className="flex flex-col">
        <div className="scroll-container bg-gray-800 flex flex-col justify-center gap-2 grow overflow-auto w-96 p-2">
          {isLoadingMessages ? (
            <div className=" w-full flex justify-center items-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-col justify-end grow">
              <div className="flex flex-col gap-2 overflow-auto h-full justify-end">
                {messages.length === 0 && (
                  <div className="flex justify-center">
                    <p>Aucun message</p>
                  </div>
                )}
                {messages
                  .sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                  )
                  .map((message, i) => {
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${
                          message.userId === me?.id
                            ? "items-end ml-10"
                            : "items-start mr-10"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            message.status === "pending" ? "opacity-65" : ""
                          } ${
                            message.userId === me?.id
                              ? "bg-blue-800"
                              : "bg-green-900"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-[0.6rem] text-gray-400">
                            {message.userId === me?.id
                              ? `you ${new Date(
                                  message.createdAt
                                ).toLocaleString()}`
                              : `${message.firstname} ${
                                  message.lastname
                                } ${new Date(
                                  message.createdAt
                                ).toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
        <div>
          {previewMessage && (
            <div
              onClick={() => {
                setMessage(previewMessage);
                setPreviewMessage("");
              }}
              className="w-96 p-2 cursor-pointer hover:bg-gray-600 flex gap-2 text-xs justify-center items-center text-center bg-gray-700"
            >
              <Sparkles size={14} className="min-w-4" />
              <div>{previewMessage}</div>
            </div>
          )}
          <div className="flex gap-2 bottom-0 p-2 bg-gray-800 w-full">
            <textarea
              name="message"
              placeholder="message"
              className="border grow p-1 rounded resize-y outline-none focus:ring-2 focus:ring-gray-600 h-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button onClick={() => sendMessage()}>send</button>
          </div>
        </div>
      </div>
      <div className="absolute left-4 top-4">
        <a href="/" className="text-2xl">
          Chatty
        </a>
      </div>
      <div className="absolute right-4 top-4">
        <LogOutButton />
      </div>
    </div>
  );
}

export default Home;
