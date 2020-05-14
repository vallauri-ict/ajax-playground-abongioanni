function isEnter(){
    return localStorage.getItem("accessToken")!=null;
}

function signIn(clientId, clientSecret, redirectUri, scope,code) {
    let url =
        "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=" +
        redirectUri +
        "&prompt=consent&response_type=code&client_id=" +
        clientId +
        "&scope=" +
        scope +
        "&access_type=offline";
    let r_ = inviaRichiesta(
        "POST",
        "https://www.googleapis.com/oauth2/v4/token",
        {
            code: code,
            redirect_uri: redirectUri,
            client_secret: clientSecret,
            client_id: clientId,
            scope: scope,
            grant_type: "authorization_code",
        },
        false
    );
    r_.done(function (data) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("expires_in", data.expires_in);
        window.history.pushState({}, document.title, "index.html");
    });
    setTimeout(window.location = url, 1500);

}

function inviaRichiesta(method, url, parameters = "", async = true) {
    return $.ajax({
        //PROMISE PER RICHESTA AJAX
        type: method,
        url: url,
        data: parameters,
        contentType: "application/x-www-form-urlencoded;charset=utf-8",
        dataType: "json",
        timeout: 5000,
        async: async,
    });
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