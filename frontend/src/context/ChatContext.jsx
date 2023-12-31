import { createContext, useCallback, useEffect, useState } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {

    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setisUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    //console.log("currentChat", currentChat);
    console.log("notifications", notifications)

    useEffect(() => {
        const newSocket = io("http://localhost:3000/");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        }
    }, [user]);

    // adding online  users
    useEffect(() => {
        if (socket === null)
            return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });

        return () => {
            socket.off("getOnlineUsers");
        }
    }, [socket]);

    // send message
    useEffect(() => {
        if (socket === null)
            return;

        const recipientId = currentChat?.members?.find((id) => id !== user?._id);

        socket.emit("sendMessage", { ...newMessage, recipientId });

    }, [newMessage]);

    // recieve message
    // recieve notification
    useEffect(() => {
        if (socket === null)
            return;

        socket.on("getMessage", res => {
            if (currentChat?._id !== res.chatId)
                return;
            setMessages((prev) => [...prev, res])
        })

        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some(id => id === res.senderId);

            if (isChatOpen) {
                setNotifications(prev => [{ ...res, isRead: true }, ...prev]);
            }
            else {
                setNotifications(prev => [res, ...prev]);
            }
        })

        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        };

    }, [socket, currentChat]);

    // user is the currently logged in user
    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {

                setisUserChatsLoading(true);
                setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setisUserChatsLoading(false);

                if (response.error) {
                    return setUserChatsError(response);
                }

                setUserChats(response);
            }
        }

        getUserChats();
    }, [user, notifications]); // on user change, return chats

    useEffect(() => {
        const getUsers = async () => {

            const response = await getRequest(`${baseUrl}/users`);

            if (response.error) {
                return console.log("Error fetching users", response);
            }
            //console.log(response.users);
            // if currently logged in user is equal to the user from response, we skip him
            const potChats = (response.users).filter((u) => {

                let isChatCreated = false;

                if (user?._id === u._id) {
                    return false;
                }

                // returns true of false if we have chat created whit that user
                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id;
                    });
                }

                // !isChatCreated
                return !isChatCreated;
            });
            //console.log(potChats)

            setPotentialChats(potChats);
            setAllUsers(response);
        };

        getUsers();
    }, [userChats]);
    // when userChats is affected this function is triggered

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);


    useEffect(() => {
        const getMessages = async () => {

            setIsMessagesLoading(true);
            setMessagesError(null);

            const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

            setIsMessagesLoading(false);

            if (response.error) {
                return setMessagesError(response);
            }

            setMessages(response);

        };

        getMessages();
    }, [currentChat]);

    const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {

        if (!textMessage) {
            return console.log("Type something.");
        }

        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify(
            {
                chatId: currentChatId,
                senderId: sender._id,
                text: textMessage
            }
        ));

        if (response.error) {
            return setSendTextMessageError(response);
        }

        setNewMessage(response);
        setMessages((prev) => [...prev, response]);
        setTextMessage("");

    }, []);

    const markAllNotificationsAsRead = useCallback((notifications) => {
        const modifiedNotifications = notifications.map(n => {
            return {
                ...n,
                isRead: true
            }
        });
        setNotifications(modifiedNotifications);
    }, []);

    const markNotificationAsRead = useCallback((notification, userChats, user, notifications) => {
        //  finding the right chat
        const desiredChat = userChats?.find(chat => {
            const chatMembers = [user._id, notification.senderId];
            const isDesiredChat = chat?.members.every(member => {
                return chatMembers.includes(member);
            });

            return isDesiredChat; // if true then the desiredChat will incude the chat
        });

        // mark as read
        const modifiedNotifications = notifications.map(e => {
            if (notification.senderId === e.senderId) {
                return {
                    ...notification,
                    isRead: true
                }
            }
            else {
                return e;
            }
        });

        updateCurrentChat(desiredChat);
        setNotifications(modifiedNotifications);

    }, []);

    const markThisUserNotificationsAsRead = useCallback((thisUserNotifications, notifications) => {
        const mNotifications = notifications.map(e => {
            let notification;

            thisUserNotifications.forEach(n => {
                if (n.senderId === e.senderId) {
                    notification = {
                        ...n,
                        isRead: true
                    }
                }
                else {
                    notification = e;
                }
            });
            return notification;
        })

        setNotifications(mNotifications);
    }, []);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({
            firstId, secondId
        }));
        console.log(response)

        if (response.error) {
            return console.log("Error fetching users", response);
        }

        setUserChats((prev) => [...prev, response]);

    }, []);

    return <ChatContext.Provider value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        currentChat,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationsAsRead
    }}>
        {children}
    </ChatContext.Provider>

};