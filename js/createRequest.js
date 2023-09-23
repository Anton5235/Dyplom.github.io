"use strict";

function createRequest(requestBody, requestSource, callback) {
  const xhr = new XMLHttpRequest(); 
  xhr.open("POST", "https://jscp-diplom.netoserver.ru/"); 
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
  xhr.send(requestBody);
  xhr.onload = function () {
    if (xhr.status == 200) {
      callback(xhr.response);
    } else {
        alert("Ошибка: " + xhr.status);
      return;
    }
  };

  xhr.onerror = function () {
    alert("Запрос не удался");
  };
}

function setJson(key, value) {
  const jsonValue = JSON.stringify(value);
    return window.sessionStorage.setItem(key, jsonValue);
}

function getJson(key) {
  const item = window.sessionStorage.getItem(key)
    return JSON.parse(item);
}


