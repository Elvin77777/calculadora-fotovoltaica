// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    controlarRespaldo();
});

function calcularSistema() {

    if (!validarFormulario()) {
        return;
    }




    // 👇 aquí sigue tu cálculo normal


// Habilita / deshabilita horas de respaldo según el sistema
const respaldoInput = document.getElementById("respaldo");

// Controla el campo de horas de respaldo
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

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    controlarRespaldo();
});

// Cálculo del sistema
function calcularSistema() {
    const tipoSistema = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = document.getElementById("respaldo").value;

    if (!consumo || consumo <= 0) {
        alert("Ingrese un consumo mensual válido.");
        return;
    }

    if ((tipoSistema === "hibrido" || tipoSistema === "aislado") && respaldo === "") {
        alert("Ingrese las horas de respaldo para sistemas híbridos o aislados.");
        return;
    }


        function validarFormulario() {
    const tipoSistema = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = document.getElementById("respaldo").value;

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

    return true;
}
    

    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;

    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaNecesaria = energiaReal / horasSol;

    const potenciaPanel = 550; // recomendación automática
    const cantidadPaneles = Math.ceil((potenciaNecesaria * 1000) / potenciaPanel);

    let resultado = `
        <h3>Resultado del sistema</h3>
        <p><strong>Tipo de sistema:</strong> ${tipoSistema}</p>
        <p><strong>Consumo cubierto:</strong> ${consumoCubierto.toFixed(1)} kWh/mes</p>
        <p><strong>Consumo diario:</strong> ${consumoDiario.toFixed(2)} kWh/día</p>
        <p><strong>Potencia necesaria:</strong> ${potenciaNecesaria.toFixed(2)} kWp</p>
        <p><strong>Panel recomendado:</strong> ${potenciaPanel} W</p>
        <p><strong>Cantidad de paneles:</strong> ${cantidadPaneles}</p>
    `;

    if (tipoSistema !== "red") {
        resultado += `<p><strong>Horas de respaldo:</strong> ${respaldo} h</p>`;
    }

    document.getElementById("resultados").innerHTML = resultado;
}

// Limpia todos los datos
function nuevaCotizacion() {
    // Limpiar campos de entrada
    document.getElementById("consumo").value = "";
    document.getElementById("ahorro").value = "";
    document.getElementById("horasSol").value = "";
    document.getElementById("perdidas").value = "";
    document.getElementById("respaldo").value = "";

    // Reiniciar tipo de sistema
    document.getElementById("tipoSistema").value = "red";

    // Aplicar correctamente la lógica de habilitar/deshabilitar
    controlarRespaldo();

    // Limpiar resultados
    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}

















