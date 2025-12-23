document.addEventListener("DOMContentLoaded", () => {
    controlarRespaldo();
    controlarBaterias();

    document.getElementById("tipoSistema").addEventListener("change", () => {
        controlarRespaldo();
        controlarBaterias();
    });
});

/* =========================
   CONTROL RESPALDO
========================= */
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

/* =========================
   CONTROL BLOQUE BATERÍAS
========================= */
function controlarBaterias() {
    const tipo = document.getElementById("tipoSistema").value;
    const bloque = document.getElementById("bloqueBaterias");

    bloque.style.display =
        (tipo === "hibrido" || tipo === "aislado") ? "block" : "none";
}

/* =========================
   VALIDACIÓN
========================= */
function validarFormulario() {
    const consumo = parseFloat(document.getElementById("consumo").value);
    if (isNaN(consumo) || consumo <= 0) {
        alert("Ingresa un consumo mensual válido.");
        return false;
    }

    const tipo = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo").value;

    if ((tipo === "hibrido" || tipo === "aislado") && respaldo === "") {
        alert("Debes indicar las horas de respaldo.");
        return false;
    }
    return true;
}

/* =========================
   CÁLCULO PRINCIPAL
========================= */
function calcularSistema() {

    if (!validarFormulario()) return;

    const tipo = document.getElementById("tipoSistema").value;

    /* ===== DATOS BASE ===== */
    const consumoMensual = parseFloat(document.getElementById("consumo").value);
    const ahorroPct = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);

    /* ===== CÁLCULO FV ===== */
    const consumoCubierto = consumoMensual * (ahorroPct / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaFV = energiaReal / horasSol; // kWp

    const potenciaPanel = 550;
    const paneles = Math.ceil((potenciaFV * 1000) / potenciaPanel);

    /* ===== FACTOR SEGÚN SISTEMA ===== */
    let factorInversor = 1.0;
    let tipoInversor = "";

    if (tipo === "red") {
        factorInversor = 1.20;
        tipoInversor = "On-grid";
    }
    if (tipo === "hibrido") {
        factorInversor = 1.15;
        tipoInversor = "Híbrido";
    }
    if (tipo === "aislado") {
        factorInversor = 1.00;
        tipoInversor = "Off-grid";
    }

    /* ===== INVERSOR ===== */
    const potenciaInversor = potenciaFV / factorInversor;
    const potenciaInversorRedondeada = Math.ceil(potenciaInversor * 2) / 2;

    /* ===== RESULTADOS BASE ===== */
    let html = `
        <h3>Resultados del sistema</h3>
        <div class="resultados-grid">
            <div class="card">
                <h4>Potencia FV requerida</h4>
                <p>${potenciaFV.toFixed(2)} kWp</p>
            </div>
            <div class="card">
                <h4>Paneles solares</h4>
                <p>${paneles} × ${potenciaPanel} W</p>
            </div>
            <div class="card">
                <h4>Tipo de inversor</h4>
                <p>${tipoInversor}</p>
            </div>
            <div class="card">
                <h4>Potencia del inversor</h4>
                <p>${potenciaInversorRedondeada.toFixed(1)} kW</p>
            </div>
        </div>
    `;

    /* =========================
       NIVEL 2 – BATERÍAS
    ========================= */
    if (tipo === "hibrido" || tipo === "aislado") {

        const horasRespaldo = parseFloat(document.getElementById("respaldo").value);
        const tipoBateria = document.getElementById("tipoBateria").value;
        const voltajeBanco = parseInt(document.getElementById("voltajeBanco").value);
        const dod = parseFloat(document.getElementById("dod").value) / 100;
        const eficiencia = parseFloat(document.getElementById("eficienciaBateria").value) / 100;

        let voltajeBateria = 12;
        let capacidadAh = 100;

        if (tipoBateria === "litio") capacidadAh = 100;
        if (tipoBateria === "agm" || tipoBateria === "gel") capacidadAh = 200;
        if (tipoBateria === "plomo") capacidadAh = 150;

        const energiaRespaldo = consumoDiario * (horasRespaldo / 24);
        const energiaBanco = energiaRespaldo / (dod * eficiencia);

        const capacidadWh = energiaBanco * 1000;
        const capacidadAhBanco = capacidadWh / voltajeBanco;

        const bateriasSerie = voltajeBanco / voltajeBateria;
        const bateriasParalelo = Math.ceil(capacidadAhBanco / capacidadAh);
        const totalBaterias = bateriasSerie * bateriasParalelo;

        const capacidadTotalBanco =
            (voltajeBanco * capacidadAh * bateriasParalelo) / 1000;

        html += `
            <h3>Banco de baterías</h3>
            <div class="resultados-grid">
                <div class="card">
                    <h4>Energía a respaldar</h4>
                    <p>${energiaRespaldo.toFixed(2)} kWh</p>
                </div>
                <div class="card">
                    <h4>Banco</h4>
                    <p>${voltajeBanco} V / ${capacidadTotalBanco.toFixed(2)} kWh</p>
                </div>
                <div class="card">
                    <h4>Configuración</h4>
                    <p>${bateriasSerie}S × ${bateriasParalelo}P</p>
                </div>
                <div class="card">
                    <h4>Total de baterías</h4>
                    <p>${totalBaterias}</p>
                </div>
            </div>
        `;
    }

    document.getElementById("resultados").innerHTML = html;
}

/* =========================
   NUEVA COTIZACIÓN
========================= */
function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.querySelectorAll("select").forEach(s => s.selectedIndex = 0);

    document.getElementById("ahorro").value = 90;
    document.getElementById("horasSol").value = 5.5;
    document.getElementById("perdidas").value = 20;
    document.getElementById("voltajeBanco").value = 24;
    document.getElementById("dod").value = 80;
    document.getElementById("eficienciaBateria").value = 95;

    controlarRespaldo();
    controlarBaterias();

    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}

