
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  updateCalendar();
  updateData();
});

const pageNavDay = document.querySelectorAll(".page-nav__day");
function updateCalendar() {

  /* Выставляем даты в шапке*/
  const selectedDay = new Date(Date.now());
  pageNavDay.forEach((elememt) => {
    elememt.dataset.dayTimeStamp = selectedDay.setHours(0, 0, 0, 0);
    const pageNavDayWeek = elememt.querySelector(".page-nav__day-week");
    const pageNavDayNumber = elememt.querySelector(".page-nav__day-number");
      pageNavDayWeek.textContent = selectedDay.toLocaleDateString("ru-RU", {weekday: "short"});
      pageNavDayNumber.textContent = selectedDay.getDate();
  /* Красим выходные в красный*/
    if (pageNavDayWeek.textContent === 'сб' || pageNavDayWeek.textContent === 'вс') {
      elememt.classList.add("page-nav__day_weekend");
    } else{
      elememt.classList.remove("page-nav__day_weekend");
    }
    selectedDay.setDate(selectedDay.getDate() + 1);
  });
}

function updateData() {
  createRequest("event=update", "MAIN", contentUpdate);
};
/* Обновляем данные через запрос*/
function contentUpdate(serverResponse) {
  const response = JSON.parse(serverResponse);
  /* Получаем фильмы, залы, сеансы*/
  const films = response.films.result;
  const halls = response.halls.result.filter((item) => item.hall_open !== "0");
  const seances = response.seances.result;
  const selectedDayTimeStamp = (document.querySelector("nav .page-nav__day_chosen")).dataset.dayTimeStamp;
  const dateNow = Date.now();
  const hallLayout = {}; /*Объект в котором сохраним в последующем конфигурацию залов*/
  const main = document.querySelector("main");
  main.innerHTML = "";
  /* Отрисовка блока с информацией о фильме*/
  films.forEach((element) => {
    const movieBlock = `
        <section class="movie">
          <div class="movie__info">
            <div class="movie__poster">
              <img class="movie__poster-image" alt="${element.film_name} постер" src="${element.film_poster}">
            </div>
            <div class="movie__description">
              <h2 class="movie__title">${element.film_name}</h2>
              <p class="movie__synopsis">${element.film_description}</p>
              <p class="movie__data">
                <span class="movie__data-duration">${element.film_duration} мин.</span>
                <span class="movie__data-origin">${element.film_origin}</span>
              </p>
            </div>
          </div>
        </section>`;
    main.insertAdjacentHTML("beforeend", movieBlock);

    halls.forEach((elementHall) => {
      const currentFilmsSeancesHalls = seances.filter((seance) => { return seance.seance_filmid === element.film_id && seance.seance_hallid === elementHall.hall_id;});
      const numberHall = elementHall.hall_name;
      /*Блок с номером зала*/
      if (currentFilmsSeancesHalls.length) {
         const numberHallBlock = 
         `<div class="movie-seances__hall">
              <h3 class="movie-seances__hall-title">${numberHall}</h3>
              <ul class="movie-seances__list">
              </ul>
            </div> `;
        const movie = main.querySelector(".movie:last-child");
        movie.insertAdjacentHTML("beforeend", numberHallBlock);
        
        const movieSeances = movie.querySelector(".movie-seances__hall:last-child > .movie-seances__list");
        currentFilmsSeancesHalls.forEach(elementSeance => {
          const seanceTimeStamp = +selectedDayTimeStamp + (+elementSeance.seance_start * 60 * 1000);
          /* Если фильм не начался, вносим блок с возможностью покупки билета на конкретные фильм/дата, если начался button = disabled*/
          const seancesNoDisabled = `<li class="movie-seances__time-block">
          <a class="movie-seances__time" href="hall.html" data-film-id=${element.film_id} data-film-name="${element.film_name}" data-hall-id=${elementHall.hall_id} data-hall-name="${numberHall}" data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>`;
          if (dateNow < seanceTimeStamp) {
          
            movieSeances.insertAdjacentHTML("beforeend", seancesNoDisabled);
          } else {
            const seancesDisabled = `<li class="movie-seances__time-block">
            <a class="movie-seances__time acceptin-button-disabled" href="#" data-film-id=${element.film_id} data-film-name="${element.film_name}" data-hall-id=${elementHall.hall_id} data-hall-name="${numberHall}" data-price-vip=${elementHall.hall_price_vip} data-price-standart=${elementHall.hall_price_standart} data-seance-id=${elementSeance.seance_id} data-seance-time=${elementSeance.seance_time} data-seance-start=${elementSeance.seance_start} data-seance-time-stamp=${seanceTimeStamp}>${elementSeance.seance_time}</a></li>`;
           movieSeances.insertAdjacentHTML("beforeend", seancesDisabled);
          }
        });
      };
      hallLayout[elementHall.hall_id] = elementHall.hall_config;
    });
  })
  setJson("config-halls", hallLayout);
  seanceDayListen();
}
/*Формируем переключение в шапке с датами, сохраняем данные по выбранному сеансу, устанавливаем слушатель*/
function clickDay(event) {
  event.preventDefault();
  pageNavDay.forEach((element) => {
    element.classList.remove("page-nav__day_chosen");
  });

  event.currentTarget.classList.add("page-nav__day_chosen");
  updateData();
}
function clickSeance() {
  const seanceData = this.dataset;
  setJson("data-selected-seance", seanceData);
}
function seanceDayListen() {
  pageNavDay.forEach(element => {
    element.addEventListener("click", clickDay);
  });
  const movieSeancesTime = document.querySelectorAll(".movie-seances__time");
  movieSeancesTime.forEach(element => {
    element.addEventListener("click", clickSeance);
  });
}



