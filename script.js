/************************************************
 * INICIALIZACIÓN
 ************************************************/
document.addEventListener("DOMContentLoaded", () => {
    controlarRespaldo();
});

/************************************************
 * CONTROL DE HORAS DE RESPALDO
 ************************************************/
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

/************************************************
 * VALIDACIÓN GENERAL
 ************************************************/
function validarFormulario() {
    const consumo = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const tipoSistema = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo").value;

    if (isNaN(consumo) || consumo <= 0) {
        alert("Ingresa un consumo mensual válido (kWh).");
        return false;
    }

    if (isNaN(ahorro) || ahorro <= 0 || ahorro > 100) {
        alert("El ahorro debe estar entre 1 y 100 %.");
        return false;
    }

    if (isNaN(horasSol) || horasSol <= 0) {
        alert("Horas solares inválidas.");
        return false;
    }

    if (isNaN(perdidas) || perdidas < 0 || perdidas > 50) {
        alert("Las pérdidas deben estar entre 0 y 50 %.");
        return false;
    }

    if ((tipoSistema === "hibrido" || tipoSistema === "aislado") && respaldo === "") {
        alert("Indica las horas de respaldo.");
        return false;
    }

    return true;
}

/************************************************
 * FUNCIÓN PRINCIPAL
 ************************************************/
function calcularSistema() {

    if (!validarFormulario()) return;

    // ENTRADAS
    const tipoSistema = document.getElementById("tipoSistema").value;
    const consumoMensual = parseFloat(document.getElementById("consumo").value);
    const ahorro = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldoHoras = tipoSistema === "red" ? 0 : parseFloat(document.getElementById("respaldo").value);

    /************************************************
     * CÁLCULO ENERGÉTICO
     ************************************************/
    const consumoCubierto = consumoMensual * (ahorro / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaFV = energiaReal / horasSol; // kWp

    /************************************************
     * PANELES SOLARES (MODELO RECOMENDADO)
     ************************************************/
    const panel = {
        potencia: 550,   // W
        vmp: 41,         // V
        imp: 13.4        // A
    };

    const totalPaneles = Math.ceil((potenciaFV * 1000) / panel.potencia);
    const panelesSerie = Math.floor(350 / panel.vmp);
    const panelesParalelo = Math.ceil(totalPaneles / panelesSerie);

    /************************************************
     * INVERSOR – FACTOR SEGÚN SISTEMA
     ************************************************/
    let factorInversor = 1.1;

    if (tipoSistema === "hibrido") factorInversor = 1.25;
    if (tipoSistema === "aislado") factorInversor = 1.4;

    const potenciaInversor = potenciaFV * factorInversor;

    // Redondeo comercial
    const inversorComercial = [3, 5, 8, 10, 15].find(v => v >= potenciaInversor) || 20;

    /************************************************
     * BATERÍAS (SOLO HÍBRIDO / AISLADO)
     ************************************************/
    let bateriaHTML = "";

    if (tipoSistema !== "red") {

        // Batería base (editable luego)
        const bateria = {
            voltaje: 12,      // V
            capacidad: 100,   // Ah
            dod: 0.9          // 90 %
        };

        const energiaPorBateria = bateria.voltaje * bateria.capacidad; // Wh
        const energiaUtilBateria = energiaPorBateria * bateria.dod;

        const energiaRespaldo = consumoDiario * respaldoHoras; // Wh
        const totalBateriasNecesarias = Math.ceil(energiaRespaldo / energiaUtilBateria);

        // RECOMENDACIÓN DE BANCO
        let voltajeBanco = 24;
        if (inversorComercial > 5) voltajeBanco = 48;

        const bateriasSerie = voltajeBanco / bateria.voltaje;
        const bateriasParalelo = Math.ceil(totalBateriasNecesarias / bateriasSerie);
        const totalBaterias = bateriasSerie * bateriasParalelo;

        bateriaHTML = `
        <div class="card">
            <h3>🔋 Banco de baterías</h3>
            <p><strong>Tipo:</strong> Litio (editable)</p>
            <p><strong>Batería individual:</strong> ${bateria.voltaje} V / ${bateria.capacidad} Ah</p>
            <p><strong>Profundidad de descarga:</strong> ${bateria.dod * 100} %</p>
            <p><strong>Voltaje del banco recomendado:</strong> ${voltajeBanco} V</p>
            <p><strong>Configuración:</strong> ${bateriasSerie} en serie × ${bateriasParalelo} en paralelo</p>
            <p><strong>Total de baterías:</strong> ${totalBaterias}</p>
        </div>`;
    }

    /************************************************
     * RESULTADOS VISUALES (TARJETAS)
     ************************************************/
    document.getElementById("resultados").innerHTML = `
        <div class="cards">
            <div class="card">
                <h3>🔆 Paneles solares</h3>
                <p><strong>Modelo:</strong> ${panel.potencia} W</p>
                <p><strong>Total:</strong> ${totalPaneles} paneles</p>
                <p><strong>Configuración:</strong> ${panelesSerie} en serie × ${panelesParalelo} en paralelo</p>
                <p><strong>Potencia instalada:</strong> ${(totalPaneles * panel.potencia / 1000).toFixed(2)} kWp</p>
            </div>

            <div class="card">
                <h3>⚡ Inversor recomendado</h3>
                <p><strong>Tipo:</strong> ${tipoSistema}</p>
                <p><strong>Potencia recomendada:</strong> ${inversorComercial} kW</p>
                <p><strong>Factor aplicado:</strong> ${factorInversor}</p>
            </div>

            ${bateriaHTML}
        </div>
    `;
}

/************************************************
 * NUEVA COTIZACIÓN
 ************************************************/
function nuevaCotizacion() {
    document.getElementById("consumo").value = "";
    document.getElementById("ahorro").value = "";
    document.getElementById("horasSol").value = "";
    document.getElementById("perdidas").value = "";
    document.getElementById("respaldo").value = "";
    document.getElementById("tipoSistema").value = "red";

    controlarRespaldo();

    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}
