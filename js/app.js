import express from "express";
import {
  obtenerPlazasRestantes,
  estaInscrito,
  validarInscripcion,
  parsearId,
  buscarTaller,
  obtenerEstado,
  filtrarTalleres
} from "./talleres.js";

// ---------- Datos en memoria (se cargan al arrancar el servidor) ----------

const talleres = [
  {
    id: 1,
    titulo: "Introducción a Docker",
    categoria: "sistemas",
    plazas: 20,
    nivel: "inicial"
  },
  {
    id: 2,
    titulo: "JavaScript asíncrono en profundidad",
    categoria: "web",
    plazas: 2,
    nivel: "avanzado"
  },
  {
    id: 3,
    titulo: "Seguridad básica en aplicaciones web",
    categoria: "web",
    plazas: 1,
    nivel: "intermedio"
  }
];

const inscripciones = [
  { id: 1, tallerId: 1, nombre: "Curro Ximénez", email: "currox@example.com" },
  { id: 2, tallerId: 2, nombre: "Lola Pérez", email: "lola@example.com" },
  { id: 3, tallerId: 3, nombre: "Marta Ruiz", email: "marta@example.com" }
];

const categorias = ["sistemas", "web"];
const niveles = ["inicial", "intermedio", "avanzado"];

// ---------- Configuración de Express ----------

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", "views");

// Lee el body de los formularios
app.use(express.urlencoded({ extended: false }));

// ---------- Funciones auxiliares (dependen de req/res, por eso están aquí) ----------

function mostrarError(res, codigo, mensaje) {
  res.status(codigo).render("error", { titulo: "Error", codigo, mensaje });
}

// Valida el :id y busca el taller. Si algo falla, responde con el error

function cargarTaller(req, res) {
  const id = parsearId(req.params.id);
  if (id === null) {
    mostrarError(res, 400, "El identificador del taller no es válido.");
    return null;
  }
  const taller = buscarTaller(id, talleres);
  if (!taller) {
    mostrarError(res, 404, "El taller solicitado no existe.");
    return null;
  }
  return taller;
}

// Datos que necesitan las vistas de un taller concreto.
function datosTaller(taller) {
  const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);
  return { taller, plazasRestantes, estado: obtenerEstado(plazasRestantes) };
}

function mostrarFormulario(res, taller, datos, errores, codigo = 200) {
  res.status(codigo).render("inscripcion", {
    titulo: `Inscripción: ${taller.titulo}`,
    ...datosTaller(taller),
    datos,
    errores
  });
}

// ---------- Rutas --------------------

app.get("/", (req, res) => {
  res.redirect("/talleres");
});

// Listado con filtros:
app.get("/talleres", (req, res) => {
  // req.query no es fiable: solo aceptamos strings
  const texto = (valor) =>
    typeof valor === "string" ? valor.trim().toLowerCase() : "";

  const filtros = {
    categoria: texto(req.query.categoria),
    nivel: texto(req.query.nivel),
    disponibles: req.query.disponibles === "true" ? "true" : ""
  };

  res.render("talleres", {
    titulo: "Listado de talleres",
    talleres: filtrarTalleres(talleres, inscripciones, filtros),
    filtros,
    categorias,
    niveles
  });
});

// Ficha del taller (estados: disponibles / ultima / completo)
app.get("/talleres/:id", (req, res) => {
  const taller = cargarTaller(req, res);
  if (!taller) return;

  res.render("taller", {
    titulo: taller.titulo,
    ...datosTaller(taller),
    inscripcionOk: req.query.inscripcion === "ok" // aviso
  });
});

// Formulario de inscripción
app.get("/talleres/:id/inscripcion", (req, res) => {
  const taller = cargarTaller(req, res);
  if (!taller) return;

  mostrarFormulario(res, taller, { nombre: "", email: "" }, {});
});

// Alta de inscripción
app.post("/talleres/:id/inscripcion", (req, res) => {
  const taller = cargarTaller(req, res);
  if (!taller) return;

  // 1. Validar formato (req.body puede venir vacío o con cualquier cosa)
  const { valido, errores, datosLimpios } = validarInscripcion(req.body);
  const erroresFinales = { ...errores };

  // 2. Quedan plazas
  if (obtenerPlazasRestantes(taller, inscripciones) <= 0) {
    erroresFinales.general = "Este taller está completo: no quedan plazas.";
  }

  // 3. Correo no repetido en este taller (solo si el correo es válido)
  if (valido && estaInscrito(taller.id, datosLimpios.email, inscripciones)) {
    erroresFinales.email = "Este correo ya está inscrito en este taller.";
  }

  // Si hay errores: se vuelve a mostrar el formulario con los campos correctos
  if (Object.keys(erroresFinales).length > 0) {
    const datos = {
      nombre: erroresFinales.nombre ? "" : datosLimpios.nombre,
      email: erroresFinales.email ? "" : datosLimpios.email
    };
    return mostrarFormulario(res, taller, datos, erroresFinales, 400);
  }

  // 4. Todo correcto: se guarda (id nuevo = mayor id + 1)
  const nuevoId = Math.max(0, ...inscripciones.map((i) => i.id)) + 1;
  inscripciones.push({
    id: nuevoId,
    tallerId: taller.id,
    nombre: datosLimpios.nombre,
    email: datosLimpios.email
  });

  // 5. PRG: redirigimos para que F5 no reenvíe el formulario
  res.redirect(303, `/talleres/${taller.id}?inscripcion=ok`);
});

// ---------- 404 y errores generales --------------------

app.use((req, res) => {
  mostrarError(res, 404, "La página que buscas no existe.");
});

app.use((err, req, res, next) => {
  const codigo = err.status || 500;
  mostrarError(res, codigo, "Ha ocurrido un error al procesar la petición.");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});