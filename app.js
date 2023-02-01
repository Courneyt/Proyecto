require("dotenv").config();
const db = require("./db.js");
const express = require("express");
const app = express();

const PORT = process.env.PORT || process.env.PUERTO || 80;

app.use(express.json());
app.use(express.static("public"));

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
  if (foto) res.json(wine);
  else res.status(404).send(`No existe una foto con ID=${req.params.id}.`);
});

app.post("/fotos", async (req, res) => {
  const foto = await db.savePhoto(req.body);
  if (foto) res.location(`/fotos/${foto._id}`).status(201).send("Foto subida");
  else res.status(400).send("Error al subir una foto.");
});

app.patch("/fotos/:id", async (req, res) => {
  const updatedFoto = await db.rate(req.params.id, req.body.score);
  if (updatedFoto) res.sendStatus(204);
  else res.status(404).send(`No existe una foto con ID=${req.params.id}.`);
});

app.delete("/fotos/:id", async (req, res) => {
  if (await db.delete(req.params.id)) res.sendStatus(204);
  else res.status(404).send(`No existe una foto con ID=${req.params.id}.`);
});

db.connect().then(() => {
  console.log("Conectado a la base de datos.");
  app.listen(PORT, () =>
    console.log(`Servidor escuchando en el puerto ${PORT}.`)
  );
});
