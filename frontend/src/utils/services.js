export const baseUrl = "http://localhost:5000/api";

export const postRequest = async (url, body) => {
    //console.log("body",body);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body
    });

    const data = await response.json();
    // data is returned as a json message with a status code

    if (!response.ok) {
        let message;

        if (data?.message) {
            message = data.message; // other server messages that we dont have control of
        }
        else {
            message = data; // our custom messages
        }

        return { error: true, message };
    }


    return data;
}