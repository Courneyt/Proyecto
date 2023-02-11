require("dotenv").config();
const db = require("./db.js");
const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");

const MIMETYPES = ['image/jpeg', 'image/png'];
const PORT = process.env.PORT || process.env.PUERTO || 80;

app.use(express.json());
app.use(express.static("public"));

//Configurar multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/' + process.env.RUTA_STORAGE)
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      const fileName = file.originalname.split(fileExtension)[0];
      const fileFinalName = `${fileName}-${Date.now()}${fileExtension}`;
      req.fileNombre = fileFinalName;
      cb(null, fileFinalName);
    }
  }),

  fileFilter: (req, file, cb) => {
    if (MIMETYPES.includes(file.mimetype)) cb(null, true)
    else cb(new Error(`Solo se permiten los archivos: ${MIMETYPES}`))
  },

  limits: {
    fieldSize: process.env.SIZE_UPLOAD,
  }

});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
});

app.get("/fotos", async (req, res) => {
  let params;

  params = {
    categorias: req.query.categorias.split(","),
  };

  console.log(params)
  res.json(await db.findPhoto(params));
});

app.get("/fotos/:id", async (req, res) => {
  const foto = await db.findPhotoById(req.params.id);
  if (foto) res.json(foto);
  else res.status(404).send(`No existe una foto con ID=${req.params.id}.`);
});

const up = upload.single('photo');
app.post("/upload", async (req, res) => {

  up(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.status(400).redirect('/galeria.html?errorfoto');
    } else if (err) {
      // An unknown error occurred when uploading.
      res.status(400).redirect('/galeria.html?errorfoto');
    } else {
      // Everything went fine.
      const photoData = {
        title: req.body.frmTitle,
        photographer: req.body.frmPhotographer,
        location: req.body.frmLocation,
        description: req.body.frmDescription,
        camera: req.body.frmCamera,
        lens: req.body.frmLens,
        category: req.body.frmCat,
        img: '/' + process.env.RUTA_STORAGE + '/' + req.fileNombre
      }
      console.log(photoData);

      const foto = await db.savePhoto(photoData);
      if (foto) res.location(`/fotos/${foto._id}`).status(201).redirect('/galeria.html');
      else res.status(400).redirect('/galeria.html?errorfoto');
    }
  })


});

app.patch("/fotos/:id", async (req, res) => {
  const updatedFoto = await db.rate(req.params.id, req.body.score);
  if (updatedFoto) res.sendStatus(204);
  else res.status(404).send(`No existe una foto con ID=${req.params.id}.`);
});

app.delete("/fotos/:id", async (req, res) => {
  if (await db.deletePhoto(req.params.id)) res.sendStatus(204);
  else res.status(404).send(`No existe una foto con ID=${req.params.id}.`);
});

db.connect().then(() => {
  console.log("Conectado a la base de datos.");
  app.listen(PORT, () =>
    console.log(`Servidor escuchando en el puerto ${PORT}.`)
  );
});
