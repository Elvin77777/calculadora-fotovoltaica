document.addEventListener("DOMContentLoaded", () => {
    controlarRespaldo();
    document.getElementById("tipoSistema").addEventListener("change", controlarRespaldo);
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

function validarFormulario() {
    const ids = ["consumo", "ahorro", "horasSol", "perdidas", "tarifa", "vidaUtil"];
    for (let id of ids) {
        const v = parseFloat(document.getElementById(id).value);
        if (isNaN(v) || v <= 0) {
            alert("Revisa los datos ingresados.");
            return false;
        }
    }

    const tipo = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo").value;

    if ((tipo === "hibrido" || tipo === "aislado") && respaldo === "") {
        alert("Indica las horas de respaldo.");
        return false;
    }
    return true;
}

function calcularSistema() {

    if (!validarFormulario()) return;

    // === ENTRADAS ===
    const tipo = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(document.getElementById("consumo").value);
    const ahorroPct = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = document.getElementById("respaldo").value;
    const tarifa = parseFloat(document.getElementById("tarifa").value);
    const costoSistema = parseFloat(document.getElementById("costoSistema").value || 0);
    const vidaUtil = parseInt(document.getElementById("vidaUtil").value);

    // === CÁLCULOS TÉCNICOS ===
    const consumoCubierto = consumo * (ahorroPct / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaNecesaria = energiaReal / horasSol;

    const potenciaPanel = 550;
    const paneles = Math.ceil((potenciaNecesaria * 1000) / potenciaPanel);

    // === CÁLCULOS ECONÓMICOS ===
    const ahorroMensual = consumoCubierto * tarifa;
    const ahorroAnual = ahorroMensual * 12;
    const ahorroTotal = ahorroAnual * vidaUtil;

    const tiempoRetorno =
        costoSistema > 0 ? (costoSistema / ahorroAnual) : null;

    // === ALERTA COMERCIAL ===
    let alertaClase = "alerta-verde";
    let alertaTexto = "Sistema recomendado. Alta rentabilidad y buen retorno de inversión.";

    if (tiempoRetorno !== null) {
        if (tiempoRetorno > 9 || ahorroPct < 60) {
            alertaClase = "alerta-roja";
            alertaTexto = "Retorno de inversión largo. Se recomienda optimizar el sistema.";
        } else if (tiempoRetorno > 6 || ahorroPct < 80) {
            alertaClase = "alerta-amarilla";
            alertaTexto = "Sistema viable, pero puede mejorarse para mayor rentabilidad.";
        }
    }

    // === RESULTADOS ===
    let html = `
        <h3>Resultados del sistema</h3>

        <div class="resultados-grid">

            <div class="card">
                <h4>Potencia requerida</h4>
                <p>${potenciaNecesaria.toFixed(2)} kWp</p>
            </div>

            <div class="card">
                <h4>Paneles solares</h4>
                <p>${paneles} × ${potenciaPanel} W</p>
            </div>

            <div class="card">
                <h4>Ahorro mensual</h4>
                <p>$${ahorroMensual.toFixed(2)}</p>
            </div>

            <div class="card">
                <h4>Ahorro anual</h4>
                <p>$${ahorroAnual.toFixed(2)}</p>
            </div>

            <div class="card">
                <h4>Tiempo de retorno</h4>
                <p>${tiempoRetorno ? tiempoRetorno.toFixed(1) + " años" : "N/D"}</p>
            </div>

            <div class="card">
                <h4>Ahorro en ${vidaUtil} años</h4>
                <p>$${ahorroTotal.toFixed(2)}</p>
            </div>

        </div>

        <div class="alerta ${alertaClase}">
            ${alertaTexto}
        </div>
    `;

    if (tipo !== "red" && respaldo < 6) {
        html += `
            <div class="alerta alerta-amarilla">
                Respaldo bajo para sistema con baterías. Se recomienda mayor autonomía.
            </div>
        `;
    }

    document.getElementById("resultados").innerHTML = html;
}

function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.getElementById("tipoSistema").value = "red";
    document.getElementById("ahorro").value = 90;
    document.getElementById("horasSol").value = 5.5;
    document.getElementById("perdidas").value = 20;
    document.getElementById("tarifa").value = 0.22;
    document.getElementById("vidaUtil").value = 25;
    controlarRespaldo();
    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}

