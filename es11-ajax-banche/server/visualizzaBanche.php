<?php
    require "_libreria.php";
    $con=_connection("4b_banche");
    echo(json_encode(_eseguiQuery($con,"SELECT cBanca,nome FROM banche")));
    $con->close();
