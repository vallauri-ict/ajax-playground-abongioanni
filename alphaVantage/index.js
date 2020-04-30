"use strict";

const apiKey = "UJGWAY47OK4QKSZ0";

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const client_secret = "vAGVkxVhQNHTdJNgMtrVthOj";
let redirect_uri = "http://127.0.0.1:8080/index.html";
let scope = "https://www.googleapis.com/auth/drive";
let clientId = "461420881554-vohtumtl57fgfk63ft022vb2mqa4ufkl.apps.googleusercontent.com";

$(document).ready(function () {
    $(".loader .logo").fadeOut(0).fadeIn(1000);
    let _table = $("#tblResults tbody");

    let _openIcon = $('.icon');
    let _linksList = $('.links-wrapper ul li');
    let _backdrop = $('.backdrop');
    let _closeIcon = $('.close-btn');
    let _responsiveLinks = $("#menuNavbar");
    let _navbar = document.getElementsByClassName("responsive-navbar")[0];

    let c;//chart is empty
    if (localStorage.getItem("accessToken") === null) {
        $(".googleIcon").addClass("grey");
    }

    //CARICAMENTO COMBO SETTORE
    let sector_ = inviaRichiesta("GET", "http://localhost:3000/SECTOR");
    sector_.done(function (data) {
        for (let key in data) {
            if (key != "Meta Data")
                $("<option>", {
                    text: key,
                    value: key,
                    appendTo: _cmbSector
                });
        }
        $(_cmbSector).trigger("change");
    });
    sector_.fail(error);

    //STICKY NAVBAR
    var sticky = _navbar.offsetTop;
    $(document).on("scroll", () => {
        if (window.pageYOffset > sticky) {
            $(_navbar).addClass("sticky");
        } else {
            $(_navbar).removeClass("sticky");
        }
    });

    //LINKS UPDATE
    $(_responsiveLinks).children().remove()
    for (let i = 0; i < _linksList.length; i++) {
        let _a = $(_linksList).eq(i).find("a");
        let _newa;
        $("<li>", {
            appendTo: _responsiveLinks,
            append: [
                _newa = $("<a>", {
                    text: $(_a).text(),
                    addClass: $(_a).attr('class'),
                }).on("click", () => {
                    $(_responsiveLinks).parent().removeClass("open")
                })
            ]
        });//AGGIORNAMENTO DEL MENU' RESPONSIVE
        if (!$(_a).prop("class").includes("googleIcon")) {
            _newa.href = _a.href;
        }
    }

    //RESPONSIVE MENU'
    $(_openIcon).on('click', () => {
        $(_responsiveLinks).parent().addClass("open")
        $(_responsiveLinks).animate({ opacity: 1 }, 125);
    });
    $(_closeIcon).on('click', () => {
        $(_responsiveLinks).animate({ opacity: 0 }, 125, () => { $(_responsiveLinks).parent().removeClass("open") });
    });
    $(_backdrop).on('click', () => {
        $(_responsiveLinks).animate({ opacity: 0 }, 125, () => { $(_responsiveLinks).parent().removeClass("open") });
    });

    $(".googleIcon").click(function () {
        if (localStorage.getItem("accessToken") === null) {
            signIn(clientId, redirect_uri, scope);
        }
        else {
            var file = $("#files")[0].files[0];
            var upload = new Upload(file);
            upload.doUpload();
            alert("Elemento Caricato!");
        }
    });

    $("#downloadChart").on("click", function () {
        let url = c.toBase64Image()
        $(this).prop("href", url);
    });

    //EVENT COMBO COMPANIES CHANGE EVENT
    let _cmbCompanies = $("#cmbSymbols").on("change", function () {
        let default_ = inviaRichiesta("GET", "http://localhost:3000/GLOBAL_QUOTE?symbol=" + $(this).val() /*+ "&apikey=" + apiKey*/);
        default_.done(function (data) {
            $(_table).html("").append(createRow(data[0]["Global Quote"]));
        });
        default_.fail(error);
    });

    //CARICAMENTO COMBO COMPANIES
    let defaultCompanies_ = inviaRichiesta("GET", "http://localhost:3000/companies");
    defaultCompanies_.done(function (data) {
        for (let i = 0; i < data.length; i++) {
            $("<option>", {
                text: data[i]["desc"],
                value: data[i]["id"],
                appendTo: _cmbCompanies
            });
        }
        $(_cmbCompanies).trigger("change");
    });
    defaultCompanies_.fail(error);

    //EVENT COMBO SECTOR CHANGE EVENT
    let _cmbSector = $("#cmbSector").on("change", function () {
        let chartData_ = inviaRichiesta("GET", "http://localhost:3000/SECTOR");
        chartData_.done(function (data) {
            if (!c) {//CARICO I DATI DI DEFAULT DEL GRAFICO
                c = createChart("http://localhost:3000/chart");
            }
            changeChart(c, data[$(_cmbSector).val()]);//APPLICO E AGGIORNO I DATI DEL GRAFICO
        });
        chartData_.fail(error);
    });

    //RICERCA INCREMENTALE
    $("#txtSearch").on("keyup", function () {
        if ($(this).val().length >= 2) {
            let search_ = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + $(this).val() + "&apikey=" + apiKey);
            search_.done(function (data) {
                $(_table).html("");
                try {
                    for (let i = 0; i < 5; i++) {
                        let globalQuotes_ = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + data["bestMatches"][i]["1. symbol"] + "&apikey=" + apiKey, {}, false);
                        globalQuotes_.done(function (data) {
                            if ("Note" in data) {
                                i = 5;
                                throw "Limite richieste al server raggiunto\n" + data["Note"];
                            }
                            else {
                                $(_table).append(createRow(data["Global Quote"]));
                            }
                        });
                        globalQuotes_.fail(error);
                    }
                } catch (ee) {
                    //alert(ee);
                }
            });
            search_.fail(error);
        }
    });

    /***************************** GRAFICO *****************************/

    function createChart(dataChart) {
        let dataChart_ = inviaRichiesta("GET", dataChart, {}, false);
        dataChart_.done(function (data) {
            return data;
        });
        dataChart_.fail(error);
        return new Chart($("#myChart"), JSON.parse(dataChart_.responseText));//RITORNA IL GRAFICO VUOTO
    }

    function changeChart(chart, datas) {//APPLICO I DATI NEL GRAFICO
        let dataChart = chart["data"];
        dataChart["labels"] = [];
        let dataset = dataChart["datasets"][0];
        dataset["data"] = [];
        for (let key in datas) {
            dataChart["labels"].push(key);
            dataset["data"].push(datas[key].replace("%", ""));
            let color = "rgba(" + Random(0, 255) + ", " + Random(0, 255) + ", " + Random(0, 255) + ", 1)";
            dataset["backgroundColor"].push(color);
            dataset["borderColor"].push(color);
        }
        chart.update();
    }

    /***************************** FUNCTIONS *****************************/
    function signIn(clientId, redirect_uri, scope) {
        let url = "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=" + redirect_uri
            + "&prompt=consent&response_type=code&client_id=" + clientId + "&scope=" + scope
            + "&access_type=offline";
        let r_ = inviaRichiesta("POST", "https://www.googleapis.com/oauth2/v4/token",
            {
                code: code
                , redirect_uri: redirect_uri,
                client_secret: client_secret,
                client_id: clientId,
                scope: scope,
                grant_type: "authorization_code"
            }, false);
        r_.done(function (data) {
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("expires_in", data.expires_in);
            window.history.pushState({}, document.title, "index.html");
        });
        window.location = url;
    }

    function stripQueryStringAndHashFromPath(url) {
        return url.split("?")[0].split("#")[0];
    }

    var Upload = function (file) {
        this.file = file;
    };

    Upload.prototype.getType = function () {
        localStorage.setItem("type", this.file.type);
        return this.file.type;
    };
    Upload.prototype.getSize = function () {
        localStorage.setItem("size", this.file.size);
        return this.file.size;
    };
    Upload.prototype.getName = function () {
        return this.file.name;
    };
    Upload.prototype.doUpload = function () {
        var that = this;
        var formData = new FormData();

        // add assoc key values, this will be posts values
        formData.append("file", this.file, this.getName());
        formData.append("upload_file", true);

        $.ajax({
            type: "POST",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Bearer" + " " + localStorage.getItem("accessToken"));

            },
            url: "https://www.googleapis.com/upload/drive/v2/files",
            data: {
                uploadType: "media"
            },
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                return myXhr;
            },
            success: function (data) {
                console.log(data);
            },
            error: function (error) {
                console.log(error);
            },
            async: true,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000
        });
    };

    function createRow(data) {  //RITORNA UNA RIGA PER UNA TABELLA
        let _tr = $("<tr>");
        for (let key in data) {
            $("<td>", {
                "text": data[key],
                appendTo: _tr
            });
        }
        return _tr;
    }

    function inviaRichiesta(method, url, parameters = "", async = true) {
        return $.ajax({ //PROMISE PER RICHESTA AJAX
            type: method,
            url: url,
            data: parameters,
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            dataType: "json",
            timeout: 5000,
            async: async
        });
    }

    function error(jqXHR, text_status, string_error) {  //BANALE ERROR HANDLER
        if (jqXHR.status == 0)
            alert("Connection Refused or Server timeout");
        else if (jqXHR.status == 200)
            alert("Formato dei dati non corretto : " + jqXHR.responseText);
        else
            alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
    }

    function Random(min, max) {  //INCLUSIVO
        return Math.floor((max - min + 1) * Math.random()) + min;
    }
    setTimeout(function(){$(".loader").slideUp();},1500);
    
});