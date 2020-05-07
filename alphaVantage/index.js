"use strict";

const apiKey = "UJGWAY47OK4QKSZ0";

let credentials = {
  web: {
    client_id:
      "461420881554-vohtumtl57fgfk63ft022vb2mqa4ufkl.apps.googleusercontent.com",
    project_id: "my-project-46576-275713",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "vAGVkxVhQNHTdJNgMtrVthOj",
    redirect_uris: ["http://127.0.0.1:8080/index.html"],
    javascript_origins: ["http://127.0.0.1:8080"],
  },
};

const clientSecret = credentials["web"]["client_secret"];
let redirectUri = credentials["web"]["redirect_uris"][0];
let scope = "https://www.googleapis.com/auth/drive";
let clientId = credentials["web"]["client_id"];
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code");

$(document).ready(function () {
  $(".loader .logo").fadeOut(0).fadeIn(1000);
  let _table = $("#tblResults tbody");
  let _tips = $(".search-results").eq(0).slideUp(0);
  let _openIcon = $(".icon");
  let _linksList = $(".links-wrapper ul li");
  let _backdrop = $(".backdrop");
  let _closeIcon = $(".close-btn");
  let _responsiveLinks = $("#menuNavbar");
  let _navbar = document.getElementsByClassName("responsive-navbar")[0];

  let c; //chart is empty
  if (localStorage.getItem("accessToken") === null) {
    $(".googleIcon").addClass("grey").prop("title", "Non sei registrato");
  }

  //CARICAMENTO COMBO SETTORE
  let sector_ = inviaRichiesta("GET", "http://localhost:3000/SECTOR");
  sector_.done(function (data) {
    for (let key in data) {
      if (key != "Meta Data")
        $("<option>", {
          text: key,
          value: key,
          appendTo: _cmbSector,
        });
    }
    $(_cmbSector).trigger("change");
  });
  sector_.fail(error);

  //STICKY NAVBAR
  var sticky = _navbar.offsetTop;
  $(document).on("scroll", () => {
    if (window.pageYOffset > sticky) {
      $(_navbar).addClass("sticky");
    } else {
      $(_navbar).removeClass("sticky");
    }
  });

  //LINKS UPDATE
  $(_responsiveLinks).children().remove();
  for (let i = 0; i < _linksList.length; i++) {
    let _a = $(_linksList).eq(i).find("a");
    let _newa;
    $("<li>", {
      appendTo: _responsiveLinks,
      append: [
        (_newa = $("<a>", {
          text: $(_a).text(),
          addClass: $(_a).attr("class"),
        }).on("click", () => {
          $(_responsiveLinks).parent().removeClass("open");
        })),
      ],
    }); //AGGIORNAMENTO DEL MENU' RESPONSIVE
    if (!$(_a).prop("class").includes("googleIcon")) {
      _newa.prop("href", _a.prop("href"));
    }
  }

  //RESPONSIVE MENU'
  $(_openIcon).on("click", () => {
    $(_responsiveLinks).parent().addClass("open");
    $(_responsiveLinks).animate({ opacity: 1 }, 125);
  });
  $(_closeIcon).on("click", () => {
    $(_responsiveLinks).animate({ opacity: 0 }, 125, () => {
      $(_responsiveLinks).parent().removeClass("open");
    });
  });
  $(_backdrop).on("click", () => {
    $(_responsiveLinks).animate({ opacity: 0 }, 125, () => {
      $(_responsiveLinks).parent().removeClass("open");
    });
  });

  $(".googleIcon").on("click", function () {
    //LOG IO OR UPLOAD ON DRIVE
    if (localStorage.getItem("accessToken") === null) {
      signIn(clientId, clientSecret, redirectUri, scope);
    } else {
      if ($("#files").val() == "") {
        $("#uploadResult")
          .removeClass("alert-danger")
          .removeClass("alert-success")
          .addClass("alert-warning")
          .html("<b>Attenzione</b>: devi selezionare un file!")
          .fadeOut(0)
          .fadeIn();
      }
      else {
        var file = $("#files")[0].files[0];
        let upload_ = new Upload(file).doUpload();
        upload_
          .done(function (data) {
            $("#uploadResult")
              .removeClass("alert-danger")
              .removeClass("alert-warning")
              .addClass("alert-success")
              .html("<b>Successo</b>: il caricamento è andato a buon fine!")
              .fadeOut(0)
              .fadeIn();
          })
          .fail(function () {
            $("#uploadResult")
              .removeClass("alert-success")
              .removeClass("alert-warning")
              .addClass("alert-danger")
              .html("<b>Errore</b>: C'è stato un errore durante il caricamento")
              .fadeOut(0)
              .fadeIn();
          });
      }

    }
  });

  $("#downloadChart").on("click", function () {
    //DOWNLOAD CHART IMAGE
    let url = c.toBase64Image();
    $(this).prop("href", url);
  });

  $("#files").on("change", function () {
    //SELECT A FILE
    var fullPath = $(this).val();
    if (fullPath) {
      var startIndex =
        fullPath.indexOf("\\") >= 0
          ? fullPath.lastIndexOf("\\")
          : fullPath.lastIndexOf("/");
      var filename = fullPath.substring(startIndex);
      if (filename.indexOf("\\") === 0 || filename.indexOf("/") === 0) {
        filename = filename.substring(1);
      }
      $("label[for=files]").text(filename);
    }
  });

  //EVENT COMBO COMPANIES CHANGE EVENT
  let _cmbCompanies = $("#cmbSymbols").on("change", function () {
    let default_ = inviaRichiesta(
      "GET",
      "http://localhost:3000/GLOBAL_QUOTE?symbol=" +
      $(this).val() /*+ "&apikey=" + apiKey*/
    );
    default_.done(function (data) {
      $(_table).html("").append(createRow(data[0]["Global Quote"]));
    });
    default_.fail(error);
  });

  //CARICAMENTO COMBO COMPANIES
  let defaultCompanies_ = inviaRichiesta(
    "GET",
    "http://localhost:3000/companies"
  );
  defaultCompanies_.done(function (data) {
    for (let i = 0; i < data.length; i++) {
      $("<option>", {
        text: data[i]["desc"],
        value: data[i]["id"],
        appendTo: _cmbCompanies,
      });
    }
    $(_cmbCompanies).trigger("change");
  });
  defaultCompanies_.fail(error);

  //EVENT COMBO SECTOR CHANGE EVENT
  let _cmbSector = $("#cmbSector").on("change", function () {
    let chartData_ = inviaRichiesta("GET", "http://localhost:3000/SECTOR");
    chartData_.done(function (data) {
      if (!c) {
        //CARICO I DATI DI DEFAULT DEL GRAFICO
        c = createChart("http://localhost:3000/chart");
      }
      changeChart(c, data[$(_cmbSector).val()]); //APPLICO E AGGIORNO I DATI DEL GRAFICO
    });
    chartData_.fail(error);
  });

  //RICERCA INCREMENTALE
  $("#txtSearch")
    .on("keyup", function () {
      if ($(this).val().length >= 2) {
        let search_ = inviaRichiesta(
          "GET",
          "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" +
          $(this).val() +
          "&apikey=" +
          apiKey
        );
        search_.done(function (data) {
          $(_tips).html("");
          let r = data["bestMatches"];
          for (let i = 0; i < r.length; i++) {
            let symbol = r[i]["1. symbol"];
            $("<li>", {
              name: symbol,
              text: r[i]["2. name"],
              appendTo: _tips,
              click: function () {
                let globalQuotes_ = inviaRichiesta(
                  "GET",
                  "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" +
                  symbol +
                  "&apikey=" +
                  apiKey,
                  {},
                );
                globalQuotes_.done(function (data) {
                  if ("Note" in data) {
                    throw (
                      "Limite richieste al server raggiunto\n" + data["Note"]
                    );
                  } else {
                    $(_table).html("").append(createRow(data["Global Quote"]));
                  }
                });
                globalQuotes_.fail(error);
              },
            });
          }
          $(_tips).slideDown(200);
        });
        search_.fail(error);
      }
    })
    .on("click", function () {
      if ($(_tips).html() != "") $(_tips).slideDown(200);
    })
    .on("focusout", function () {
      $(_tips).slideUp(200);
    });

  /***************************** GRAFICO *****************************/

  function createChart(dataChart) {
    let dataChart_ = inviaRichiesta("GET", dataChart, {}, false);
    dataChart_.done(function (data) {
      return data;
    });
    dataChart_.fail(error);
    return new Chart($("#myChart"), JSON.parse(dataChart_.responseText)); //RITORNA IL GRAFICO VUOTO
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

  /***************************** FUNCTIONS *****************************/
  function signIn(clientId, clientSecret, redirectUri, scope) {
    let url =
      "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=" +
      redirectUri +
      "&prompt=consent&response_type=code&client_id=" +
      clientId +
      "&scope=" +
      scope +
      "&access_type=offline";
    let r_ = inviaRichiesta(
      "POST",
      "https://www.googleapis.com/oauth2/v4/token",
      {
        code: code,
        redirect_uri: redirectUri,
        client_secret: clientSecret,
        client_id: clientId,
        scope: scope,
        grant_type: "authorization_code",
      },
      false
    );
    r_.done(function (data) {
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("expires_in", data.expires_in);
      window.history.pushState({}, document.title, "index.html");
    });
    setTimeout(window.location = url,1500);

  }

  class Upload {
    constructor(file) {
      this.file = file;
    }
    getType() {
      localStorage.setItem("type", this.file.type);
      return this.file.type;
    }
    getSize() {
      localStorage.setItem("size", this.file.size);
      return this.file.size;
    }
    getName() {
      return this.file.name;
    }
    doUpload() {
      var formData = new FormData();
      // add assoc key values, this will be posts values
      formData.append("file", this.file, this.getName());
      formData.append("upload_file", true);
      return $.ajax({
        type: "POST",
        beforeSend: function (request) {
          request.setRequestHeader(
            "Authorization",
            "Bearer" + " " + localStorage.getItem("accessToken")
          );
        },
        url: "https://www.googleapis.com/upload/drive/v2/files",
        data: {
          uploadType: "media",
        },
        xhr: function () {
          var myXhr = $.ajaxSettings.xhr();
          return myXhr;
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000,
      });
    }
  }

  function createRow(data) {
    //RITORNA UNA RIGA PER UNA TABELLA
    let _tr = $("<tr>");
    for (let key in data) {
      $("<td>", {
        text: data[key],
        appendTo: _tr,
      });
    }
    return _tr;
  }

  function inviaRichiesta(method, url, parameters = "", async = true) {
    return $.ajax({
      //PROMISE PER RICHESTA AJAX
      type: method,
      url: url,
      data: parameters,
      contentType: "application/x-www-form-urlencoded;charset=utf-8",
      dataType: "json",
      timeout: 5000,
      async: async,
    });
  }

  function error(jqXHR, text_status, string_error) {
    //BANALE ERROR HANDLER
    if (jqXHR.status == 0) alert("Connection Refused or Server timeout");
    else if (jqXHR.status == 200)
      alert("Formato dei dati non corretto : " + jqXHR.responseText);
    else alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
  }

  function Random(min, max) {
    //INCLUSIVO
    return Math.floor((max - min + 1) * Math.random()) + min;
  }
  setTimeout(function () {
    $(".loader").slideUp();
    $(".loader .lds-ring").fadeOut();
  }, 1500);
});
