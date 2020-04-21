"use strict";

const apiKey = "UJGWAY47OK4QKSZ0";

$(document).ready(function () {
    let _table = $("#tblResults tbody");

    //EVENT COMBO CHANGE
    let _cmb = $("#cmbSymbols").on("change", function () {
        let default_ = inviaRichiesta("GET", "http://localhost:3000/GLOBAL_QUOTE?symbol=" + $(this).val() /*+ "&apikey=" + apiKey*/);
        default_.done(function (data) {
            $(_table).html("").append(createRow(data[0]["Global Quote"]));
        });
        default_.fail(error);
    });

    //CARICAMENTO COMBO
    let defaultCompanies_ = inviaRichiesta("GET", "http://localhost:3000/companies");
    defaultCompanies_.done(function (data) {
        for (let i = 0; i < data.length; i++) {
            $("<option>", {
                text: data[i]["desc"],
                value: data[i]["id"],
                appendTo: _cmb
            });
        }
        $(_cmb).trigger("change");
    });
    defaultCompanies_.fail(error);

    //RICERCA INCREMENTALE
    $("#txtSearch").on("keyup", function () {
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

    //GRAFICO
    let dataChart_ = inviaRichiesta("GET", "http://localhost:3000/chart");
    dataChart_.done(function (data) {
        let chart=data;
        let dataToShow_ = inviaRichiesta("GET", "http://localhost:3000/3year");
        dataToShow_.done(function (data) {
            for (let key in data) {
                let d=chart["data"];
                d["labels"].push(key);
                let dataset=d["datasets"][0];
                dataset["data"].push(data[key].replace("%",""));
                let color="rgba("+Random(0,255)+", "+Random(0,255)+", "+Random(0,255)+", 1)";
                dataset["backgroundColor"].push(color);
                dataset["borderColor"].push(color);
            }
            new Chart($("#myChart"), chart);
            
        });
        dataToShow_.fail(error);
    });
    dataChart_.fail(error);


    //FUNCTIONS
    function createRow(data) {
        let _tr = $("<tr>");
        for (let key in data) {
            $("<td>", {
                "text": data[key],
                appendTo: _tr
            });
        }
        return _tr;
    }

    function inviaRichiesta(method, url, parameters = "") {
        return $.ajax({
            type: method,
            url: url,
            data: parameters,
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            dataType: "json",
            timeout: 5000
        });
    }

    function error(jqXHR, text_status, string_error) {
        if (jqXHR.status == 0)
            alert("Connection Refused or Server timeout");
        else if (jqXHR.status == 200)
            alert("Formato dei dati non corretto : " + jqXHR.responseText);
        else
            alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
    }

    function Random(min, max) {
        return Math.floor((max - min + 1) * Math.random()) + min;
    }

});