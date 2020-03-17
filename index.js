"use strict";

let currentUser;
let _img;
let index;
let _li;
let _userTitle;
let _userValue;

$(document).ready(function() {
    index = 0;
    _img = $("#picture");
    _li = $("#values_list li");
    _userTitle = $("#user_title");
    _userValue = $("#user_value");
    //getUser(strCheckValue());
    $(_li).on("mouseover", function() {
        reset(this);
    })
    $("#slider").on("input", function() {
        $(".number").text($("#slider").prop("value"));
    });
    $(".avanti").on("click", function() {
        if (index < currentUser["results"].length - 1)
            visualizza(++index);
        $("#partial").text((index + 1).toString() + "/" + (currentUser["results"].length).toString());
    });
    $(".indietro").on("click", function() {
        if (index > 0)
            visualizza(--index);
        $("#partial").text((index + 1).toString() + "/" + (currentUser["results"].length).toString());
    });
    $("#loader").css({ "display": "none" });
});

function getUser(parametri) {
    $("#wait img").fadeOut(0);
    $("#wait").css({ "color": "#0000" }).slideDown(200);
    $("#loader").css({ "display": "block" });
    setTimeout(function() {
        $("#loader").css({ "display": "none" });
        $("#wait").slideUp(500);
    }, Random(500, 2500));
    $.ajax({
        url: 'https://randomuser.me/api/?',
        dataType: 'json',
        data: parametri,
        success: function(data) {
            currentUser = data;
            console.log(currentUser);
            index = 0;
            visualizza(index);
            $("#partial").text((index + 1).toString() + "/" + (data["results"].length).toString());
        }
    });
}

function Random(min, max) {
    return Math.floor((max - min + 1) * Math.random()) + min;
}

function visualizza(index) {
    let data = currentUser["results"][index];
    for (let i = 0; i < _li.length; i++) {
        switch (_li[i].getAttribute("data-label")) {
            case 'name':
                _li[i].setAttribute("data-value", data["name"]["first"] + " " + data["name"]["last"]);
                break;
            case 'location':
                _li[i].setAttribute("data-value", data["location"]["street"]["number"] + " " + data["location"]["street"]["name"]);
                break;
            case 'birthday':
                _li[i].setAttribute("data-value", data["dob"]["date"].split('T')[0]);
                break;
            case 'pass':
                _li[i].setAttribute("data-value", data["login"]["password"]);
                break;
            default:
                _li[i].setAttribute("data-value", data[_li[i].getAttribute("data-label")]);
                break;
        }
    }
    $(_img).prop("src", data["picture"]["large"]);
    reset(_li[0]);
}

function reset(sender) {
    for (let i = 0; i < _li.length; i++)
        _li[i].className = _li[i].className.replace(/\bactive\b/, "");
    sender.className += " active";
    $(_userValue).text(sender.getAttribute("data-value"));
    $(_userTitle).text(sender.getAttribute("data-title"));
}

function strCheckValue() {
    let _checkboxChecked = $("input[type=checkbox]:checked");
    let _radioPwd1 = $("fieldset input[name=pwd1]:checked");
    let _radioPwd2 = $("fieldset input[name=pwd2]:checked");

    let strReturn = 'results=' + $('#slider').prop('value') +
        ($('input[type=radio]:checked').prop('value') != "" ? '&' + $('input[type=radio]:checked').prop('value') : "");
    if (_checkboxChecked.length > 0)
        strReturn += "&nat=";
    for (let i = 0; i < _checkboxChecked.length; i++)
        strReturn += (i > 0 ? "," : "") + $(_checkboxChecked[i]).prop("value");

    strReturn += ($(_radioPwd1).prop('value') != "" ? "&password=" + $(_radioPwd1).prop('value') : "");
    strReturn += ($(_radioPwd2).prop('value') != "" ? (!strReturn.includes("&password=") ? "&password=" : ",") + $(_radioPwd2).prop('value') : "");
    console.log(strReturn);
    return strReturn;
}