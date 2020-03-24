<?php

	function _connection($dbName){
		define('DBHOST', 'localhost');
		define('DBUSER', 'root');
		define('DBPASS', '');
		mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		try
		{
			$con = new mysqli(DBHOST, DBUSER, DBPASS, $dbName);
			$con->set_charset("utf8");
			return $con;
		}
		catch (mysqli_sql_exception $ex)
		{
			http_response_code(503);
			die ("Errore connessione db: " . $ex->getMessage());
		}
	}


	function _eseguiQuery($con, $sql){
		try{
			$rs=$con->query($sql);
		}
		catch (mysqli_sql_exception $ex)
		{  
			$con->close();
			http_response_code(500);
			die("Errore esecuzione query. " . $ex->getMessage());
		}

		if(!is_bool($rs))
			$data=$rs->fetch_all(MYSQLI_ASSOC);
		else
			$data=$rs;
		return $data;
	}	
?>