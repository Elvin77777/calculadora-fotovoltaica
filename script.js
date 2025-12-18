// ===============================
// CONTROL DE HORAS DE RESPALDO
// ===============================

function actualizarRespaldo() {
  const tipoSistemaSelect = document.getElementById("tipoSistema");
  const respaldoInput = document.getElementById("respaldo");

  if (!tipoSistemaSelect || !respaldoInput) return;

  if (tipoSistemaSelect.value === "red") {
    respaldoInput.disabled = true;
    respaldoInput.value = 0;
  } else {
    respaldoInput.disabled = false;
    if (respaldoInput.value == 0) respaldoInput.value = 7;
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  actualizarRespaldo();
  document
    .getElementById("tipoSistema")
    .addEventListener("change", actualizarRespaldo);
});

// ===============================
// CÁLCULO DEL SISTEMA
// ===============================

function calcular() {

  // Asegurar estado correcto antes de calcular
  actualizarRespaldo();

  const tipoSistema = document.getElementById("tipoSistema").value;
  const consumoMensual = parseFloat(document.getElementById("consumoMensual").value);
  const ahorro = parseFloat(document.getElementById("ahorro").value) / 100;
  const hsp = parseFloat(document.getElementById("hsp").value);
  const perdidas = parseFloat(document.getElementById("perdidas").value) / 100;

  const respaldo = tipoSistema === "red"
    ? 0
    : parseFloat(document.getElementById("respaldo").value);

  // Validaciones básicas
  if (isNaN(consumoMensual) || consumoMensual <= 0) {
    mostrarAlerta("El consumo mensual debe ser mayor a cero.", "error");
    return;
  }

  if (isNaN(hsp) || hsp <= 0) {
    mostrarAlerta("Las horas solares pico no son válidas.", "error");
    return;
  }

  // ===============================
  // CÁLCULOS
  // ===============================

  const consumoDiario = consumoMensual / 30;
  const energiaSolarDiaria = consumoDiario * ahorro;
  const potenciaFV = energiaSolarDiaria / (hsp * (1 - perdidas));

  // Selección automática del panel
  let potenciaPanel;
  if (potenciaFV <= 3) potenciaPanel = 450;
  else if (potenciaFV <= 6) potenciaPanel = 550;
  else potenciaPanel = 600;

  const numeroPaneles = Math.ceil((potenciaFV * 1000) / potenciaPanel);
  const potenciaInversor = Math.ceil(potenciaFV * 1.2);

  // Baterías (simplificado)
  let textoBaterias = "No aplica para sistema en red";
  if (tipoSistema !== "red") {
    const energiaRespaldo = energiaSolarDiaria * (respaldo / 24);
    textoBaterias = `Energía de respaldo requerida: ${energiaRespaldo.toFixed(2)} kWh`;
  }

  // ===============================
  // MOSTRAR RESULTADOS
  // ===============================

  document.getElementById("resultados").innerHTML = `
    <p><strong>Consumo diario:</strong> ${consumoDiario.toFixed(2)} kWh/día</p>
    <p><strong>Energía solar requerida:</strong> ${energiaSolarDiaria.toFixed(2)} kWh/día</p>
    <p><strong>Potencia del sistema:</strong> ${potenciaFV.toFixed(2)} kWp</p>
    <p><strong>Panel recomendado:</strong> ${potenciaPanel} W</p>
    <p><strong>Cantidad de paneles:</strong> ${numeroPaneles}</p>
    <p><strong>Inversor recomendado:</strong> ${potenciaInversor} kW</p>
    <p><strong>Baterías:</strong> ${textoBaterias}</p>
  `;

  // ===============================
  // ALERTAS TÉCNICAS
  // ===============================

  let alertas = [];

  if (perdidas < 0.15) {
    alertas.push("Las pérdidas ingresadas son muy bajas para condiciones reales.");
  }

  if (potenciaFV / potenciaInversor < 0.6) {
    alertas.push("El inversor está sobredimensionado respecto al campo FV.");
  }

  if (tipoSistema === "red" && respaldo > 0) {
    alertas.push("En sistemas en red no se recomienda el uso de baterías.");
  }

  if (alertas.length === 0) {
    mostrarAlerta("El sistema está correctamente dimensionado.", "ok");
  } else {
    mostrarAlerta(alertas.join("<br>"), "warning");
  }
}

// ===============================
// FUNCIÓN DE ALERTAS
// ===============================

function mostrarAlerta(mensaje, tipo) {
  const alertasDiv = document.getElementById("alertas");

  let clase = "alerta";
  if (tipo === "error") clase += " error";

  alertasDiv.innerHTML = `<div class="${clase}">${mensaje}</div>`;
}
