document.addEventListener("DOMContentLoaded", () => {
    controlarRespaldo();
    controlarBaterias();
});

/* ---------------------------
   CONTROL VISUAL
--------------------------- */
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

function controlarBaterias() {
    const tipo = document.getElementById("tipoSistema").value;
    const bloque = document.getElementById("bloqueBaterias");

    bloque.style.display = (tipo === "hibrido" || tipo === "aislado") ? "block" : "none";
}

/* ---------------------------
   CONFIGURACIÓN BATERÍA
--------------------------- */
function actualizarBateria() {
    const tipo = document.getElementById("tipoBateria").value;
    const dod = document.getElementById("dodBateria");

    if (tipo === "litio") dod.value = 90;
    if (tipo === "agm") dod.value = 50;
    if (tipo === "gel") dod.value = 60;
    if (tipo === "plomo") dod.value = 50;
}

/* ---------------------------
   VALIDACIÓN
--------------------------- */
function validarFormulario() {
    const consumo = document.getElementById("consumo").value;
    if (!consumo || consumo <= 0) {
        alert("Ingrese un consumo mensual válido.");
        return false;
    }
    return true;
}

/* ---------------------------
   CÁLCULO PRINCIPAL
--------------------------- */
function calcularSistema() {
    if (!validarFormulario()) return;

    const tipoSistema = document.getElementById("tipoSistema").value;
    const consumoMensual = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldoHoras = tipoSistema === "red" ? 0 : parseFloat(document.getElementById("respaldo").value);

    /* ENERGÍA */
    const consumoCubierto = consumoMensual * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaFV = energiaReal / horasSol;

    /* PANELES */
    const potenciaPanel = 550;
    const vmpPanel = 41;
    const totalPaneles = Math.ceil((potenciaFV * 1000) / potenciaPanel);
    const panelesSerie = Math.floor(350 / vmpPanel);
    const panelesParalelo = Math.ceil(totalPaneles / panelesSerie);

    /* INVERSOR */
    let factor = 1.1;
    if (tipoSistema === "hibrido") factor = 1.25;
    if (tipoSistema === "aislado") factor = 1.4;

    const potenciaInversor = potenciaFV * factor;
    const opciones = [3, 5, 8, 10, 15];
    const inversor = opciones.find(v => v >= potenciaInversor) || 20;

    /* BATERÍAS */
    let tarjetaBateria = "";

    if (tipoSistema !== "red") {
        const voltajeBat = parseFloat(document.getElementById("voltajeBateria").value);
        const capacidadBat = parseFloat(document.getElementById("capacidadBateria").value);
        const dod = parseFloat(document.getElementById("dodBateria").value) / 100;

        const energiaBat = voltajeBat * capacidadBat;
        const energiaUtilBat = energiaBat * dod;
        const energiaRespaldo = consumoDiario * respaldoHoras * 1000;

        let voltajeBanco = inversor > 5 ? 48 : 24;
        const serie = voltajeBanco / voltajeBat;
        const totalBaterias = Math.ceil(energiaRespaldo / energiaUtilBat);
        const paralelo = Math.ceil(totalBaterias / serie);

        tarjetaBateria = `
        <div class="card">
            <h3>🔋 Banco de baterías</h3>
            <p>Batería individual: ${voltajeBat} V / ${capacidadBat} Ah</p>
            <p>Profundidad de descarga: ${dod * 100} %</p>
            <p>Banco recomendado: ${voltajeBanco} V</p>
            <p>Configuración: ${serie} en serie × ${paralelo} en paralelo</p>
            <p>Total de baterías: ${serie * paralelo}</p>
        </div>`;
    }

    /* RESULTADOS */
    document.getElementById("resultados").innerHTML = `
    <div class="cards">
        <div class="card">
            <h3>🔆 Paneles</h3>
            <p>Total: ${totalPaneles}</p>
            <p>${panelesSerie} en serie × ${panelesParalelo} en paralelo</p>
        </div>

        <div class="card">
            <h3>⚡ Inversor</h3>
            <p>Potencia recomendada: ${inversor} kW</p>
        </div>

        ${tarjetaBateria}
    </div>`;
}

/* ---------------------------
   NUEVA COTIZACIÓN
--------------------------- */
function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    controlarRespaldo();
    controlarBaterias();
    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}
