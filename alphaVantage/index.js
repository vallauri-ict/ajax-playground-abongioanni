"use strict";

const apiKey = "UJGWAY47OK4QKSZ0";

$(document).ready(function () {
    let _table = $("#tblResults tbody");

    let _openIcon = $('.icon');
    let _linksList = $('.links-wrapper ul li');
    let _backdrop = $('.backdrop');
    let _closeIcon = $('.close-btn');
    let _responsiveLinks = $("#menuNavbar");
    let _navbar = document.getElementsByClassName("responsive-navbar")[0];

    let c ;//chart is empty

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
        $("<li>", {
            appendTo: _responsiveLinks,
            append: [
                $("<a>", {
                    href: $(_a).prop("href"),
                    text: $(_a).text()
                }).on("click", () => {
                    $(_responsiveLinks).parent().removeClass("open")
                })
            ]
        });//AGGIORNAMENTO DEL MENU' RESPONSIVE
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
            if (!c){//CARICO I DATI DI DEFAULT DEL GRAFICO
                c=createChart("http://localhost:3000/chart", data[$(_cmbSector).val()]);
            }
            changeChart(c, data[$(_cmbSector).val()]);//APPLICO E AGGIORNO I DATI DEL GRAFICO
        });
        chartData_.fail(error);
    });

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

    //RICERCA INCREMENTALE
    $("#txtSearch").on("keyup", () => {
        if ($(this).val().length >= 2) {
            let search_ = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + $(this).val() + "&apikey=" + apiKey);
            search_.done(function (data) {
                $(_table).html("");
                try {
                    for (let i = 0; i < 5; i++) {
                        let globalQuotes_ = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + data["bestMatches"][i]["1. symbol"] + "&apikey=" + apiKey);
                        globalQuotes_.done(function (data) {
                            $(_table).append(createRow(data["Global Quote"]));
                            if ("Note" in data) {
                                i = 5;
                                throw "Limite richieste al server raggiunto\n" + data["Note"];
                            }
                        });
                        globalQuotes_.fail(error);
                    }
                } catch (ee) {
                    alert(ee);
                }
            });
            search_.fail(error);
        }
    });

    /***************************** GRAFICO *****************************/

    function createChart(dataChart, datas) {
        let dataChart_ = inviaRichiesta("GET", dataChart,{},false);
        dataChart_.done(function (data) {
            return data;
        });
        dataChart_.fail(error);
        return new Chart($("#myChart"),JSON.parse(dataChart_.responseText));//RITORNA IL GRAFICO VUOTO
    }

    function changeChart(chart,datas){//APPLICO I DATI NEL GRAFICO
        let dataChart=chart["data"];
        dataChart["labels"]=[];
        let dataset=dataChart["datasets"][0];
        dataset["data"]=[];
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

    function inviaRichiesta(method, url, parameters = "",async=true) {
        return $.ajax({ //PROMISE PER RICHESTA AJAX
            type: method,
            url: url,
            data: parameters,
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            dataType: "json",
            timeout: 5000,
            async:async
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

});