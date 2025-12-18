// Ejecutar al cargar la página
//document.addEventListener("DOMContentLoaded", function () {
    controlarRespaldo();
});


// Habilita / deshabilita horas de respaldo según el sistema
const respaldoInput = document.getElementById("respaldo");

function controlarRespaldo() {
    const tipoSistema = document.getElementById("tipoSistema").value;
    const respaldoInput = document.getElementById("respaldo");

    if (tipoSistema === "hibrido" || tipoSistema === "aislado") {
        respaldoInput.disabled = false;
        respaldoInput.value = "";
    } else {
        respaldoInput.disabled = true;
        respaldoInput.value = "";
    }
}



// Evento al cambiar tipo de sistema
document.getElementById("tipoSistema").addEventListener("change", actualizarRespaldo);

// Cálculo principal
function calcular() {

  const tipoSistema = document.getElementById("tipoSistema").value;
  const consumoMensual = parseFloat(document.getElementById("consumoMensual").value);
  const ahorro = parseFloat(document.getElementById("ahorro").value);
  const hsp = parseFloat(document.getElementById("hsp").value);
  const perdidas = parseFloat(document.getElementById("perdidas").value);
  const respaldoHoras = tipoSistema === "red"
    ? 0
    : parseFloat(document.getElementById("respaldo").value);

  const alertas = [];
  const resultados = document.getElementById("resultados");
  const alertasDiv = document.getElementById("alertas");

  if (!consumoMensual || consumoMensual <= 0) {
    alert("Ingresa un consumo mensual válido.");
    return;
  }

  const consumoDiario = consumoMensual / 30;
  const consumoObjetivo = consumoDiario * (ahorro / 100);
  const factorPerdidas = 1 - (perdidas / 100);

  const potenciaNecesaria = consumoObjetivo / (hsp * factorPerdidas);

  const potenciaPanel = 550; // recomendación automática
  const numeroPaneles = Math.ceil((potenciaNecesaria * 1000) / potenciaPanel);

  let bateriasTexto = "No aplica (sistema en red)";

  if (tipoSistema !== "red") {
    const energiaRespaldo = (consumoDiario / 24) * respaldoHoras;

    bateriasTexto = `
      Energía de respaldo: ${energiaRespaldo.toFixed(2)} kWh<br>
      Tipo sugerido: Litio (48V)
    `;
  }

  resultados.innerHTML = `
    <strong>Resultados del sistema:</strong><br><br>

    Consumo diario: ${consumoDiario.toFixed(2)} kWh<br>
    Consumo cubierto: ${consumoObjetivo.toFixed(2)} kWh/día<br>
    Potencia FV requerida: ${potenciaNecesaria.toFixed(2)} kWp<br><br>

    Panel recomendado: ${potenciaPanel} W<br>
    Cantidad de paneles: ${numeroPaneles}<br><br>

    Tipo de sistema: ${tipoSistema}<br>
    ${bateriasTexto}
  `;

  if (perdidas > 25) {
    alertas.push("Las pérdidas del sistema son altas.");
  }

  if (hsp < 4) {
    alertas.push("Horas solares bajas para un buen rendimiento.");
  }

  alertasDiv.innerHTML = alertas.length
    ? "<ul><li>" + alertas.join("</li><li>") + "</li></ul>"
    : "<p>Sin alertas técnicas.</p>";
}

// Botón Nueva cotización
function limpiarFormulario() {

  // Reset tipo de sistema
  document.getElementById("tipoSistema").value = "red";

  // Limpiar TODOS los campos
  document.getElementById("consumoMensual").value = "";
  document.getElementById("ahorro").value = "";
  document.getElementById("hsp").value = "";
  document.getElementById("perdidas").value = "";
  document.getElementById("respaldo").value = "";

  // Limpiar resultados y alertas
  document.getElementById("resultados").innerHTML =
    "<p>Introduce los datos y presiona “Calcular sistema”.</p>";

  document.getElementById("alertas").innerHTML = "";

  // Reaplicar lógica del sistema
  actualizarRespaldo();
}








