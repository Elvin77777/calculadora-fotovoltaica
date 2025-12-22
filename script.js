document.addEventListener("DOMContentLoaded", function () {
    controlarRespaldo();
    document.getElementById("tipoSistema").addEventListener("change", controlarRespaldo);
});

// Control de horas de respaldo
function controlarRespaldo() {
    const tipo = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo");

    if (tipo === "hibrido" || tipo === "aislado") {
        respaldo.disabled = false;
        respaldo.value = "";
    } else {
        respaldo.disabled = true;
        respaldo.value = "";
    }
}

// Validaciones
function validarFormulario() {
    const consumo = parseFloat(consumoInput());
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const tarifa = parseFloat(document.getElementById("tarifa").value);
    const vidaUtil = parseInt(document.getElementById("vidaUtil").value);

    if (isNaN(consumo) || consumo <= 0) {
        alert("Consumo mensual inválido.");
        return false;
    }

    if (isNaN(ahorro) || ahorro <= 0 || ahorro > 100) {
        alert("Ahorro debe estar entre 1 y 100%.");
        return false;
    }

    if (isNaN(horasSol) || horasSol <= 0) {
        alert("Horas solares inválidas.");
        return false;
    }

    if (isNaN(perdidas) || perdidas < 0 || perdidas > 50) {
        alert("Pérdidas fuera de rango (0–50%).");
        return false;
    }

    if (isNaN(tarifa) || tarifa <= 0) {
        alert("Tarifa eléctrica inválida.");
        return false;
    }

    if (isNaN(vidaUtil) || vidaUtil <= 0) {
        alert("Vida útil inválida.");
        return false;
    }

    const tipo = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo").value;

    if ((tipo === "hibrido" || tipo === "aislado") && respaldo === "") {
        alert("Debe indicar horas de respaldo.");
        return false;
    }

    return true;
}

// Función principal
function calcularSistema() {

    if (!validarFormulario()) return;

    const tipo = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(consumoInput());
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = document.getElementById("respaldo").value;
    const tarifa = parseFloat(document.getElementById("tarifa").value);
    const costoSistema = parseFloat(document.getElementById("costoSistema").value || 0);
    const vidaUtil = parseInt(document.getElementById("vidaUtil").value);

    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaNecesaria = energiaReal / horasSol;

    const potenciaPanel = 550;
    const paneles = Math.ceil((potenciaNecesaria * 1000) / potenciaPanel);

    const ahorroMensual = consumoCubierto * tarifa;
    const ahorroAnual = ahorroMensual * 12;
    const ahorroVidaUtil = ahorroAnual * vidaUtil;

    let payback = costoSistema > 0 ? (costoSistema / ahorroAnual).toFixed(1) : "N/D";

    let html = `
        <h3>Resultados del sistema</h3>
        <p><strong>Tipo de sistema:</strong> ${tipo}</p>
        <p><strong>Potencia requerida:</strong> ${potenciaNecesaria.toFixed(2)} kWp</p>
        <p><strong>Cantidad de paneles:</strong> ${paneles} (${potenciaPanel} W)</p>
        <p><strong>Ahorro anual:</strong> $${ahorroAnual.toFixed(2)}</p>
        <p><strong>Vida útil considerada:</strong> ${vidaUtil} años</p>
        <p><strong>Ahorro total estimado:</strong> $${ahorroVidaUtil.toFixed(2)}</p>
        <p><strong>Payback estimado:</strong> ${payback} años</p>
    `;

    if (tipo !== "red") {
        html += `<p><strong>Horas de respaldo:</strong> ${respaldo} h</p>`;
    }

    document.getElementById("resultados").innerHTML = html;
}

// Limpieza total
function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    document.getElementById("ahorro").value = 90;
    document.getElementById("horasSol").value = 5.5;
    document.getElementById("perdidas").value = 20;
    document.getElementById("tarifa").value = 0.22;
    document.getElementById("vidaUtil").value = 25;

    controlarRespaldo();

    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}

function consumoInput() {
    return document.getElementById("consumo").value;
}
