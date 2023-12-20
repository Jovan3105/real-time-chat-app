import { createContext, useEffect, useState } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/services";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {

    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setisUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);

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

    return <ChatContext.Provider value={{
        userChats,
        isUserChatsLoading,
        userChatsError
    }}>
        {children}
    </ChatContext.Provider>

};