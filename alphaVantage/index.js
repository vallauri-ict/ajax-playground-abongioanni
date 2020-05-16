"use strict";

const apiKey = "UJGWAY47OK4QKSZ0";

$(document).ready(function () {
    $(".loader .logo").fadeOut(0).fadeIn(1000);
    let _table = $("#tblResults tbody");
    let _tips = $(".search-results").eq(0).slideUp(0);
    let _openIcon = $(".icon");
    let _linksList = $(".links-wrapper ul li");
    let _backdrop = $(".backdrop");
    let _closeIcon = $(".close-btn");
    let _responsiveLinks = $("#menuNavbar");
    let _navbar = document.getElementsByClassName("responsive-navbar")[0];
	let _cmbSector=$("#cmbSector")
    let c; //chart is empty

    //LINKS UPDATE
    $(_responsiveLinks).children().remove();
    for (let i = 0; i < _linksList.length; i++) {
        let _a = $(_linksList).eq(i).find("a");
		let _newa;
		let c=$(_a).attr("class");
        $("<li>", {
            appendTo: _responsiveLinks,
            append: [
                (_newa = $("<a>", {
                    text: $(_a).text(),
					addClass: c,
                }).on("click", () => {
                    $(_responsiveLinks).parent().removeClass("open");
                })),
            ],
        }); //AGGIORNAMENTO DEL MENU' RESPONSIVE
        if (!$(_a).prop("class").includes("googleIcon") && !$(_a).prop("class").includes("fas")) {
            _newa.prop("href", _a.prop("href"));
        }
    }

    if (!isEnter()) {
		$(".logOut").hide();
        $(".googleIcon").addClass("grey").prop("title", "Non sei registrato");
    }
    else{
        $(".logOut").show().on("click",function(){
            signOut();
        })
    }
    $("#littleLoader").hide();

    //CARICAMENTO COMBO SETTORE
    let sector_ = inviaRichiesta("GET", "http://localhost:3000/SECTOR");
    sector_.done(function (data) {
        for (let key in data) {
            if (key != "Meta Data")
                $("<option>", {
                    text: key,
                    value: key,
                    appendTo: _cmbSector,
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

    //RESPONSIVE MENU'
    $(_openIcon).on("click", () => {
        $(_responsiveLinks).parent().addClass("open");
        $(_responsiveLinks).animate({ opacity: 1 }, 125);
    });
    $(_closeIcon).on("click", () => {
        $(_responsiveLinks).animate({ opacity: 0 }, 125, () => {
            $(_responsiveLinks).parent().removeClass("open");
        });
    });
    $(_backdrop).on("click", () => {
        $(_responsiveLinks).animate({ opacity: 0 }, 125, () => {
            $(_responsiveLinks).parent().removeClass("open");
        });
    });

    $(".googleIcon").on("click", function () {
        //LOG IO OR UPLOAD ON DRIVE
        if (!isEnter()) {
            signIn();
        } else {
            if ($("#files").val() == "") {
                $("#uploadResult")
                    .removeClass("alert-danger")
                    .removeClass("alert-success")
                    .addClass("alert-warning")
                    .html("<b>Attenzione:</b> devi selezionare un file!")
                    .fadeOut(0)
                    .fadeIn();
            }
            else {
                var file = $("#files")[0].files[0];
                let upload_ = new Upload(file).doUpload();
                upload_
                    .done(function (data) {
                        $("#uploadResult")
                            .removeClass("alert-danger")
                            .removeClass("alert-warning")
                            .addClass("alert-success")
                            .html("<b>Successo:</b> il caricamento è andato a buon fine!")
                            .fadeOut(0)
                            .fadeIn();
                    })
                    .fail(function () {
                        $("#uploadResult")
                            .removeClass("alert-success")
                            .removeClass("alert-warning")
                            .addClass("alert-danger")
                            .html("<b>Errore:</b> C'è stato un errore durante il caricamento")
                            .fadeOut(0)
                            .fadeIn();
                    });
            }

        }
    });

    $("#downloadChart").on("click", function () {
        //DOWNLOAD CHART IMAGE
        let url = c.toBase64Image();
        $(this).prop("href", url);
    });

    $("#files").on("change", function () {
        //SELECT A FILE
        var fullPath = $(this).val();
        if (fullPath) {
            var startIndex = fullPath.indexOf("\\") >= 0 ? fullPath.lastIndexOf("\\") : fullPath.lastIndexOf("/");
            var filename = fullPath.substring(startIndex);
            if (filename.indexOf("\\") === 0 || filename.indexOf("/") === 0) {
                filename = filename.substring(1);
            }
            $("label[for=files]").text(filename);
        }
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
    let defaultCompanies_ = inviaRichiesta(
        "GET",
        "http://localhost:3000/companies"
    );
    defaultCompanies_.done(function (data) {
        for (let i = 0; i < data.length; i++) {
            $("<option>", {
                text: data[i]["desc"],
                value: data[i]["id"],
                appendTo: _cmbCompanies,
            });
        }
        $(_cmbCompanies).trigger("change");
    });
    defaultCompanies_.fail(error);

    //EVENT COMBO SECTOR CHANGE EVENT
    $(_cmbSector).on("change", function () {
        let chartData_ = inviaRichiesta("GET", "http://localhost:3000/SECTOR");
        chartData_.done(function (data) {
            if (!c) {
                //CARICO I DATI DI DEFAULT DEL GRAFICO
                c = createChart("#myChart");
            }
            changeChart(c, data[$(_cmbSector).val()]); //APPLICO E AGGIORNO I DATI DEL GRAFICO
        });
        chartData_.fail(error);
    });

    //RICERCA INCREMENTALE
    $("#txtSearch").on("keyup", function () {
        if ($(this).val().length >= 2) {
            let search_ = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + $(this).val() + "&apikey=" + apiKey);
            search_.done(function (data) {
                $(_tips).html("").on("click","li.tip", function () {
                    $("#littleLoader").show();
                    let globalQuotes_ = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + this.id + "&apikey=" + apiKey);
                    globalQuotes_.done(function (data) {
                        if ("Note" in data) {
                            $("#littleLoader").hide();
                            alert ("Limite richieste al server raggiunto\n" + data["Note"]);
                        } else {
                            $(_table).html("").append(createRow(data["Global Quote"]));
                        }
                        $("#littleLoader").hide();
                    });
                    globalQuotes_.fail(function () {
                    });
                });
                let r = data["bestMatches"];
                for (let i = 0; i < r.length; i++) {
                    let symbol = r[i]["1. symbol"];
                    $("<li>", {
                        id: symbol,
                        text: r[i]["2. name"],
                        appendTo: _tips,
                        addClass:"tip"
                    })
                }
                $(_tips).slideDown(200);
            });
            search_.fail(error);
        }
    })
        .on("click", function () {
            if ($(_tips).html() != "") $(_tips).slideDown(200);
        })
        .on("focusout", function () {
            $(_tips).slideUp(200);
        });

    /***************************** GRAFICO *****************************/


    function createRow(data) {
        //RITORNA UNA RIGA PER UNA TABELLA
        let _tr = $("<tr>");
        for (let key in data) {
            $("<td>", {
                text: data[key],
                appendTo: _tr,
            });
        }
        return _tr;
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

    function error(jqXHR, text_status, string_error) {
        //BANALE ERROR HANDLER
        if (jqXHR.status == 0) alert("Connection Refused or Server timeout");
        else if (jqXHR.status == 200)
            alert("Formato dei dati non corretto : " + jqXHR.responseText);
        else alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
    }

    setTimeout(function () {
        $(".loader").slideUp();
        $(".loader .lds-ring").fadeOut();
    }, 1500);
});
