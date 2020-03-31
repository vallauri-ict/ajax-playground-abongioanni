# Alpha Vantage (ajax - playground)
Questo semplice programma è composto dalla seguente interfaccia:

![alt text](https://github.com/vallauri-ict/ajax-playground-abongioanni/blob/master/alphaVantage/Cattura.PNG)

Nella combo a sinistra ci sono alcuni brand già registrati da un JSON con associazione "symbol":"nome azienda":
```JavaScript
let v={
    "IBM":"IBM",
    "MSFT":"Microsoft Corporation",
    "AMD":"Advanced Micro Devices Inc.",
    "XIACF":"Xiaomi Corporation",
    "SNE":"Sony Corporation"
};
```

Selezionandone uno verranno caricati nella tabella sottostante i relativi campi.

Il campo di destra si occupa invece di svolgere una ricerca incrementale e caricare i primi 5 risultati nella tabella.
## ATTENZIONE! 
C'è un limite a 5 richieste alle API al minuto o 500 al giorno dovuto all'account basilare di Alpha Vantage
