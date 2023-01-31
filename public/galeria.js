const casillaTodas = document.getElementById("todas");
const otrasCasillas = document.getElementsByClassName("otrasCategorias");

// ---- Campo de búsqueda -----
// let timeout;
// buscador.addEventListener("input", () => {
//   clearTimeout(timeout);
//   timeout = setTimeout(cargarGaleria, 500);
// });

// ---- Alerta ----
const alerta = document.getElementById("alerta");
const mostrarAlerta = (msg) => {
  alerta.innerText = msg;
  alerta.classList.add("abierta");
  setTimeout(() => alerta.classList.remove("abierta"), 3000);
};

// ---- Modal -----
// const modal = new bootstrap.Modal(document.getElementById("detallesVino"));
const btnGuardar = document.getElementById("btnGuardar");
//Datos Modal
const frmTitulo = document.getElementById("frmTitulo");
const frmFtGrafo = document.getElementById("frmFtGrafo");
const frmUbicacion = document.getElementById("frmUbicacion");
const frmDesc = document.getElementById("frmDesc");
const frmCamera = document.getElementById("frmCamera");
const frmLens = document.getElementById("frmLens");
// const frmTipo = document.getElementById("frmTipo");
// const frmAnyo = document.getElementById("frmAnyo");
// const panelPuntos = document.getElementById("panelPuntos");

// [frmNombre, frmTipo, frmAnyo].forEach((i) => {
//   i.addEventListener("blur", () => {
//     btnGuardar.disabled = false;
//     [frmNombre, frmTipo, frmAnyo].forEach((j) => {
//       if (!j.validity.valid) btnGuardar.disabled = true;
//     });
//   });
// });

// ---- Clics en la tabla: puntuar y borrar -----
// document
//   .getElementsByTagName("table")[0]
//   .addEventListener("click", async (evt) => {
//     if (evt.target.classList.contains("editar")) {
//       abrirModal(evt);
//     }
//     if (evt.target.classList.contains("borrar")) {
//       await deleteWine(evt.target.dataset.id);
//       await cargarTablaVinos();
//     }
//   });

// ---- Botón de crear -----
// document.getElementById("btnNuevo").addEventListener("click", abrirModal);

// ---- Función que edita o que crea -----
// async function abrirModal(evt) {
//   if (evt.target.classList.contains("editar")) {
//     // Edición
//     [frmNombre, frmTipo, frmAnyo].forEach((i) => (i.disabled = true));
//     panelPuntos.classList.remove("d-none");
//     const id = (btnGuardar.dataset.id = evt.target.dataset.id);
//     const wine = await findWine(id);
//     frmNombre.value = wine.name;
//     frmTipo.value = wine.type;
//     frmAnyo.value = wine.year;
//     btnGuardar.disabled = false;
//   } else {
//     // Creación
//     [frmNombre, frmTipo, frmAnyo].forEach((i) => {
//       i.disabled = false;
//       i.value = "";
//     });
//     panelPuntos.classList.add("d-none");
//     btnGuardar.disabled = true;
//     btnGuardar.dataset.id = "";
//   }
//   modal.show();
// }

// ---- Botón de guardar del modal -----
btnGuardar.addEventListener("click", async () => {
  modal.hide();
  const id = btnGuardar.dataset.id;
  
    const photoData = {
      title: frmNombre.value,
      type: frmTipo.value,
      year: frmAnyo.value,
    };
    await savePhoto(photoData);
  
  await cargarGaleria();
});

// ---- Filtro por categoria de fotos -----
casillaTodas.addEventListener("click", clicEnTodas);
for (let casilla of otrasCasillas) {
  casilla.addEventListener("click", clicOtraCategoria);
}
function clicEnTodas(evt) {
  let estado = casillaTodas.checked;
  for (let casilla of otrasCasillas) {
    casilla.checked = estado;
  }
  cargarGaleria();
}
function clicOtraCategoria(evt) {
  let estado = evt.target.checked;
  if (estado == false) {
    casillaTodas.checked = false;
  } else {
    for (let casilla of otrasCasillas) {
      if (casilla.checked == false) {
        casillaTodas.checked = false;
        cargarGaleria();
        return;
      }
    }
    casillaTodas.checked = true;
  }
  cargarGaleria();
}

// ---- Recarga la galeria, aplicando filtro -----
async function cargarGaleria() {
  const categorias = [];
  for (let casilla of otrasCasillas) {
    if (casilla.checked) tipos.push(casilla.name);
  }
  cuerpoTabla.innerHTML = plantillaGaleria({
    fotos: await findPhotos(categorias),
  });
}

cargarGaleria();

// ---- Fetch ------
async function enviarFetch(url, metodo = "GET", body) {
  cargador.style.display = "block";
  try {
    let opts = { method: metodo };
    if (body) {
      opts.body = JSON.stringify(body);
      opts.headers = { "Content-type": "application/json" };
    }
    const resp = await fetch(url, opts);
    if (resp.ok) {
      const mimeType = resp.headers.get("content-type");
      if (mimeType && mimeType.startsWith("application/json"))
        return await resp.json();
      else return await resp.text();
    } else throw resp.statusText;
  } catch (err) {
    mostrarAlerta("Hubo un problema: " + err);
  } finally {
    cargador.style.display = "none";
  }
}

// ---- Funciones CRUD -----
async function findWines(categorias) {
  return await enviarFetch(
    `/fotos?categorias=${categorias.join(
      ","
    )}`
  );
}
async function findPhoto(id) {
  return await enviarFetch(`/fotos/${id}`);
}
async function savePhoto(photoData) {
  return await enviarFetch("/fotos", "POST", photoData);
}
async function updatePhoto(id, score) {
  return await enviarFetch(`/fotos/${id}`, "PATCH", { score: score });
}
async function deletePhoto(id) {
  return await enviarFetch(`/fotos/${id}`, "DELETE");
}
