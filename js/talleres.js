// Funciones de lógica. NO dependen de req ni de res:
// reciben datos, devuelven datos. Así se pueden probar solas.

// ---------- Normalización ----------

// Quita espacios y pasa a minúsculas (para comparar correos).
function normalizarEmail(email) {
  return String(email).trim().toLowerCase();
}

// Convierte el :id de la URL en número entero positivo, o null si no es válido.
// Se convierte con Number y después se valida (como en el temario).
function parsearId(valor) {
  const texto = String(valor ?? "").trim();
  const id = Number(texto);
  if (texto === "" || !Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// Comprobación sencilla de correo: tiene @ y punto, sin espacios,
// y no empieza ni termina de forma rara.
function esEmailValido(email) {
  return (
    email.length > 0 &&
    email.length <= 100 &&
    email.includes("@") &&
    email.includes(".") &&
    !email.includes(" ") &&
    email[0] !== "@" &&
    email.at(-1) !== "@" &&
    email.at(-1) !== "."
  );
}

// ---------- Funciones obligatorias ----------

// plazasRestantes = plazas - númeroDeInscripciones (de ese taller)
function obtenerPlazasRestantes(taller, inscripciones) {
  const inscritos = inscripciones.filter(
    (insc) => insc.tallerId === taller.id
  ).length;
  return taller.plazas - inscritos;
}

// ¿Ese correo ya está inscrito en ese taller?
function estaInscrito(tallerId, email, inscripciones) {
  const emailNormalizado = normalizarEmail(email);
  return inscripciones.some(
    (insc) =>
      insc.tallerId === tallerId &&
      normalizarEmail(insc.email) === emailNormalizado
  );
}

// Valida lo que llega del formulario (no fiable).
// Devuelve { valido, errores, datosLimpios }.
function validarInscripcion(datos) {
  const errores = {};
  const origen = datos && typeof datos === "object" ? datos : {};

  // Solo aceptamos strings; cualquier otra cosa (arrays, objetos) se descarta.
  const nombre = typeof origen.nombre === "string" ? origen.nombre.trim() : "";
  const email =
    typeof origen.email === "string" ? origen.email.trim().toLowerCase() : "";

  if (nombre.length < 2 || nombre.length > 60) {
    errores.nombre = "El nombre debe tener entre 2 y 60 caracteres.";
  }

  if (!esEmailValido(email)) {
    errores.email = "Introduce un correo electrónico válido.";
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datosLimpios: { nombre, email }
  };
}

// ---------- Funciones extra ----------

// Devuelve el taller con ese id, o undefined si no existe.
function buscarTaller(id, talleres) {
  return talleres.find((taller) => taller.id === id);
}

// Estado de la ficha según plazas restantes.
function obtenerEstado(plazasRestantes) {
  if (plazasRestantes <= 0) return "completo";
  if (plazasRestantes === 1) return "ultima";
  return "disponibles";
}

// Aplica los filtros del listado y añade plazasRestantes a cada taller.
// filtros = { categoria, nivel, disponibles } (todos opcionales, vienen de req.query)
function filtrarTalleres(talleres, inscripciones, filtros) {
  const categoria =
    typeof filtros.categoria === "string"
      ? filtros.categoria.trim().toLowerCase()
      : "";
  const nivel =
    typeof filtros.nivel === "string" ? filtros.nivel.trim().toLowerCase() : "";
  const soloDisponibles = filtros.disponibles === "true";

  return talleres
    .map((taller) => ({
      ...taller,
      plazasRestantes: obtenerPlazasRestantes(taller, inscripciones)
    }))
    .filter((taller) => !categoria || taller.categoria === categoria)
    .filter((taller) => !nivel || taller.nivel === nivel)
    .filter((taller) => !soloDisponibles || taller.plazasRestantes > 0);
}

export {
  normalizarEmail,
  parsearId,
  obtenerPlazasRestantes,
  estaInscrito,
  validarInscripcion,
  buscarTaller,
  obtenerEstado,
  filtrarTalleres
};