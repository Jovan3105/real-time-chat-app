import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const potentialChats = () => {
    const { user } = useContext(AuthContext)
    const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);

    //console.log("potentialChats", potentialChats);
    return (
        <>
            <div className="all-users">
                {potentialChats && potentialChats.map((u, index) => {
                    return (
                        <div className="single-user" key={index} onClick={() => createChat(user._id, u._id)}>
                            {u.name}
                            <div className={
                                onlineUsers?.some((user) => user?.userId === u?._id) ?
                                    "user-online" : ""}></div>
                        </div>
                    );
                })}
            </div>
        </>

    );
}

export default potentialChats;