document.addEventListener("DOMContentLoaded", controlarRespaldo);

function controlarRespaldo() {
    const tipo = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo");

    respaldo.disabled = tipo === "red";
    respaldo.value = "";
}

function calcularSistema() {

    const tipo = document.getElementById("tipoSistema").value;
    const consumo = Number(document.getElementById("consumo").value);
    const ahorro = Number(document.getElementById("ahorro").value);
    const horasSol = Number(document.getElementById("horasSol").value);
    const perdidas = Number(document.getElementById("perdidas").value);
    const respaldoHoras = Number(document.getElementById("respaldo").value || 0);

    const tipoBat = document.getElementById("tipoBateria").value;
    const voltBat = Number(document.getElementById("voltajeBateria").value);
    const ahBat = Number(document.getElementById("capacidadAh").value);
    const dod = Number(document.getElementById("dod").value) / 100;

    /* ================= ENERGÍA ================= */

    const consumoCubierto = consumo * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaFV = energiaReal / horasSol;

    /* ================= INVERSOR ================= */

    let bancoRecomendado = potenciaFV <= 3 ? 12 : potenciaFV <= 6 ? 24 : 48;

    /* ================= BATERÍAS ================= */

    const energiaRespaldo = consumoDiario * (respaldoHoras / 24); // kWh
    const energiaUtilBat = (voltBat * ahBat * dod) / 1000;

    const bateriasTotales = energiaRespaldo > 0
        ? Math.ceil(energiaRespaldo / energiaUtilBat)
        : 0;

    const bateriasSerie = bancoRecomendado / voltBat;
    const bateriasParalelo = bateriasSerie > 0
        ? Math.ceil(bateriasTotales / bateriasSerie)
        : 0;

    const autonomiaReal = bateriasTotales * energiaUtilBat / consumoDiario * 24;

    /* ================= TARJETA BATERÍAS ================= */

    document.getElementById("tarjetaBaterias").innerHTML = `
        <h3>Baterías</h3>
        <p>Total: ${bateriasTotales}</p>
        <p>Configuración: ${bateriasSerie}S / ${bateriasParalelo}P</p>
        <p>Autonomía real: ${autonomiaReal.toFixed(1)} h</p>
    `;

    /* ================= ALERTAS FASE 3 ================= */

    let alertas = "";

    if (voltBat !== bancoRecomendado && tipo !== "red") {
        alertas += `
        <p class="alerta-amarilla">
            ⚠ Voltaje de batería no recomendado.<br>
            <small>Sugerencia: use banco de ${bancoRecomendado}V para mejorar eficiencia y reducir corriente.</small>
        </p>`;
    }

    if (bateriasParalelo > 4) {
        alertas += `
        <p class="alerta-roja">
            ❌ Demasiados paralelos en baterías.<br>
            <small>Sugerencia: aumente voltaje del banco o use baterías de mayor capacidad.</small>
        </p>`;
    }

    if (autonomiaReal < respaldoHoras * 0.9 && tipo !== "red") {
        alertas += `
        <p class="alerta-roja">
            ❌ Autonomía insuficiente.<br>
            <small>Sugerencia: aumente número de baterías o capacidad Ah.</small>
        </p>`;
    }

    if (tipoBat === "plomo" && dod > 0.6) {
        alertas += `
        <p class="alerta-amarilla">
            ⚠ DoD elevado para plomo-ácido.<br>
            <small>Sugerencia: limite DoD al 50–60% para mayor vida útil.</small>
        </p>`;
    }

    if (bateriasTotales > 0 && bateriasTotales < bateriasSerie) {
        alertas += `
        <p class="alerta-roja">
            ❌ Banco incompleto.<br>
            <small>Sugerencia: complete al menos una serie completa de baterías.</small>
        </p>`;
    }

    document.getElementById("tarjetaAlertas").innerHTML = `
        <h3>Alertas técnicas</h3>
        ${alertas || "<p>✔ Banco de baterías técnicamente correcto.</p>"}
    `;
}

function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    controlarRespaldo();
    document.querySelectorAll(".tarjeta").forEach(t => t.innerHTML = "");
}
