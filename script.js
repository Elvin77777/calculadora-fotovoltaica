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
    const campos = ["consumo", "ahorro", "horasSol", "perdidas", "tarifa", "vidaUtil"];
    for (let id of campos) {
        const valor = parseFloat(document.getElementById(id).value);
        if (isNaN(valor) || valor <= 0) {
            alert("Revisa los datos ingresados.");
            return false;
        }
    }

    const tipo = document.getElementById("tipoSistema").value;
    const respaldo = document.getElementById("respaldo").value;

    if ((tipo === "hibrido" || tipo === "aislado") && respaldo === "") {
        alert("Debes indicar las horas de respaldo.");
        return false;
    }
    return true;
}

function calcularSistema() {

    if (!validarFormulario()) return;

    const tipo = document.getElementById("tipoSistema").value;
    const consumo = parseFloat(document.getElementById("consumo").value); // kWh
    const ahorroPct = parseFloat(document.getElementById("ahorro").value);
    const horasSol = parseFloat(document.getElementById("horasSol").value);
    const perdidas = parseFloat(document.getElementById("perdidas").value);
    const respaldo = document.getElementById("respaldo").value;
    const tarifa = parseFloat(document.getElementById("tarifa").value); // $/kWh
    const costoSistema = parseFloat(document.getElementById("costoSistema").value || 0);
    const vidaUtil = parseInt(document.getElementById("vidaUtil").value);

    // ===== CÁLCULOS ENERGÉTICOS =====
    const consumoCubierto = consumo * (ahorroPct / 100);
    const consumoDiario = consumoCubierto / 30;
    const energiaReal = consumoDiario / (1 - perdidas / 100);
    const potenciaNecesaria = energiaReal / horasSol;

    const potenciaPanel = 550;
    const paneles = Math.ceil((potenciaNecesaria * 1000) / potenciaPanel);

    // ===== CÁLCULOS ECONÓMICOS =====
    const costoMensualActual = consumo * tarifa; // $
    const ahorroMensual = consumoCubierto * tarifa; // $
    const ahorroAnual = ahorroMensual * 12;
    const ahorroTotal = ahorroAnual * vidaUtil;
    const tiempoRetorno = costoSistema > 0 ? (costoSistema / ahorroAnual) : null;

    // ===== ALERTA =====
    let alertaClase = "alerta-verde";
    let alertaTexto = "Sistema recomendado. Alta rentabilidad.";

    if (tiempoRetorno !== null) {
        if (tiempoRetorno > 9 || ahorroPct < 60) {
            alertaClase = "alerta-roja";
            alertaTexto = "Retorno largo. Se recomienda optimizar el sistema.";
        } else if (tiempoRetorno > 6 || ahorroPct < 80) {
            alertaClase = "alerta-amarilla";
            alertaTexto = "Sistema viable, pero mejorable.";
        }
    }

    let html = `
        <h3>Resultados del sistema</h3>

        <div class="resultados-grid">
            <div class="card"><h4>Potencia requerida</h4><p>${potenciaNecesaria.toFixed(2)} kWp</p></div>
            <div class="card"><h4>Paneles</h4><p>${paneles} × ${potenciaPanel} W</p></div>
            <div class="card"><h4>Costo mensual actual</h4><p>$${costoMensualActual.toFixed(2)}</p></div>
            <div class="card"><h4>Ahorro mensual</h4><p>$${ahorroMensual.toFixed(2)}</p></div>
            <div class="card"><h4>Tiempo de retorno</h4><p>${tiempoRetorno ? tiempoRetorno.toFixed(1) + " años" : "N/D"}</p></div>
            <div class="card"><h4>Ahorro en ${vidaUtil} años</h4><p>$${ahorroTotal.toFixed(2)}</p></div>
        </div>

        <div class="alerta ${alertaClase}">
            ${alertaTexto}
        </div>
    `;

    document.getElementById("resultados").innerHTML = html;

    dibujarGrafica(consumo, consumoCubierto, costoMensualActual, ahorroMensual);
}

function dibujarGrafica(consumoKWh, cubiertoKWh, costoUSD, ahorroUSD) {

    const canvas = document.getElementById("grafica");
    const ctx = canvas.getContext("2d");
    document.getElementById("grafica-container").style.display = "block";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const valores = [consumoKWh, cubiertoKWh, costoUSD, ahorroUSD];
    const etiquetas = [
        "Consumo (kWh)",
        "Cubierto (kWh)",
        "Costo ($)",
        "Ahorro ($)"
    ];
    const unidades = ["kWh", "kWh", "$", "$"];

    const max = Math.max(...valores);
    const escala = 200 / max;

    valores.forEach((v, i) => {
        ctx.fillStyle = "#1e88e5";
        ctx.fillRect(60 + i * 130, 250 - v * escala, 60, v * escala);

        ctx.fillStyle = "#000";
        ctx.fillText(etiquetas[i], 40 + i * 130, 270);

        const texto =
            unidades[i] === "$"
                ? `$${v.toFixed(2)}`
                : `${v.toFixed(1)} ${unidades[i]}`;

        ctx.fillText(texto, 45 + i * 130, 235 - v * escala);
    });
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
    document.getElementById("grafica-container").style.display = "none";
    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}
