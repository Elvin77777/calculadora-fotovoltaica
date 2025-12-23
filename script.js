document.addEventListener("DOMContentLoaded", () => {
    controlarRespaldo();
    controlarBaterias();

    document.getElementById("tipoSistema")
        .addEventListener("change", () => {
            controlarRespaldo();
            controlarBaterias();
        });
});

/* ===============================
   CONTROL DE HORAS DE RESPALDO
================================ */
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

/* ===============================
   CONTROL DE BLOQUE DE BATERÍAS
================================ */
function controlarBaterias() {
    const tipo = document.getElementById("tipoSistema").value;
    const bloque = document.getElementById("bloqueBaterias");

    if (tipo === "hibrido" || tipo === "aislado") {
        bloque.style.display = "block";
    } else {
        bloque.style.display = "none";
    }
}

/* ===============================
   FUNCIÓN PRINCIPAL (TEMPORAL)
================================ */
function calcularSistema() {
    alert("Nivel 2 – Paso 1: bloque de baterías activo.\nEl cálculo de baterías se implementa en el Paso 2.");
}

/* ===============================
   NUEVA COTIZACIÓN
================================ */
function nuevaCotizacion() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    document.querySelectorAll("select").forEach(s => s.selectedIndex = 0);

    document.getElementById("ahorro").value = 90;
    document.getElementById("horasSol").value = 5.5;
    document.getElementById("perdidas").value = 20;
    document.getElementById("tarifa").value = 0.22;
    document.getElementById("vidaUtil").value = 25;
    document.getElementById("voltajeBanco").value = 24;
    document.getElementById("dod").value = 80;
    document.getElementById("eficienciaBateria").value = 95;

    controlarRespaldo();
    controlarBaterias();

    document.getElementById("resultados").innerHTML =
        "<p>Introduce los datos y presiona “Calcular sistema”.</p>";
}
