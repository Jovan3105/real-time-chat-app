import { createContext, useCallback, useEffect, useState } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/services";

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

    console.log("currentChat", currentChat);
    console.log("messages", messages)

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
    }, [user]); // on user change, return chats

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
        currentChat
    }}>
        {children}
    </ChatContext.Provider>

};