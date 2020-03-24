<?php
    require "_libreria.php";
    $con=_connection("4b_banche");
    if(!isset($_REQUEST["cBanca"])){
        die("Parametro mancante");
    }
    $codBanca=$con->real_escape_string($_REQUEST["cBanca"]);
    if (!is_numeric($codBanca))
    {
        $con->close();
        http_response_code(400);
        die ("Il parametro cBanca deve essere numerico.");
    }
    echo(json_encode(_eseguiQuery($con,"SELECT cFiliale, filiali.nome AS nomeFiliale, comuni.nome AS nomeComune FROM filiali INNER JOIN comuni ON filiali.cComune = comuni.cComune WHERE cBanca = $codBanca;")));
    $con->close();
