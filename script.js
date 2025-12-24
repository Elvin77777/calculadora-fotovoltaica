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

    /* ================= ENERGÍA ================= */

    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const consumoAnual = consumoCubierto * 12;

    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaFV = energiaReal / horasSol;

    const produccionMensual = energiaReal * 30;
    const margenEnergetico = ((produccionMensual - consumoCubierto) / consumoCubierto) * 100;

    let energiaRespaldo = 0;
    if (tipo !== "red") {
        energiaRespaldo = (consumoDiario * respaldoHoras) / 24;
    }

    /* ================= PANELES ================= */

    const potenciaPanel = parseInt(document.getElementById("panelModelo").value);
    const totalPaneles = Math.ceil((potenciaFV * 1000) / potenciaPanel);
    const potenciaInstalada = (totalPaneles * potenciaPanel) / 1000;

    const produccionPorPanel = produccionMensual / totalPaneles;

    // Configuración eléctrica (estimada)
    const voltajePanel = 41; // Vmp típico genérico
    let panelesSerie = 1;

    if (potenciaInstalada <= 3) panelesSerie = 4;
    else if (potenciaInstalada <= 6) panelesSerie = 6;
    else panelesSerie = 8;

    const panelesParalelo = Math.ceil(totalPaneles / panelesSerie);
    const voltajeString = panelesSerie * voltajePanel;

    /* ================= INVERSOR ================= */

    let factor = 1;
    if (tipo === "hibrido") factor = 1.25;
    if (tipo === "aislado") factor = 1.3;

    const inversorKW = Math.ceil(potenciaFV * factor);

    let mppt = 1;
    if (inversorKW > 3) mppt = 2;
    if (inversorKW > 6) mppt = 3;
    if (inversorKW > 10) mppt = 4;

    const voltajeBanco = inversorKW >= 5 ? 48 : 24;

    /* ================= BATERÍAS ================= */

    let bateriasTotales = 0;
    let bateriasSerie = 0;
    let bateriasParalelo = 0;

    if (tipo !== "red") {
        const voltBat = 12;
        const ahBat = 200;
        const dod = 0.8;

        const energiaUtilBat = (voltBat * ahBat) / 1000 * dod;
        bateriasTotales = Math.ceil(energiaRespaldo / energiaUtilBat);
        bateriasSerie = voltajeBanco / voltBat;
        bateriasParalelo = Math.ceil(bateriasTotales / bateriasSerie);
    }

    /* ================= TARJETAS ================= */

    document.getElementById("tarjetaEnergia").innerHTML = `
        <h3>Energía del sistema</h3>
        <p>Consumo mensual: ${consumo.toFixed(1)} kWh</p>
        <p>Consumo diario: ${consumoDiario.toFixed(2)} kWh/día</p>
        <p>Energía cubierta: ${consumoCubierto.toFixed(1)} kWh/mes</p>
        <p>Energía anual cubierta: ${consumoAnual.toFixed(0)} kWh/año</p>
        <p>Producción estimada: ${produccionMensual.toFixed(1)} kWh/mes</p>
        <p>Pérdidas consideradas: ${perdidas}%</p>
        <p>Margen energético: ${margenEnergetico.toFixed(1)}%</p>
        ${tipo !== "red" ? `<p>Energía de respaldo: ${energiaRespaldo.toFixed(2)} kWh</p>` : ""}
    `;

    document.getElementById("tarjetaPaneles").innerHTML = `
        <h3>Paneles solares</h3>
        <p>Potencia del panel: ${potenciaPanel} W</p>
        <p>Cantidad de paneles: ${totalPaneles}</p>
        <p>Potencia total instalada: ${potenciaInstalada.toFixed(2)} kWp</p>
        <p>Producción estimada por panel: ${produccionPorPanel.toFixed(1)} kWh/mes</p>
        <p>Configuración eléctrica:</p>
        <ul>
            <li>Paneles en serie: ${panelesSerie}</li>
            <li>Paneles en paralelo: ${panelesParalelo}</li>
            <li>Voltaje estimado del string: ${voltajeString.toFixed(0)} V</li>
        </ul>
        <p>Sistema modular y ampliable</p>
    `;

    document.getElementById("tarjetaInversor").innerHTML = `
        <h3>Inversor recomendado</h3>
        <p>Potencia: ${inversorKW} kW</p>
        <p>MPPT recomendados: ${mppt}</p>
        <p>Banco compatible: ${voltajeBanco} V</p>
    `;

    document.getElementById("tarjetaBaterias").innerHTML = `
        <h3>Baterías</h3>
        ${tipo === "red"
            ? "<p>No aplica para sistema en red</p>"
            : `
            <p>Total de baterías: ${bateriasTotales}</p>
            <p>Serie: ${bateriasSerie}</p>
            <p>Paralelo: ${bateriasParalelo}</p>
            <p>Banco: ${voltajeBanco} V</p>
        `}
    `;
}

function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    controlarRespaldo();
    document.querySelectorAll(".tarjeta").forEach(t => t.innerHTML = "");
}
