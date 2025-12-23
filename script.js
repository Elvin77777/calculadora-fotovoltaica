document.addEventListener("DOMContentLoaded", () => {
    controlarRespaldo();
    controlarBaterias();
});

/* =========================
   CONTROL VISUAL
========================= */
function controlarRespaldo() {
    const tipo = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo");

    respaldo.disabled = !(tipo === "hibrido" || tipo === "aislado");
    respaldo.value = "";
}

function controlarBaterias() {
    const tipo = document.getElementById("tipoSistema").value;
    document.getElementById("bloqueBaterias").style.display =
        (tipo === "hibrido" || tipo === "aislado") ? "block" : "none";
}

/* =========================
   CONFIGURACIÓN BATERÍAS
========================= */
function actualizarBateria() {
    const tipo = document.getElementById("tipoBateria").value;
    const dod = document.getElementById("dodBateria");

    if (tipo === "litio") dod.value = 90;
    if (tipo === "agm") dod.value = 50;
    if (tipo === "gel") dod.value = 60;
    if (tipo === "plomo") dod.value = 50;
}

/* =========================
   CÁLCULO PRINCIPAL
========================= */
function calcularSistema() {

    const consumoMensual = parseFloat(document.getElementById("consumo").value);
    if (!consumoMensual || consumoMensual <= 0) {
        alert("Ingrese un consumo mensual válido.");
        return;
    }

    const tipoSistema = document.getElementById("tipoSistema").value;
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldoHoras = tipoSistema === "red" ? 0 : parseFloat(document.getElementById("respaldo").value || 0);

    /* ===== ENERGÍA ===== */
    const consumoCubierto = consumoMensual * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const consumoHora = consumoDiario / 24;
    const energiaRespaldo = consumoHora * respaldoHoras;

    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaFV = energiaReal / horasSol;

    /* ===== MODELOS DE PANELES ===== */
    const modelosPanel = {
        450: { potencia: 450, vmp: 41, imp: 10.9 },
        550: { potencia: 550, vmp: 41, imp: 13.4 },
        600: { potencia: 600, vmp: 42, imp: 14.3 }
    };

    const modeloSeleccionado = document.getElementById("modeloPanel").value;
    const panel = modelosPanel[modeloSeleccionado];

    const totalPaneles = Math.ceil((potenciaFV * 1000) / panel.potencia);
    const panelesSerie = Math.floor(350 / panel.vmp);
    const panelesParalelo = Math.ceil(totalPaneles / panelesSerie);

    /* ===== INVERSOR ===== */
    let factor = 1.1;
    if (tipoSistema === "hibrido") factor = 1.25;
    if (tipoSistema === "aislado") factor = 1.4;

    const potenciaInversor = potenciaFV * factor;
    const inversor = [3, 5, 8, 10, 15].find(v => v >= potenciaInversor) || 20;

    /* ===== BATERÍAS ===== */
    let tarjetaBateria = "";

    if (tipoSistema !== "red") {
        const voltajeBat = parseFloat(document.getElementById("voltajeBateria").value);
        const capacidadBat = parseFloat(document.getElementById("capacidadBateria").value);
        const dod = parseFloat(document.getElementById("dodBateria").value) / 100;

        const energiaBatWh = voltajeBat * capacidadBat;
        const energiaUtilWh = energiaBatWh * dod;
        const energiaRespaldoWh = energiaRespaldo * 1000;

        const voltajeBanco = inversor > 5 ? 48 : 24;
        const serie = voltajeBanco / voltajeBat;
        const totalBat = Math.ceil(energiaRespaldoWh / energiaUtilWh);
        const paralelo = Math.ceil(totalBat / serie);

        tarjetaBateria = `
        <div class="card">
            <h3>🔋 Banco de baterías</h3>
            <p>Batería: ${voltajeBat} V / ${capacidadBat} Ah</p>
            <p>Banco recomendado: ${voltajeBanco} V</p>
            <p>${serie} en serie × ${paralelo} en paralelo</p>
            <p>Total: ${serie * paralelo} baterías</p>
        </div>`;
    }

    /* ===== RESULTADOS ===== */
    document.getElementById("resultados").innerHTML = `
    <div class="cards">
        <div class="card">
            <h3>🔆 Paneles solares</h3>
            <p>Modelo: ${panel.potencia} W</p>
            <p>Voltaje (Vmp): ${panel.vmp} V</p>
            <p>Corriente (Imp): ${panel.imp} A</p>
            <p>Total: ${totalPaneles} paneles</p>
            <p>${panelesSerie} en serie × ${panelesParalelo} en paralelo</p>
            <p>Potencia instalada: ${(totalPaneles * panel.potencia / 1000).toFixed(2)} kWp</p>
        </div>

        <div class="card">
            <h3>⚡ Inversor</h3>
            <p>Potencia recomendada: ${inversor} kW</p>
        </div>

        ${tarjetaBateria}
    </div>`;
}

/* =========================
   NUEVA COTIZACIÓN
========================= */
function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    controlarRespaldo();
    controlarBaterias();
    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}
