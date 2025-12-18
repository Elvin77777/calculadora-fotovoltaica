function verificarClave() {

  const claveIngresada = document.getElementById("clave").value;
  const mensaje = document.getElementById("mensaje");

  // 🔐 CLAVE (puedes cambiarla)
  const CLAVE_CORRECTA = "MIDANIELA";

  if (claveIngresada === CLAVE_CORRECTA) {
    window.location.href = "sistema.html";
  } else {
    mensaje.innerHTML = "<p style='color:red;'>Clave incorrecta</p>";
  }

if (claveIngresada === CLAVE_CORRECTA) {
  sessionStorage.setItem("acceso", "ok");
  window.location.href = "sistema.html";
}

  
}



