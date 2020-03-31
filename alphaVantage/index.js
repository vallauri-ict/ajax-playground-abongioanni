"use strict";

const apiKey="UJGWAY47OK4QKSZ0";

$(document).ready(function () {
    //{
    //     "Global Quote": {
    //         "01. symbol": "IBM",
    //         "02. open": "112.0000",
    //         "03. high": "113.1500",
    //         "04. low": "111.3150",
    //         "05. price": "112.4251",
    //         "06. volume": "471036",
    //         "07. latest trading day": "2020-03-31",
    //         "08. previous close": "112.9300",
    //         "09. change": "-0.5049",
    //         "10. change percent": "-0.4471%"
    //     }
    // }
    let _table=$("#tblResults tbody");
    let _cmb=$("#cmbSymbols").on("change",function () {
        let request=inviaRichiesta("GET","https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="+$(this).val()+"&apikey="+apiKey);
        request.done(function (data) {
            $(_table).html("").append(createRow(data["Global Quote"]));
        });
        request.fail(error);
    });
    let _txtSearch=$("#txtSearch").on("keyup",function(){
        if($(this).val().length>=2){
            let request=inviaRichiesta("GET","https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords="+$(this).val()+"&apikey="+apiKey);
            request.done(function (data) {
                $(_table).html("");
                let stop=false;
                try {
                    for (let i = 0; i < 5; i++) {
                        let r = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + data["bestMatches"][i]["1. symbol"] + "&apikey=" + apiKey);
                        r.done(function (data) {
                            $(_table).append(createRow(data["Global Quote"]));
                            if ("Note" in data) {
                                alert("Limite richieste al server raggiunto\n" + data["Note"]);
                                i=5;
                                r.abort();
                            }
                        });
                        r.fail(error);
                    }
                } catch (exception) {
                    alert("Limite richieste al server raggiunto\n");
                }
            });
            request.fail(error);
        }
    });

    let v={
        "IBM":"IBM",
        "MSFT":"Microsoft Corporation",
        "AMD":"Advanced Micro Devices Inc.",
        "XIACF":"Xiaomi Corporation",
        "SNE":"Sony Corporation"
    };
    for (let key in v){
        $("<option>",{
            text:v[key],
            value:key,
            appendTo:_cmb
        });
    }
    //$(_cmb).trigger("change");

    function createRow(data){
        let _tr = $("<tr>");
        for (let key in data) {
            $("<td>", {
                "text": data[key],
                appendTo: _tr
            });
        }
        return _tr;
    }
});