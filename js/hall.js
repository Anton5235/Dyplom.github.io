"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const dataSelectedSeance = getJson("data-selected-seance");
  const timestamp = dataSelectedSeance && +dataSelectedSeance.seanceTimeStamp / 1000 || 0;
  const hallId = dataSelectedSeance.hallId;
  const seanceId = dataSelectedSeance.seanceId;
  const requestBody = `event=get_hallConfig&timestamp=${timestamp}&hallId=${hallId}&seanceId=${seanceId}`;
  createRequest(requestBody, "HALL", hallUpdate);
});
/* Обработка запроса*/
function hallUpdate(response) {
  const parseJson = JSON.parse(response);

  const dataSelectedSeance = getJson("data-selected-seance");
 let configSelectedHall;
  let configHalls = getJson("config-halls");
  if (parseJson) {
    configSelectedHall = parseJson; 
  } else {
     configSelectedHall = configHalls[dataSelectedSeance.hallId];
  }

  const buyingInfo = document.querySelector(".buying__info");
  const confStep = document.querySelector(".conf-step");
  buyingInfo.innerHTML = "";
  confStep.innerHTML = "";
 /* Выводим блок с инфо о сеансе*/
  const buyingInfoBlock = `
  <div class="buying__info-description">
    <h2 class="buying__info-title">"${dataSelectedSeance.filmName}"</h2>
    <p class="buying__info-start">Начало сеанса: ${dataSelectedSeance.seanceTime} </br>
    ${new Date(+dataSelectedSeance.seanceTimeStamp).toLocaleDateString("ru-RU", { day: "2-digit", month:"long", year: "numeric" })}</p>
    <p class="buying__info-hall">${dataSelectedSeance.hallName}</p>          
  </div>
  <div class="buying__info-hint">
    <p>Тапните дважды,<br>чтобы увеличить</p>
  </div>`;

  buyingInfo.innerHTML = "";
  buyingInfo.insertAdjacentHTML("beforeend", buyingInfoBlock);

  

 /* Выводим схему зала и информацию о посадочных местах*/
  const confStepBlock = `
  <div class="conf-step__wrapper">
  ${configSelectedHall}
   </div>
    <div class="conf-step__legend">
    <div class="col">
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_standart"></span> Свободно (<span
          class="conf-step__legend-value price-standart">${dataSelectedSeance.priceStandart}</span>руб)</p>
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_vip"></span> Свободно VIP (<span
          class="conf-step__legend-value price-vip">${dataSelectedSeance.priceVip}</span>руб)</p>
    </div>
    <div class="col">
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_taken"></span> Занято</p>
      <p class="conf-step__legend-price"><span class="conf-step__chair conf-step__chair_selected"></span> Выбрано</p>
    </div>
  </div>`;
  confStep.innerHTML = "";
  confStep.insertAdjacentHTML("beforeend", confStepBlock);

  const selectedChairs = []; /* выбранные места будем довавлять сюда*/
 /* Проверка доступности и выбор мест*/
  const confStepChair = document.querySelectorAll(".conf-step__wrapper .conf-step__chair");
  confStepChair.forEach((element) => {
    element.addEventListener("click", (event) => {
      const elementClickClassList = event.currentTarget.classList;
      if (elementClickClassList.contains("conf-step__chair_taken")) {
        return;
      }
      element.classList.toggle("conf-step__chair_selected");
    });
  });
  /* Создаем событие для кнопки бронирования*/
  const acceptinButton = document.querySelector(".acceptin-button");
  acceptinButton.addEventListener("click", (event) => {
    event.preventDefault();
    const confStepRow = document.querySelectorAll(".conf-step__row")
    /* Цикл по рядам*/
    for (let iRow = 0; iRow < confStepRow.length; iRow++) {
      const elementRow = confStepRow[iRow];
      const arrayOfChairs = Array.from(
        elementRow.querySelectorAll(".conf-step__chair")
      );
        /* Цикл по местам, определение статуса места, довавление в массив*/
      for (let iChair = 0;iChair < arrayOfChairs.length; iChair++) {
        const elementChair = arrayOfChairs[iChair];
        if (elementChair.classList.contains("conf-step__chair_selected")) {
          const typeChair = elementChair.classList.contains( "conf-step__chair_vip") ? "vip": "standart";
          selectedChairs.push({
            row: iRow + 1,
            place: iChair + 1,
            typeChair: typeChair,
          });
        }
      }
    }
    /* Если в массиве есть выбранные места, записываем в конфиг, переприсваиваем класс*/
    if (selectedChairs.length) {
      setJson("selected-chairs-block", selectedChairs);
      const configSelectedHallHtml = document.querySelector(".conf-step__wrapper")?.innerHTML.trim();
      configHalls[dataSelectedSeance.hallId] = configSelectedHallHtml;
      setJson("config-halls", configHalls);

      confStepChair.forEach((element) => {
        element.classList.replace("conf-step__chair_selected", "conf-step__chair_taken");
      });
      const selectedChairsBlock = getJson("selected-chairs-block");
      const rowChair = [];
      let counter = 0; /*Счетчик стоимости билетов*/

      selectedChairsBlock.forEach(element => {
        rowChair.push(`${element.row}/${element.place}`);
        counter += element.typeChair === "vip" ? +dataSelectedSeance.priceVip : +dataSelectedSeance.priceStandart;
      });

      const ticketDetails = {
        ...dataSelectedSeance,
        hallNameNumber: dataSelectedSeance.hallName,
        strRowPlace: rowChair,
        seanceTimeStampInSec: +dataSelectedSeance.seanceTimeStamp / 1000,
        seanceDay: new Date(+dataSelectedSeance.seanceTimeStamp).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" }),
        totalCost: counter,
      };

      setJson("ticket-details", ticketDetails);
      window.location.href = "payment.html";
    }
  });
};
