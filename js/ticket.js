"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const ticketDetails = getJson("ticket-details");
  const ticketInfoWrapper = document.querySelector(".ticket__info-wrapper");
  ticketInfoWrapper.innerHTML = "";
  /* Формируем блок с информацией о сеансе в электронном билете*/
  const ticketInfoBlock = `
    <p class="ticket__info">На фильм: <span class="ticket__details ticket__title">${ticketDetails.filmName}</span></p>
    <p class="ticket__info">Ряд/Место: <span class="ticket__details ticket__chairs">${ticketDetails.strRowPlace}</span></p>
    <p class="ticket__info">В зале: <span class="ticket__details ticket__hall">${ticketDetails.hallNameNumber}</span></p>
    <p class="ticket__info">Начало сеанса: <span class="ticket__details ticket__start">${ticketDetails.seanceTime} - ${ticketDetails.seanceDay}</span></p>
    <div id="qrcode" class="ticket__info-qr"></div>
    <p class="ticket__hint">Покажите QR-код нашему контроллеру для подтверждения бронирования.</p>
    <p class="ticket__hint">Приятного просмотра!</p> `;

  ticketInfoWrapper.insertAdjacentHTML("beforeend", ticketInfoBlock);

  /* Добавляем инфо о сеансе при переходе по qr-коду*/
  const qrContent = `
    Фильм: ${ticketDetails.filmName}
    Зал: ${ticketDetails.hallNameNumber}
    Ряд/место: ${ticketDetails.strRowPlace}
    Дата: ${ticketDetails.seanceDay}
    Начало сеанса: ${ticketDetails.seanceTime}
    Данный билет является подтверждением оплаты сеанса. Действителен только на данный сеанс.`;

    let qr = document.getElementById('qrcode');
    qr.append(QRCreator(qrContent).result);			
    qr.querySelector('canvas').style.display = 'block';	
    qr.querySelector('canvas').style.margin = '0 auto';
    qr.querySelector('canvas').style.width = '25vh';
})