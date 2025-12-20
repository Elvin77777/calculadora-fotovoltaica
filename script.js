// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    controlarRespaldo();
});

// ===============================
// Habilita / deshabilita respaldo
// ===============================
function controlarRespaldo() {
    const tipoSistema = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo");

    if (tipoSistema === "hibrido" || tipoSistema === "aislado") {
        respaldo.disabled = false;
        respaldo.value = "";
    } else {
        respaldo.disabled = true;
        respaldo.value = "";
    }
}

// ===============================
// Validaciones
// ===============================
function validarFormulario() {
    const tipoSistema = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = document.getElementById("respaldo").value;

    const tarifa = parseFloat(document.getElementById("tarifa").value);
    const precioKwp = parseFloat(document.getElementById("precioKwp").value);
    const vidaUtil = parseInt(document.getElementById("vidaUtil").value);

    if (isNaN(consumo) || consumo <= 0) {
        alert("Ingresa un consumo mensual válido en kWh.");
        return false;
    }

    if (isNaN(ahorro) || ahorro <= 0 || ahorro > 100) {
        alert("El porcentaje de ahorro debe estar entre 1 y 100 %.");
        return false;
    }

    if (isNaN(horasSol) || horasSol <= 0) {
        alert("Ingresa un valor válido de horas solares promedio.");
        return false;
    }

    if (isNaN(perdidas) || perdidas < 0 || perdidas > 50) {
        alert("Las pérdidas deben estar entre 0 y 50 %.");
        return false;
    }

    if ((tipoSistema === "hibrido" || tipoSistema === "aislado") && respaldo === "") {
        alert("Debes indicar las horas de respaldo para sistemas con baterías.");
        return false;
    }

    if (isNaN(tarifa) || tarifa <= 0) {
        alert("Ingresa una tarifa eléctrica válida.");
        return false;
    }

    if (isNaN(precioKwp) || precioKwp <= 0) {
        alert("Ingresa un precio válido por kWp.");
        return false;
    }

    if (isNaN(vidaUtil) || vidaUtil <= 0) {
        alert("Ingresa una vida útil válida del sistema.");
        return false;
    }

    return true;
}

// ===============================
// Cálculo del sistema
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

    const tarifa = parseFloat(document.getElementById("tarifa").value);
    const precioKwp = parseFloat(document.getElementById("precioKwp").value);
    const vidaUtil = parseInt(document.getElementById("vidaUtil").value);

    // ===== ENERGÍA =====
    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaNecesaria = energiaReal / horasSol;

    const potenciaPanel = 550; // W
    const cantidadPaneles = Math.ceil((potenciaNecesaria * 1000) / potenciaPanel);
    const potenciaInstalada = (cantidadPaneles * potenciaPanel) / 1000; // kWp

    // ===== ECONOMÍA =====
    const ahorroMensual = consumoCubierto * tarifa;
    const ahorroAnual = ahorroMensual * 12;
    const costoSistema = potenciaInstalada * precioKwp;

    const roi = (ahorroAnual / costoSistema) * 100;
    const payback = costoSistema / ahorroAnual;

    // ===== RESULTADOS =====
   let resultado = `
    <div class="resumen">
        <h3>Resumen del sistema propuesto</h3>
        <p>
            Este sistema solar cubrirá aproximadamente el 
            <strong>${ahorro}%</strong> de su consumo eléctrico mensual y
            le permitirá ahorrar alrededor de 
            <strong>$${ahorroMensual.toFixed(2)} al mes</strong>.
        </p>
    </div>

    <div class="resultados-grid">

        <div class="card energia">
            <h4>🔋 Sistema solar</h4>
            <p><strong>Tipo de sistema:</strong> ${tipoSistema}</p>
            <p><strong>Tamaño del sistema:</strong> ${potenciaInstalada.toFixed(2)} kWp</p>
            <p><strong>Panel recomendado:</strong> ${potenciaPanel} W</p>
            <p><strong>Cantidad de paneles:</strong> ${cantidadPaneles}</p>
            ${tipoSistema !== "red" ? `<p><strong>Horas de respaldo:</strong> ${respaldo} h</p>` : ""}
        </div>

        <div class="card economia">
            <h4>💰 Ahorro económico</h4>
            <p><strong>Ahorro mensual:</strong> $${ahorroMensual.toFixed(2)}</p>
            <p><strong>Ahorro anual:</strong> $${ahorroAnual.toFixed(2)}</p>
            <p><strong>Costo estimado del sistema:</strong> $${costoSistema.toFixed(2)}</p>
            <p><strong>Vida útil considerada:</strong> ${vidaUtil} años</p>
            <p><strong>Ahorro total estimado:</strong> $${(ahorroAnual * vidaUtil).toFixed(2)}</p>
        </div>

        <div class="card retorno">
            <h4>📈 Retorno de inversión</h4>
            <p><strong>ROI anual:</strong> ${roi.toFixed(1)} %</p>
            <p><strong>Tiempo de recuperación:</strong> ${payback.toFixed(1)} años</p>
        </div>

    </div>
`;



// ===============================
// Nueva cotización
// ===============================
function nuevaCotizacion() {
    document.getElementById("consumo").value = "";
    document.getElementById("ahorro").value = "";
    document.getElementById("horasSol").value = "";
    document.getElementById("perdidas").value = "";
    document.getElementById("respaldo").value = "";
    document.getElementById("tarifa").value = "";
    document.getElementById("precioKwp").value = "";
    document.getElementById("vidaUtil").value = "";

    document.getElementById("tipoSistema").value = "red";

    controlarRespaldo();

    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}







