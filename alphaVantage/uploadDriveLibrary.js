let creadentials;

let clientSecret;
let redirectUri;
let clientId;
let scope = "https://www.googleapis.com/auth/drive";
let urlParams;
let code;

readTextFile("credentials.json", function (text) {
    credentials = JSON.parse(text);
    clientSecret = credentials["web"]["client_secret"];
    redirectUri = credentials["web"]["redirect_uris"][0];
    clientId = credentials["web"]["client_id"];

    if (localStorage.getItem("signin") == "i") {
        localStorage.removeItem("signin");
        urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get("code");
        let r_ = $.ajax({
            //PROMISE PER RICHESTA AJAX
            type: "POST",
            url: "https://www.googleapis.com/oauth2/v4/token",
            data: {
                code: code,
                redirect_uri: redirectUri,
                client_secret: clientSecret,
                client_id: clientId,
                scope: scope,
                grant_type: "authorization_code",
            },
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            dataType: "json",
            timeout: 5000,
            async: async,
        });
        r_.done(function (data) {
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("expires_in", data.expires_in);
            window.history.pushState({}, document.title, "index.html");
        });
    }
});

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function isEnter() {
    return localStorage.getItem("accessToken") != null;
}

function signIn() {
    let url =
        "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=" +
        redirectUri +
        "&prompt=consent&response_type=code&client_id=" +
        clientId +
        "&scope=" +
        scope +
        "&access_type=offline";
    localStorage.setItem("signin", "i");
    window.location = url;
}

function signOut() {
    if (isEnter()) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("expires_in");
        window.location = "index.html";
    }
}

class Upload {
    constructor(file) {
        this.file = file;
    }
    getType() {
        localStorage.setItem("type", this.file.type);
        return this.file.type;
    }
    getSize() {
        localStorage.setItem("size", this.file.size);
        return this.file.size;
    }
    getName() {
        return this.file.name;
    }
    doUpload() {
        var formData = new FormData();
        // add assoc key values, this will be posts values
        formData.append("file", this.file, this.getName());
        formData.append("upload_file", true);
        return $.ajax({
            type: "POST",
            beforeSend: function (request) {
                request.setRequestHeader(
                    "Authorization",
                    "Bearer" + " " + localStorage.getItem("accessToken")
                );
            },
            url: "https://www.googleapis.com/upload/drive/v2/files",
            data: {
                uploadType: "media",
            },
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                return myXhr;
            },
            async: true,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000,
        });
    }
}