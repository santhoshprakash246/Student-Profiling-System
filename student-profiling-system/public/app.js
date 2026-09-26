// =====================================================
// AUTH TOKEN
// =====================================================

function getToken() {

    return localStorage.getItem(
        "authToken"
    );

}


// =====================================================
// CURRENT USER
// =====================================================

function currentUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "authUser"
            ) || "null"
        );

    }

    catch (error) {

        return null;

    }

}


// =====================================================
// API FUNCTION
// =====================================================

async function api(
    url,
    method = "GET",
    body = null
) {

    try {

        const headers = {
            "Content-Type":
                "application/json"
        };


        const token =
            getToken();


        if (token) {

            headers.Authorization =
                "Bearer " + token;

        }


        const options = {

            method: method,

            headers: headers

        };


        if (body !== null) {

            options.body =
                JSON.stringify(body);

        }


        const response =
            await fetch(
                url,
                options
            );


        const text =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(text);

        }

        catch (error) {

            data = {

                success: false,

                message:
                    text ||
                    "Invalid server response"

            };

        }


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "authToken"
            );

            localStorage.removeItem(
                "authUser"
            );

        }


        return data;

    }

    catch (error) {

        console.error(
            "API ERROR:",
            error
        );


        return {

            success: false,

            message:
                "Server connection failed. Please check whether the Node.js server is running."

        };

    }

}