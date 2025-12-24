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
        alert("Ingrese un consumo mensual válido.");
        return;
    }

    if (tipo !== "red" && respaldoHoras <= 0) {
        alert("Indique las horas de respaldo.");
        return;
    }

    /* ===== ENERGÍA ===== */

    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const consumoAnual = consumoCubierto * 12;

    const energiaIdeal = consumoDiario;
    const energiaReal = energiaIdeal / (1 - perdidas / 100);

    const potenciaFV = energiaReal / horasSol;
    const produccionMensualEstimada = energiaReal * 30;

    const margenEnergetico = ((produccionMensualEstimada - consumoCubierto) / consumoCubierto) * 100;

    let energiaRespaldo = 0;
    if (tipo !== "red") {
        energiaRespaldo = (consumoDiario * respaldoHoras) / 24;
    }

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

    const voltajeBanco = inversorKW >= 5 ? 48 : 24;

    /* ===== BATERÍAS ===== */

    const voltBat = parseInt(document.getElementById("voltajeBateria").value);
    const ahBat = parseInt(document.getElementById("capacidadBateria").value);
    const dod = parseFloat(document.getElementById("dod").value) / 100;

    let bateriasTotales = 0;
    let bateriasSerie = 0;
    let bateriasParalelo = 0;

    if (tipo !== "red") {
        const energiaUtilBat = (voltBat * ahBat) / 1000 * dod;
        bateriasTotales = Math.ceil(energiaRespaldo / energiaUtilBat);
        bateriasSerie = voltajeBanco / voltBat;
        bateriasParalelo = Math.ceil(bateriasTotales / bateriasSerie);
    }

    /* ===== TARJETAS ===== */

    document.getElementById("tarjetaEnergia").innerHTML = `
        <h3>Energía del sistema</h3>
        <p>Consumo mensual: ${consumo.toFixed(1)} kWh</p>
        <p>Consumo diario promedio: ${consumoDiario.toFixed(2)} kWh/día</p>
        <p>Ahorro objetivo: ${ahorro}%</p>
        <p>Energía cubierta: ${consumoCubierto.toFixed(1)} kWh/mes</p>
        <p>Energía anual cubierta: ${consumoAnual.toFixed(0)} kWh/año</p>
        <p>Producción solar estimada: ${produccionMensualEstimada.toFixed(1)} kWh/mes</p>
        <p>Pérdidas consideradas: ${perdidas}%</p>
        <p>Margen energético: ${margenEnergetico.toFixed(1)}%</p>
        ${tipo !== "red" ? `<p>Energía para respaldo: ${energiaRespaldo.toFixed(2)} kWh</p>` : ""}
    `;

    document.getElementById("tarjetaPaneles").innerHTML = `
        <h3>Paneles solares</h3>
        <p>Potencia del panel: ${potenciaPanel} W</p>
        <p>Total de paneles: ${totalPaneles}</p>
    `;

    document.getElementById("tarjetaInversor").innerHTML = `
        <h3>Inversor recomendado</h3>
        <p>Potencia: ${inversorKW} kW</p>
        <p>MPPT: ${mppt}</p>
        <p>Banco compatible: ${voltajeBanco} V</p>
    `;

    document.getElementById("tarjetaBaterias").innerHTML = `
        <h3>Baterías</h3>
        ${tipo === "red" ? "<p>No aplica</p>" : `
            <p>Total baterías: ${bateriasTotales}</p>
            <p>Serie: ${bateriasSerie}</p>
            <p>Paralelo: ${bateriasParalelo}</p>
            <p>Capacidad: ${voltBat} V / ${ahBat} Ah</p>
            <p>DoD aplicado: ${(dod * 100).toFixed(0)}%</p>
        `}
    `;
}

function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    controlarRespaldo();
    document.querySelectorAll(".tarjeta").forEach(t => t.innerHTML = "");
}
