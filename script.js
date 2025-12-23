document.addEventListener("DOMContentLoaded", () => {
    controlarRespaldo();
});

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

function calcularSistema() {

    const tipo = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = parseFloat(document.getElementById("respaldo").value || 0);

    if (!consumo || consumo <= 0) {
        alert("Consumo inválido");
        return;
    }

    if ((tipo !== "red") && respaldo <= 0) {
        alert("Indique horas de respaldo");
        return;
    }

    /* ===== ENERGÍA ===== */
    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaFV = energiaReal / horasSol;

    /* ===== PANELES ===== */
    const potenciaPanel = 550;
    const paneles = Math.ceil((potenciaFV * 1000) / potenciaPanel);

    /* ===== INVERSOR ===== */
    let factor = 1.0;
    if (tipo === "hibrido") factor = 1.25;
    if (tipo === "aislado") factor = 1.3;

    const inversorKW = Math.ceil(potenciaFV * factor);

    let mppt = 1;
    if (inversorKW > 3) mppt = 2;
    if (inversorKW > 6) mppt = 3;
    if (inversorKW > 10) mppt = 4;

    let voltajeBanco = "24 V";
    if (inversorKW >= 5) voltajeBanco = "48 V";

    /* ===== TARJETAS ===== */

    document.getElementById("tarjetaEnergia").innerHTML = `
        <h3>Energía</h3>
        <p>Consumo cubierto: ${consumoCubierto.toFixed(1)} kWh/mes</p>
        <p>Consumo diario: ${consumoDiario.toFixed(2)} kWh/día</p>
        <p>Potencia FV requerida: ${potenciaFV.toFixed(2)} kWp</p>
    `;

    document.getElementById("tarjetaPaneles").innerHTML = `
        <h3>Paneles</h3>
        <p>Potencia por panel: ${potenciaPanel} W</p>
        <p>Cantidad de paneles: ${paneles}</p>
    `;

    document.getElementById("tarjetaInversor").innerHTML = `
        <h3>Inversor recomendado</h3>
        <p>Tipo: ${tipo.toUpperCase()}</p>
        <p>Potencia: ${inversorKW} kW</p>
        <p>MPPT recomendados: ${mppt}</p>
        <p>Banco compatible: ${voltajeBanco}</p>
        <p>Factor aplicado: ${factor}</p>
    `;
}

function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    controlarRespaldo();

    document.getElementById("tarjetaEnergia").innerHTML = "";
    document.getElementById("tarjetaPaneles").innerHTML = "";
    document.getElementById("tarjetaInversor").innerHTML = "";
}
