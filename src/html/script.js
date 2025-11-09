// Selección de Elementos
const cardsContainer = document.getElementById("cards-container");

document.addEventListener("DOMContentLoaded", () => {
  eventos();
});

function eventos() {
  fetch("http://localhost:3000/api/eventos")
    .then((res) => res.json())
    .then((cards) => {
      cards.forEach(card => {
        cargarCard(card);
      });
    })
    .catch((error) => {
      console.error("Error al cargar los eventos:", error);
    });
}

function cargarCard(cardData) {
  const div = document.createElement("div");
  div.classList.add("card");
  div.innerHTML = `<img id="card-img" class="card-img" src="${cardData.imgURL}" alt="gr" />
                  <div class="card-content">
                    <span class="category nature">${cardData.category}</span>
                    <h2 class="card-title">${cardData.title}</h2>
                    <p class="card-description">${cardData.description}</p>
                    <div class="event-date">
                      <img src="../assets/calendar-icon.svg" />
                      <span>${formatearFecha(cardData.dateTime)}</span>
                    </div>
                    <div class="countdown-area">
                      <div class="countdown-item">
                        <span class="countdown-num"> 09 </span>
                        <span class="countdown-txt"> Días </span>
                      </div>
                      <div class="countdown-item">
                        <span class="countdown-num"> 01 </span>
                        <span class="countdown-txt"> Horas </span>
                      </div>
                      <div class="countdown-item">
                        <span class="countdown-num"> 45 </span>
                        <span class="countdown-txt"> Minutos </span>
                      </div>
                      <div class="countdown-item">
                        <span class="countdown-num"> 22 </span>
                        <span class="countdown-txt"> Segundos </span>
                      </div>
                    </div>
                  </div>
                </div>`;
  
  cardsContainer.appendChild(div);
}

function formatearFecha(fechaCard) {
  // Si se proporciona una fecha, conviértela a objeto Date
  const fecha = fechaCard ? new Date(fechaCard) : new Date();

  // Verificación más segura
  if (typeof Temporal !== 'undefined' &&
      typeof Temporal.ZonedDateTime !== 'undefined' &&
      typeof Temporal.ZonedDateTime.from === 'function') {

    try {
      const temporalFecha = Temporal.ZonedDateTime.from(fecha.toISOString());
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      let nombreDia = dias[temporalFecha.dayOfWeek % 7];
      nombreDia = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);

      const dia = String(temporalFecha.day).padStart(2, '0');
      const mes = String(temporalFecha.month).padStart(2, '0');
      const año = String(temporalFecha.year).slice(-2);
      const hora = String(temporalFecha.hour).padStart(2, '0');
      const minuto = String(temporalFecha.minute).padStart(2, '0');

      return `${nombreDia}, ${dia}/${mes}/${año}, - ${hora}:${minuto}`;
    } catch (e) {
      console.warn("Error usando Temporal:", e);
    }
  }

  // Fallback universal
  const opciones = {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Madrid',
  };

  let res = fecha.toLocaleString('es-ES', opciones).replace(',', ', -');
  res = res.charAt(0).toUpperCase() + res.slice(1)

  return res;
}

