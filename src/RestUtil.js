const OPT = {
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
};

function jsonToQueryString(json) {
    return '?' + Object.keys(json).map(key => {
        return encodeURIComponent(key) + '=' +
            encodeURIComponent(json[key]);
    }).join('&');
}

function _handleResponse(response) {
    if (response.status >= 400) {
        throw new Error("Bad response from server");
    }
    return response.json();
}

/**
 * Send a POST request to submit a value back to an endpoint.
 * @param payload       Object   The value to be posted back.
 * @param callback      Function A callback function
 * @param errorCallback Function A callback function for handling error condition
 */
async function postback(payload, callback, errorCallback) {
    let url = (window.CALLBACK_URL === '__CALLBACK_URL_PLACEHOLDER__' ? null
        : window.CALLBACK_URL);
    if (!url) {
        console.log("Error: No Callback Url");
        return;
    }
    console.log("Posting to callback Url: " + url);
    const opt = {
        ...OPT,
        method: "post",
        body: JSON.stringify(payload || {}),
        mode: "no-cors"
    };
    console.log("Payload is: " + JSON.stringify(payload));
    fetch(url, opt)
    .then(_handleResponse)
    .then(data => {
        console.log("Callback to bots posted");

        if (callback) {
            callback();
        }
    })
    .catch(error => {
        console.log("Error: " + error);
        if (errorCallback)
            errorCallback(error);
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {
    jsonToQueryString,
    postback,
    sleep
};
