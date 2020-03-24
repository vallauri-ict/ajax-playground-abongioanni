"use strict";
$(document).ready(function () {
	let _wrapperFiliali=$("#wrapFiliali");
	let _wrapperCorrentisti= $("#wrapCorrentisti");
    let _lstBanche = $("#lstBanche");
	let _lstFiliali = $("#lstFiliali");
    _wrapperCorrentisti.css("display", "none");//si nasconde la parte della tabella
	
    //RICHIESTA BANCHE
    let _richiestaBanche = inviaRichiesta("GET", "server/visualizzaBanche.php" );
	_richiestaBanche.fail(error);//ERRORE
    _richiestaBanche.done(function (data) {//BUON FINE
        _wrapperFiliali.css("display", "block");
        //CARICAMENTO BANCHE NELLA COMBO
        for (let banca of data)
            $("<option>", {
                "value": banca["cBanca"],
                "text": banca["nome"],
                appendTo: _lstBanche
            })
        _lstBanche.prop("selectedIndex", -1);
    });

    _lstBanche.on("change", function () { 
		_lstFiliali.html("");
        _wrapperCorrentisti.css("display", "none");
        let cBanca = this.value;

		//RICHIESTA FILIALI
        let _richiestaFiliali = inviaRichiesta("POST", "server/visualizzaFiliali.php",  {"cBanca":cBanca});
        _richiestaFiliali.fail(error);//ERRORE
        _richiestaFiliali.done(function (data) {//BUON FINE
            _wrapperFiliali.css("display", "block");
            //CARICAMENTO FILIALI NELLA COMBO
            for (let record of data)
                $("<option>", {
                    "value": record["cFiliale"],
                    "text": record["nomeFiliale"] + " - " + record["nomeComune"],
                    appendTo:_lstFiliali
                });
            _lstFiliali.prop("selectedIndex", -1);

			//CARICAMENTO FILIALI NELLA TABELLA
			_lstFiliali.on("change", function () {
                let _richiestaCorrentisti = inviaRichiesta("POST", "server/visualizzaCorrentisti.php", {cFiliale: this.value});
				_richiestaCorrentisti.fail(error);//ERRORE
                _richiestaCorrentisti.done(function (data) {//BUON FINE
                    //CREAZIONE TABELLA
                    _wrapperCorrentisti.css("display", "block");
                    $("#tabCorrentisti tbody").html("").append(function () {
                        let v=[];
                        for (let record of data) {
                            v[v.length]=$("<tr>",{
                                append:function () {
                                    let g = [];
                                    for (let key in record){
                                        g[g.length] = $("<td>", {
                                            "text": record[key],
                                        });
                                    }
                                    return g;
                                }
                            });
                        }
                        return v;
                    });
                });
            });
        });
    });
});