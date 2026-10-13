# Inscripción a talleres

App web con **Node.js, Express y EJS** para ver los talleres de unas jornadas tecnológicas e inscribirse. Los datos se guardan en memoria, así que se borran al parar el servidor.

Chat de apoyo: **<PEGAR AQUÍ EL ENLACE AL CHAT>**

## Cómo arrancarla

```bash
npm install
npm start
```

Se abre en `http://localhost:3000`.

## Ficheros

```
js/app.js        el servidor: rutas y datos
js/talleres.js   las funciones que calculan y validan
views/           las páginas (listado, ficha, inscripción, error)
```

## Cómo está hecho

Hay dos listas en memoria: los talleres y las inscripciones. Las plazas que quedan no se guardan, se calculan cada vez: plazas del taller menos las inscripciones que tiene.

**Listado y filtros:** la página `/talleres` coge los talleres, calcula las plazas que quedan de cada uno y quita los que no cumplen los filtros de la dirección (categoría, nivel y disponibles). Se pueden combinar todos a la vez.

**Ficha:** `/talleres/:id` busca el taller por su número y, según las plazas que queden, muestra "N plazas disponibles", "Última plaza disponible" o "Completo".

**Inscripción:** el formulario envía nombre y correo. El servidor comprueba, por este orden, que el taller existe, que el nombre y el correo son correctos, que quedan plazas y que ese correo no está ya apuntado en ese taller. Si algo falla, enseña el formulario otra vez con lo que estaba bien y los errores. Si todo va bien, guarda la inscripción y lleva al usuario a la ficha del taller, para que al recargar la página no se repita la inscripción.

**Seguridad:** todo lo que llega del navegador se trata como no fiable. El número del taller tiene que ser un entero positivo (si es `abc` o `-1` da error 400, y si el taller no existe, error 404), y del formulario solo se leen el nombre y el correo.

## Funcionalidades

Cada una con su `curl` y su equivalente en HTML.

**1. Listado**
```bash
curl http://localhost:3000/talleres
```
HTML: enlace `<a href="/talleres">`.

**2. Filtros**
```bash
curl "http://localhost:3000/talleres?categoria=web"
curl "http://localhost:3000/talleres?nivel=avanzado"
curl "http://localhost:3000/talleres?disponibles=true"
curl "http://localhost:3000/talleres?categoria=web&nivel=avanzado&disponibles=true"
```
HTML: formulario `<form action="/talleres" method="get">` con dos desplegables y una casilla.

**3. Ficha del taller**
```bash
curl http://localhost:3000/talleres/1
curl http://localhost:3000/talleres/2
curl http://localhost:3000/talleres/3
```
HTML: enlace `<a href="/talleres/1">` desde el listado.

**4. Formulario de inscripción**
```bash
curl http://localhost:3000/talleres/1/inscripcion
```
HTML: enlace `<a href="/talleres/1/inscripcion">` desde la ficha.

**5. Inscribirse**
```bash
curl -i -X POST --data-urlencode "nombre=Ana López" --data-urlencode "email=ana@example.com" \
  http://localhost:3000/talleres/1/inscripcion
```
HTML: formulario `<form action="/talleres/1/inscripcion" method="post">` con `nombre` y `email`.

**6. Errores**
```bash
# datos inválidos
curl -X POST --data-urlencode "nombre=" --data-urlencode "email=mal" http://localhost:3000/talleres/1/inscripcion
# correo ya inscrito
curl -X POST --data-urlencode "nombre=Curro" --data-urlencode "email=currox@example.com" http://localhost:3000/talleres/1/inscripcion
# taller completo
curl -X POST --data-urlencode "nombre=Ana" --data-urlencode "email=ana@example.com" http://localhost:3000/talleres/3/inscripcion
# taller inexistente y número manipulado
curl -i http://localhost:3000/talleres/999
curl -i http://localhost:3000/talleres/abc
```
HTML: el mismo formulario del punto 5; para los números, enlaces a `/talleres/999` y `/talleres/abc`.
