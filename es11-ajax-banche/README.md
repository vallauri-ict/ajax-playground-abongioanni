## Banche
Questo piccolo esercizio è composto da una prima combo-box che si occupa di visualizzare un elenco di banche di un DB '4b_banche'.
Una volta selezionata una banca, verranno caricate in una seconda combo-box tutte le filiali relative a quella banca e alla loro selezione 
l'applicazione provvederà a caricare una tabella con l'elenco dei correntisti della filiale.

Si utilizza una single page con richieste ajax a web services in php (nella directory 'server'); tutte le richieste al server vengono fatte con una procedura:
```javascript
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
```
