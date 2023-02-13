const casillaTodas = document.getElementById("todas");
const otrasCasillas = document.getElementsByClassName("otrasCategorias");
var cargada = false;
// ---- Alerta ----
const alerta = document.getElementById("alerta");
const mostrarAlerta = (msg) => {
  alerta.innerText = msg;
  alerta.classList.add("abierta");
  setTimeout(() => alerta.classList.remove("abierta"), 3000);
};

//----------------Error en la subida---------------------
if (document.location.search) {
  mostrarAlerta("Error. Valores incorrectos al subir la foto.");
}

// ---- Modal -----
const btnGuardar = document.getElementById("btnGuardar");



//Validar foto

const form = document.getElementById('formulario');

form.onsubmit = function () { validar() };

function validar() {

  var o = document.getElementById('frmFile');
  var foto = o.files[0];
  var c = 0;

  // if (o.files.length == 0 || !(/\.(jpg|png)$/i).test(foto.name)) {
  //   c = 1;
  //   alert('Ingrese una imagen con alguno de los siguientes formatos: .jpeg/.jpg/.png.');
  // } else {
  var img = new Image();
  img.onload = function () {
    // if (this.width.toFixed(0) != 900 && this.height.toFixed(0) != 400) {
    //   c = 1;
    //   alert('Las medidas deben ser: 900 x 400');
    //   alert(c);
    // } else {
    //   alert('Imagen correcta :)');
    // }
    const ancho = this.width.toFixed(0);
    // alert(ancho);


  };

  img.src = URL.createObjectURL(foto);
  // }
  // if (c == 1)
  //   event.preventDefault();
}














//Datos Modal
const modalTitulo = document.getElementById("titlePhoto");
const modalFoto = document.getElementById("photo");
const modalDate = document.getElementById("date-location");
const modalCamera = document.getElementById("camera");
const modalLens = document.getElementById("lente");
const modalDesc = document.getElementById("descripcion");
const modalAutor = document.getElementById("autor");
const stars = document.getElementsByClassName("estrella");

// async function comprobarEstrellitas() {
//   for (let j = 0; j < stars.length; j++) {
//     if (stars[j].classList.contains("selected")) {
//       stars[j].classList.remove("selected");
//     }
//   }
// }

//------------------Mostrar datos fotos---------------------------------------
const modal = new bootstrap.Modal(document.getElementById("modalDesc"));

async function rellenarModal(evt) {
  let ruta = evt.target.getAttribute("src");
  let rutaCorrecta = encodeURIComponent(ruta);
  const foto = await findPhotoByImg(rutaCorrecta);
  modalTitulo.value = foto[0].title;
  modalFoto.setAttribute("src", foto[0].img);
  const dateTime = foto[0].displayDate;
  const ubicacion = foto[0].location;
  modalDate.value = ubicacion + " - " + dateTime;
  modalCamera.value = foto[0].camera;
  modalLens.value = foto[0].lens;
  modalDesc.value = foto[0].description;
  modalAutor.value = foto[0].photographer;
  // Comprobar el reinicio de las estrellitas
  for (let j = 0; j < stars.length; j++) {
    if (stars[j].classList.contains("selected")) {
      stars[j].classList.remove("selected");
    }
  }
  const rating = foto[0].averageScore;
  //Pintar estrellitas con la valoracion media.
  for (let i = 0; i < stars.length; i++) {
    if (i < rating) {
      stars[i].classList.add("selected");
    }
  }
}
//---------------Click Votar--------------------
const modalVotar = new bootstrap.Modal(document.getElementById("modalVotar"));
let score = 0;
async function abrirPuntuar(evt) {
  if (evt.target.classList.contains("votar")) {
    //Votar
    const id = (btVotar.dataset.id = evt.target.dataset.id);

    // //Pintar Estrellas--------------------------------
    const estrellitas = document.getElementsByClassName("puntuar");

    // Comprobar el reinicio de las estrellitas
    for (let j = 0; j < estrellitas.length; j++) {
      if (estrellitas[j].classList.contains("selected")) {
        estrellitas[j].classList.remove("selected");
      }
    }

    for (let i = 0; i < estrellitas.length; i++) {
      estrellitas[i].addEventListener("click", async () => {
        for (let j = 0; j <= i; j++) {
          if (!estrellitas[j].classList.contains("selected")) {
            estrellitas[j].classList.add("selected");
          }
        }
        for (let j = i + 1; j < estrellitas.length; j++) {
          if (estrellitas[j].classList.contains("selected")) {
            estrellitas[j].classList.remove("selected");
          }
        }
        score = i + 1;
      });
    }
  } 
  modalVotar.show();
}

//Botón votar

const btVotar = document.getElementById("btVotar");
btVotar.addEventListener("click", async () => {
  modalVotar.hide();
  const id = btVotar.dataset.id;
  alert(id)
  if (id) {
    await updatePhoto(id, score);
  }
  await cargarGaleria();
});

//-----------------Click Borrar-----------------
async function borrarFoto(evt) {
  await deletePhoto(evt.target.dataset.id);
  await cargarGaleria();
  
}








// // ---- Filtro por categoria de fotos -----
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

// // ---- Recarga la galeria, aplicando filtro, escucha clicks en las fotos -----
async function cargarGaleria() {

  const categorias = [casillaTodas.name];
  for (let casilla of otrasCasillas) {
    if (casilla.checked) {
      categorias.push(casilla.name);
    }
  }
  //Obtenemos el valor del array completo.
  const tamañoTodas = otrasCasillas.length + 1;

  if (categorias.length < tamañoTodas && categorias.length > 1) {
    categorias.shift();
  }

  contFotos.innerHTML = plantillaGaleria({
    fotos: await findPhoto(categorias),
  });

  //Escuchamos clicks
  const fotos = document.getElementsByClassName("fotos");

  if (fotos.length > 0) {
    for (let foto of fotos) {
      foto.addEventListener('click', rellenarModal);
    }
  }

  const botoncillos = document.getElementsByClassName("edicion");
  for (let boton of botoncillos) {
    boton.addEventListener("click", async (evt) => {
      if (evt.target.classList.contains("votar")) {
        abrirPuntuar(evt);
      }
      if (evt.target.classList.contains("borrar")) {
        borrarFoto(evt);
      }
    });
  }

}

cargarGaleria();

// ---- Fetch ------
async function enviarFetch(url, metodo = "GET", body) {
  // cargador.style.display = "block";
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
    // cargador.style.display = "none";
  }
}

// ---- Funciones CRUD -----
async function findPhoto(categorias) {
  return await enviarFetch(
    `/fotos?categorias=${categorias.join(
      ","
    )}`
  );
}

async function findPhotoByImg(ruta) {
  return await enviarFetch(`/fotos/img/${ruta}`);
}

async function findPhotoById(id) {
  return await enviarFetch(`/fotos/${id}`);
}
// async function savePhoto(photoData) {
//   return await enviarFetch("/fotos", "POST", photoData);
// }
async function updatePhoto(id, score) {
  return await enviarFetch(`/fotos/${id}`, "PATCH", { score: score });
}
async function deletePhoto(id) {
  return await enviarFetch(`/fotos/${id}`, "DELETE");
}
