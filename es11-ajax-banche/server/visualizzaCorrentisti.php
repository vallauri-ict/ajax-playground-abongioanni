<?php
    require "_libreria.php";
    $con=_connection("4b_banche");
    if(!isset($_REQUEST["cFiliale"])){
        die("Parametro mancante");
    }
    $codFiliale=$con->real_escape_string($_REQUEST["cFiliale"]);
    if (!is_numeric($codFiliale))
    {
        $con->close();
        http_response_code(400);
        die ("Il parametro cFiliale deve essere numerico.");
    }
    echo(json_encode(_eseguiQuery($con,"SELECT correntisti.cCorrentista, correntisti.nome AS nomeCorrentista, comuni.nome AS comuneCorrentista, telefono, cConto, saldo FROM correntisti INNER JOIN comuni ON correntisti.cComune = comuni.cComune INNER JOIN conti ON correntisti.cCorrentista = conti.cCorrentista WHERE cFiliale = $codFiliale;")));
    $con->close();

