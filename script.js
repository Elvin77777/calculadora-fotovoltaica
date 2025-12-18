function calcular() {

  const consumoMensual = parseFloat(document.getElementById("consumoMensual").value);
  const ahorro = parseFloat(document.getElementById("ahorro").value) / 100;
  const hsp = parseFloat(document.getElementById("hsp").value);
  const perdidas = parseFloat(document.getElementById("perdidas").value) / 100;
  const tipoSistema = document.getElementById("tipoSistema").value;
  const respaldo = parseFloat(document.getElementById("respaldo").value);

  const consumoDiario = consumoMensual / 30;
  const energiaSolarDiaria = consumoDiario * ahorro;
  const potenciaFV = energiaSolarDiaria / (hsp * (1 - perdidas));

  let potenciaPanel;
  if (potenciaFV <= 3) potenciaPanel = 450;
  else if (potenciaFV <= 6) potenciaPanel = 550;
  else potenciaPanel = 600;

  const numeroPaneles = Math.ceil((potenciaFV * 1000) / potenciaPanel);
  const inversor = Math.ceil(potenciaFV * 1.2);

  let bateriasTexto = "No aplica";
  if (tipoSistema !== "red") {
    const energiaRespaldo = energiaSolarDiaria * (respaldo / 24);
    bateriasTexto = `Energía de respaldo requerida: ${energiaRespaldo.toFixed(1)} kWh`;
  }

  const tipoSistemaSelect = document.getElementById("tipoSistema");
const respaldoInput = document.getElementById("respaldo");

function actualizarRespaldo() {
  const tipo = tipoSistemaSelect.value;

  if (tipo === "red") {
    respaldoInput.disabled = true;
    respaldoInput.value = 0;
  } else {
    respaldoInput.disabled = false;
    if (respaldoInput.value == 0) respaldoInput.value = 7;
  }
}

tipoSistemaSelect.addEventListener("change", actualizarRespaldo);
actualizarRespaldo();


  document.getElementById("resultados").innerHTML = `
    <strong>Consumo diario:</strong> ${consumoDiario.toFixed(2)} kWh/día<br>
    <strong>Energía solar requerida:</strong> ${energiaSolarDiaria.toFixed(2)} kWh/día<br>
    <strong>Potencia del sistema:</strong> ${potenciaFV.toFixed(2)} kWp<br>
    <strong>Panel recomendado:</strong> ${potenciaPanel} W<br>
    <strong>Cantidad de paneles:</strong> ${numeroPaneles}<br>
    <strong>Inversor recomendado:</strong> ${inversor} kW<br>
    <strong>Baterías:</strong> ${bateriasTexto}
  `;

  // ===== ALERTAS =====
  let alertas = [];

  if (perdidas < 0.15) {
    alertas.push(`<div class="alerta amarilla">ℹ Las pérdidas seleccionadas son muy bajas para condiciones reales.</div>`);
  }

  if (potenciaFV < (energiaSolarDiaria / hsp)) {
    alertas.push(`<div class="alerta roja">❌ La potencia fotovoltaica podría no cubrir el ahorro deseado.</div>`);
  }

  if (potenciaFV / inversor < 0.6) {
    alertas.push(`<div class="alerta naranja">⚠ El inversor está sobredimensionado.</div>`);
  }

  if (tipoSistema === "red" && respaldo > 0) {
    alertas.push(`<div class="alerta amarilla">ℹ En sistemas en red normalmente no se usan baterías.</div>`);
  }

  if (alertas.length === 0) {
    alertas.push(`<div class="alerta verde">✔ El sistema se encuentra correctamente dimensionado.</div>`);
  }

  document.getElementById("alertas").innerHTML = alertas.join("");
}


