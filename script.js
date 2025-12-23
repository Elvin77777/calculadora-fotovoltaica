document.addEventListener("DOMContentLoaded", () => {
    controlarRespaldo();
    controlarBaterias();

    document.getElementById("tipoSistema").addEventListener("change", () => {
        controlarRespaldo();
        controlarBaterias();
    });
});

/* =====================================================
   CONTROL DE HORAS DE RESPALDO
===================================================== */
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

/* =====================================================
   CONTROL DEL BLOQUE DE BATERÍAS
===================================================== */
function controlarBaterias() {
    const tipo = document.getElementById("tipoSistema").value;
    const bloque = document.getElementById("bloqueBaterias");

    if (tipo === "hibrido" || tipo === "aislado") {
        bloque.style.display = "block";
    } else {
        bloque.style.display = "none";
    }
}

/* =====================================================
   VALIDACIÓN GENERAL
===================================================== */
function validarFormulario() {
    const consumo = parseFloat(document.getElementById("consumo").value);
    const respaldo = document.getElementById("respaldo").value;

    if (isNaN(consumo) || consumo <= 0) {
        alert("Ingresa un consumo mensual válido.");
        return false;
    }

    const tipo = document.getElementById("tipoSistema").value;
    if ((tipo === "hibrido" || tipo === "aislado") && respaldo === "") {
        alert("Debes indicar las horas de respaldo.");
        return false;
    }
    return true;
}

/* =====================================================
   CÁLCULO PRINCIPAL
===================================================== */
function calcularSistema() {

    if (!validarFormulario()) return;

    /* ===== DATOS GENERALES ===== */
    const tipo = document.getElementById("tipoSistema").value;
    const consumoMensual = parseFloat(document.getElementById("consumo").value); // kWh
    const ahorroPct = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);

    /* ===== CÁLCULO ENERGÉTICO FV (Nivel 1) ===== */
    const consumoCubierto = consumoMensual * (ahorroPct / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaNecesaria = energiaReal / horasSol;

    const potenciaPanel = 550;
    const paneles = Math.ceil((potenciaNecesaria * 1000) / potenciaPanel);

    /* ===== RESULTADO BASE ===== */
    let html = `
        <h3>Resultados del sistema</h3>
        <div class="resultados-grid">
            <div class="card">
                <h4>Potencia requerida</h4>
                <p>${potenciaNecesaria.toFixed(2)} kWp</p>
            </div>
            <div class="card">
                <h4>Paneles</h4>
                <p>${paneles} × ${potenciaPanel} W</p>
            </div>
        </div>
    `;

    /* =====================================================
       NIVEL 2 – CÁLCULO DE BATERÍAS
    ===================================================== */
    if (tipo === "hibrido" || tipo === "aislado") {

        const horasRespaldo = parseFloat(document.getElementById("respaldo").value);
        const tipoBateria = document.getElementById("tipoBateria").value;
        const voltajeBanco = parseInt(document.getElementById("voltajeBanco").value);
        const dod = parseFloat(document.getElementById("dod").value) / 100;
        const eficiencia = parseFloat(document.getElementById("eficienciaBateria").value) / 100;

        /* ----- PARÁMETROS DE BATERÍA POR TIPO ----- */
        let voltajeBateria = 12;
        let capacidadAh = 100;

        if (tipoBateria === "litio") {
            voltajeBateria = 12;
            capacidadAh = 100;
        } else if (tipoBateria === "agm" || tipoBateria === "gel") {
            voltajeBateria = 12;
            capacidadAh = 200;
        } else {
            voltajeBateria = 12;
            capacidadAh = 150;
        }

        /* ----- ENERGÍA A RESPALDAR ----- */
        const energiaRespaldo = consumoDiario * (horasRespaldo / 24); // kWh
        const energiaBanco = energiaRespaldo / (dod * eficiencia); // kWh reales

        /* ----- CAPACIDAD DEL BANCO ----- */
        const capacidadWh = energiaBanco * 1000;
        const capacidadAhBanco = capacidadWh / voltajeBanco;

        /* ----- CONFIGURACIÓN ----- */
        const bateriasSerie = voltajeBanco / voltajeBateria;
        const bateriasParalelo = Math.ceil(capacidadAhBanco / capacidadAh);
        const totalBaterias = bateriasSerie * bateriasParalelo;

        const capacidadTotalBanco =
            (voltajeBanco * capacidadAh * bateriasParalelo) / 1000;

        /* ----- TARJETAS DE BATERÍAS ----- */
        html += `
            <h3>Banco de baterías</h3>
            <div class="resultados-grid">
                <div class="card">
                    <h4>Energía a respaldar</h4>
                    <p>${energiaRespaldo.toFixed(2)} kWh</p>
                </div>
                <div class="card">
                    <h4>Tipo de batería</h4>
                    <p>${tipoBateria.toUpperCase()}</p>
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
                    <h4>Total baterías</h4>
                    <p>${totalBaterias}</p>
                </div>
                <div class="card">
                    <h4>Autonomía estimada</h4>
                    <p>${horasRespaldo} h</p>
                </div>
            </div>
        `;
    }

    document.getElementById("resultados").innerHTML = html;
}

/* =====================================================
   NUEVA COTIZACIÓN
===================================================== */
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

