# Inscripción a talleres

Aplicación web para consultar los talleres de unas jornadas tecnológicas e inscribirse en ellos. Desarrollada con **Node.js**, **Express** y **EJS**.

Los datos se almacenan en memoria, por lo que las inscripciones se reinician al detener el servidor.

**Chat de apoyo: Enviado por privado

## Instalación y ejecución

Instalar las dependencias:

```bash
npm init -y
npm install express
npm install ejs
```

Iniciar el servidor:

```bash
npm start
```

Acceder a la aplicación desde el navegador:

`http://localhost:3000`

## Estructura del proyecto

| Archivo o carpeta | Descripción |
|---|---|
| `js/app.js` | Servidor, rutas y gestión de las peticiones. |
| `js/talleres.js` | Funciones de cálculo y validación. |
| `views/` | Plantillas EJS de las páginas de la aplicación. |

## Funcionamiento

La aplicación gestiona dos listas en memoria: talleres e inscripciones.

Las plazas disponibles se calculan restando las inscripciones realizadas al número total de plazas de cada taller.

Cada taller puede encontrarse en uno de estos estados:

| Estado | Condición |
|---|---|
| Disponible | Quedan dos o más plazas. |
| Última plaza | Queda una plaza. |
| Completo | No quedan plazas. |

## Rutas de la aplicación

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/talleres` | Muestra el listado de talleres y permite aplicar filtros. |
| GET | `/talleres/:id` | Muestra los detalles de un taller. |
| GET | `/talleres/:id/inscripcion` | Muestra el formulario de inscripción. |
| POST | `/talleres/:id/inscripcion` | Valida y procesa la inscripción. |

## Funcionalidades

### 1. Listado de talleres

Muestra los talleres disponibles y calcula las plazas restantes de cada uno.

```bash
curl http://localhost:3000/talleres
```

### 2. Filtros

Permite filtrar los talleres por categoría, nivel y disponibilidad. Los filtros pueden combinarse.

```bash
curl "http://localhost:3000/talleres?categoria=web"
curl "http://localhost:3000/talleres?nivel=avanzado"
curl "http://localhost:3000/talleres?disponibles=true"
curl "http://localhost:3000/talleres?categoria=web&nivel=avanzado&disponibles=true"
```

### 3. Ficha del taller

Muestra la información de cada taller y su estado de disponibilidad.

```bash
curl http://localhost:3000/talleres/1
curl http://localhost:3000/talleres/2
curl http://localhost:3000/talleres/3
```

### 4. Formulario de inscripción

Permite introducir el nombre y el correo electrónico para inscribirse en un taller. Si el taller está completo, se informa al usuario.

```bash
curl http://localhost:3000/talleres/1/inscripcion
```

### 5. Procesamiento de inscripciones

El servidor valida los datos recibidos y registra la inscripción si se cumplen todos los requisitos. Después, redirige a la ficha del taller mediante el patrón **POST/Redirect/GET (PRG)**, evitando repetir la inscripción al recargar la página.

```bash
curl -i -X POST \
  --data-urlencode "nombre=Ana López" \
  --data-urlencode "email=ana@example.com" \
  http://localhost:3000/talleres/1/inscripcion
```

La opción `-i` permite consultar las cabeceras HTTP de la respuesta, incluida la redirección `303`.

### 6. Validaciones y gestión de errores

La aplicación comprueba los siguientes aspectos antes de registrar una inscripción:

- Existencia del taller.
- Validez del nombre y del correo electrónico.
- Disponibilidad de plazas.
- Ausencia de inscripciones previas con el mismo correo en ese taller.
- Validez del identificador del taller, que debe ser un entero positivo.

Cuando los datos son incorrectos, se vuelve a mostrar el formulario con los errores correspondientes y se conservan los valores introducidos que sean válidos.

| Situación | Respuesta |
|---|---|
| Identificador inválido (`abc`, `-1`, `1.5`) | Error HTTP 400. |
| Taller inexistente | Error HTTP 404. |
| Datos incorrectos | Formulario con errores. |
| Correo ya inscrito | Formulario con errores. |
| Taller completo | Formulario con errores. |

Ejemplos de pruebas:

```bash
# Datos inválidos
curl -X POST \
  --data-urlencode "nombre=" \
  --data-urlencode "email=mal" \
  http://localhost:3000/talleres/1/inscripcion

# Taller inexistente
curl -i http://localhost:3000/talleres/999

# Identificador inválido
curl -i http://localhost:3000/talleres/abc
```

La aplicación trata los datos recibidos del navegador como información no fiable y valida las entradas antes de procesarlas.

## Tecnologías utilizadas

- **Node.js:** entorno de ejecución de JavaScript.
- **Express:** gestión del servidor y las rutas.
- **EJS:** generación de páginas HTML mediante plantillas.

## Consideraciones

Los datos se almacenan únicamente en memoria. Al detener o reiniciar el servidor, se pierden los talleres modificados y las inscripciones realizadas durante la ejecución, según la implementación de la aplicación.
