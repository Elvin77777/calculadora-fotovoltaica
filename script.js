// ===============================
// AL CARGAR LA PÁGINA
// ===============================
document.addEventListener("DOMContentLoaded", function () {
    controlarRespaldo();
    limpiarResultados();
});

// ===============================
// CONTROL DE HORAS DE RESPALDO
// ===============================
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

// ===============================
// VALIDACIÓN DE FORMULARIO
// ===============================
function validarFormulario() {
    const tipoSistema = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = document.getElementById("respaldo").value;

    if (isNaN(consumo) || consumo <= 0) {
        alert("Ingresa un consumo mensual válido (kWh).");
        return false;
    }

    if (isNaN(ahorro) || ahorro <= 0 || ahorro > 100) {
        alert("El ahorro debe estar entre 1 % y 100 %.");
        return false;
    }

    if (isNaN(horasSol) || horasSol <= 0) {
        alert("Ingresa un valor válido de horas solares pico.");
        return false;
    }

    if (isNaN(perdidas) || perdidas < 0 || perdidas > 50) {
        alert("Las pérdidas deben estar entre 0 % y 50 %.");
        return false;
    }

    if ((tipoSistema === "hibrido" || tipoSistema === "aislado") && respaldo === "") {
        alert("Debes indicar las horas de respaldo.");
        return false;
    }

    return true;
}

// ===============================
// CÁLCULO DEL SISTEMA
// ===============================
function calcularSistema() {

    if (!validarFormulario()) {
        return;
    }

    const tipoSistema = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = document.getElementById("respaldo").value;

    // Energía
    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaNecesaria = energiaReal / horasSol;

    // Paneles
    const potenciaPanel = 550;
    const cantidadPaneles = Math.ceil((potenciaNecesaria * 1000) / potenciaPanel);
    const potenciaInstalada = (cantidadPaneles * potenciaPanel) / 1000;

    // Economía
    const tarifa = 0.22;
    const costoSistema = potenciaInstalada * 1100;
    const ahorroMensual = consumoCubierto * tarifa;
    const ahorroAnual = ahorroMensual * 12;
    const vidaUtil = 25;
    const payback = costoSistema / ahorroAnual;
    const roi = (ahorroAnual / costoSistema) * 100;

    let resultado = `
        <div class="resumen">
            <h3>Resumen del sistema propuesto</h3>
            <p>
                El sistema cubrirá aproximadamente el 
                <strong>${ahorro}%</strong> de su consumo eléctrico mensual,
                generando un ahorro estimado de 
                <strong>$${ahorroMensual.toFixed(2)} al mes</strong>.
            </p>
        </div>

        <div class="resultados-grid">

            <div class="card energia">
                <h4>🔋 Sistema solar</h4>
                <p><strong>Tipo:</strong> ${tipoSistema}</p>
                <p><strong>Potencia instalada:</strong> ${potenciaInstalada.toFixed(2)} kWp</p>
                <p><strong>Panel recomendado:</strong> ${potenciaPanel} W</p>
                <p><strong>Cantidad de paneles:</strong> ${cantidadPaneles}</p>
                ${tipoSistema !== "red" ? `<p><strong>Horas de respaldo:</strong> ${respaldo} h</p>` : ""}
            </div>

            <div class="card economia">
                <h4>💰 Ahorro económico</h4>
                <p><strong>Ahorro mensual:</strong> $${ahorroMensual.toFixed(2)}</p>
                <p><strong>Ahorro anual:</strong> $${ahorroAnual.toFixed(2)}</p>
                <p><strong>Costo estimado:</strong> $${costoSistema.toFixed(2)}</p>
                <p><strong>Vida útil:</strong> ${vidaUtil} años</p>
                <p><strong>Ahorro total:</strong> $${(ahorroAnual * vidaUtil).toFixed(2)}</p>
            </div>

            <div class="card retorno">
                <h4>📈 Retorno</h4>
                <p><strong>ROI anual:</strong> ${roi.toFixed(1)} %</p>
                <p><strong>Payback:</strong> ${payback.toFixed(1)} años</p>
            </div>

        </div>
    `;

    document.getElementById("resultados").innerHTML = resultado;
}

// ===============================
// NUEVA COTIZACIÓN
// ===============================
function nuevaCotizacion() {
    document.getElementById("consumo").value = "";
    document.getElementById("ahorro").value = "";
    document.getElementById("horasSol").value = "";
    document.getElementById("perdidas").value = "";
    document.getElementById("respaldo").value = "";

    document.getElementById("tipoSistema").value = "red";
    controlarRespaldo();
    limpiarResultados();
}

// ===============================
// LIMPIAR RESULTADOS
// ===============================
function limpiarResultados() {
    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}
