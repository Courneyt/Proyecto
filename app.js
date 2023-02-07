require("dotenv").config();
const db = require("./db.js");
const express = require("express");
const app = express();
const multer = require("multer");

const MIMETYPES = ['image/jpeg', 'image/png'];
const PORT = process.env.PORT || process.env.PUERTO || 80;

app.use(express.json());
app.use(express.static("public"));

//Configurar multer

 const upload = multer({
  storage: multer.diskStorage({
    destination:(req, file, cb) => 
    {
      cb(null, 'upload')
    },
    filename: (req, file, cb) => {
      const fileExtension = extname(file.originalname);
      const fileName = file.originalname.split(fileExtension)[0];

      cb(null, `${fileName}-${Date.now()}${fileExtension}`);
    }
  }),

  fileFilter: (req,file,cb) => {
    if(MIMETYPES.includes(file.mimetype)) cb(null, true)
    else cb(new Error(`Tipo de Imagen no permitido`))
  },

  limits: {
    fieldSize:10000000,
  }

 });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
});

app.get("/fotos", async (req, res) => {
  let params = {
    category: req.query.category.split(","),
  };
  res.json(await db.find(params));
});

app.get("/fotos/:id", async (req, res) => {
  const foto = await db.findPhotoById(req.params.id);
  if (foto) res.json(foto);
  else res.status(404).send(`No existe una foto con ID=${req.params.id}.`);
});

app.post("/upload", upload.single('photo'), async (req, res) => {
  console.log(req.file);
  res.sendStatus(200);
  // const foto = await db.savePhoto(req.body);
  // if (foto) res.location(`/fotos/${foto._id}`).status(201).send("Foto subida");
  // else res.status(400).send("Error al subir una foto.");
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
