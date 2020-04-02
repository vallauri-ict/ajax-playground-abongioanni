"use strict";

const apiKey="UJGWAY47OK4QKSZ0";
const v={
    "IBM":"IBM",
    "MSFT":"Microsoft Corporation",
    "BABA":"Alibaba",
    "XIACF":"Xiaomi Corporation",
    "SNE":"Sony Corporation"
};

$(document).ready(function () {

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
                try {
                    for (let i = 0; i < 5; i++) {
                        let r = inviaRichiesta("GET", "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + data["bestMatches"][i]["1. symbol"] + "&apikey=" + apiKey);
                        r.done(function (data) {
                            $(_table).append(createRow(data["Global Quote"]));
                            if ("Note" in data) {
                                i=5;
                                throw "Limite richieste al server raggiunto\n" + data["Note"];
                            }
                        });
                        r.fail(error);
                    }
                } catch (ee) {

                }
            });
            request.fail(error);
        }
    });

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