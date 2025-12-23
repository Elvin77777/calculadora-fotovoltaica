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
    const respaldoHoras = parseFloat(document.getElementById("respaldo").value || 0);

    if (!consumo || consumo <= 0) {
        alert("Consumo inválido");
        return;
    }

    if (tipo !== "red" && respaldoHoras <= 0) {
        alert("Indique horas de respaldo");
        return;
    }

    /* ===== ENERGÍA ===== */
    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaFV = energiaReal / horasSol;

    /* ===== PANELES ===== */
    const potenciaPanel = parseInt(document.getElementById("panelModelo").value);
    const totalPaneles = Math.ceil((potenciaFV * 1000) / potenciaPanel);

    /* ===== INVERSOR ===== */
    let factor = 1;
    if (tipo === "hibrido") factor = 1.25;
    if (tipo === "aislado") factor = 1.3;

    const inversorKW = Math.ceil(potenciaFV * factor);

    let mppt = 1;
    if (inversorKW > 3) mppt = 2;
    if (inversorKW > 6) mppt = 3;
    if (inversorKW > 10) mppt = 4;

    let voltajeBanco = inversorKW >= 5 ? 48 : 24;

    /* ===== BATERÍAS ===== */
    const voltBat = parseInt(document.getElementById("voltajeBateria").value);
    const ahBat = parseInt(document.getElementById("capacidadBateria").value);
    const dod = parseFloat(document.getElementById("dod").value) / 100;

    const energiaRespaldo = (consumoDiario * respaldoHoras) / 24;
    const energiaUtilBat = (voltBat * ahBat) / 1000 * dod;

    const bateriasTotales = Math.ceil(energiaRespaldo / energiaUtilBat);
    const bateriasSerie = voltajeBanco / voltBat;
    const bateriasParalelo = Math.ceil(bateriasTotales / bateriasSerie);

    /* ===== TARJETAS ===== */

    document.getElementById("tarjetaEnergia").innerHTML = `
        <h3>Energía</h3>
        <p>Consumo diario: ${consumoDiario.toFixed(2)} kWh</p>
        <p>Potencia FV: ${potenciaFV.toFixed(2)} kWp</p>
    `;

    document.getElementById("tarjetaPaneles").innerHTML = `
        <h3>Paneles</h3>
        <p>Potencia panel: ${potenciaPanel} W</p>
        <p>Total paneles: ${totalPaneles}</p>
    `;

    document.getElementById("tarjetaInversor").innerHTML = `
        <h3>Inversor</h3>
        <p>Potencia: ${inversorKW} kW</p>
        <p>MPPT: ${mppt}</p>
        <p>Banco recomendado: ${voltajeBanco} V</p>
    `;

    document.getElementById("tarjetaBaterias").innerHTML = `
        <h3>Baterías</h3>
        <p>Total baterías: ${bateriasTotales}</p>
        <p>Serie: ${bateriasSerie}</p>
        <p>Paralelo: ${bateriasParalelo}</p>
        <p>Capacidad: ${voltBat} V / ${ahBat} Ah</p>
        <p>DoD aplicado: ${(dod * 100).toFixed(0)}%</p>
    `;
}

function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    controlarRespaldo();

    document.querySelectorAll(".tarjeta").forEach(t => t.innerHTML = "");
}

