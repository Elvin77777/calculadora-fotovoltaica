function calcular() {

  const consumoMensual = parseFloat(document.getElementById("consumoMensual").value);
  const ahorro = parseFloat(document.getElementById("ahorro").value) / 100;
  const hsp = parseFloat(document.getElementById("hsp").value);
  const perdidas = parseFloat(document.getElementById("perdidas").value) / 100;
  const tipoSistema = document.getElementById("tipoSistema").value;
  const respaldo = parseFloat(document.getElementById("respaldo").value);

  // Consumos
  const consumoDiario = consumoMensual / 30;
  const energiaSolarDiaria = consumoDiario * ahorro;

  // Potencia FV
  const potenciaFV = energiaSolarDiaria / (hsp * (1 - perdidas));

  // Selección automática de panel
  let potenciaPanel;
  if (potenciaFV <= 3) potenciaPanel = 450;
  else if (potenciaFV <= 6) potenciaPanel = 550;
  else potenciaPanel = 600;

  const numeroPaneles = Math.ceil((potenciaFV * 1000) / potenciaPanel);

  // Inversor
  const inversor = Math.ceil(potenciaFV * 1.2);

  // Baterías (simplificado por ahora)
  let bateriasTexto = "No aplica";
  if (tipoSistema !== "red") {
    const energiaRespaldo = energiaSolarDiaria * (respaldo / 24);
    bateriasTexto = `Energía de respaldo requerida: ${energiaRespaldo.toFixed(1)} kWh`;
  }

  document.getElementById("resultados").innerHTML = `
    <strong>Consumo diario:</strong> ${consumoDiario.toFixed(2)} kWh/día<br>
    <strong>Energía solar requerida:</strong> ${energiaSolarDiaria.toFixed(2)} kWh/día<br>
    <strong>Potencia del sistema:</strong> ${potenciaFV.toFixed(2)} kWp<br>
    <strong>Panel recomendado:</strong> ${potenciaPanel} W<br>
    <strong>Cantidad de paneles:</strong> ${numeroPaneles}<br>
    <strong>Inversor recomendado:</strong> ${inversor} kW<br>
    <strong>Baterías:</strong> ${bateriasTexto}
  `;
}
