let chartGraphicalDatas = {
    "type": "bar",
    "data": {
        "labels": [],
        "datasets": [
            {
                "data": [],
                "backgroundColor": [],
                "borderColor": [],
                "borderWidth": 1
            }
        ]
    },
    "options": {
        "scales": {
            "yAxes": [
                {
                    "ticks": {
                        "beginAtZero": true
                    }
                }
            ],
            "xAxes": [{
                "ticks": {
                    "autoSkip": false,
                    "maxRotation": 90,
                    "minRotation": 90
                }
            }]
        },
        "legend": {
            "display": false
        }
    }
}

function createChart(idName,type="bar") {
    chartGraphicalDatas["type"]=type;
    return new Chart(document.getElementById(idName), chartGraphicalDatas); //RITORNA IL GRAFICO VUOTO
}

function Random(min, max) {
    //INCLUSIVO
    return Math.floor((max - min + 1) * Math.random()) + min;
}

function changeChart(chart, datas) {
    //APPLICO I DATI NEL GRAFICO
    let dataChart = chart["data"];
    dataChart["labels"] = [];
    let dataset = dataChart["datasets"][0];
    dataset["data"] = [];
    for (let key in datas) {
        dataChart["labels"].push(key);
        dataset["data"].push(datas[key].replace("%", ""));
        let color =
            "rgba(" +
            Random(0, 255) +
            ", " +
            Random(0, 255) +
            ", " +
            Random(0, 255) +
            ", 1)";
        dataset["backgroundColor"].push(color);
        dataset["borderColor"].push(color);
    }
    chart.update();
}