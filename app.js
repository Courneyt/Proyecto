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

app.get("/wines", async (req, res) => {
  let params = {
    desde: req.query.desde,
    hasta: req.query.hasta,
    tipos: req.query.tipos.split(","),
    busqueda: req.query.busqueda,
  };
  res.json(await db.find(params));
});

app.get("/wines/:id", async (req, res) => {
  const wine = await db.findById(req.params.id);
  if (wine) res.json(wine);
  else res.status(404).send(`No existe un vino con ID=${req.params.id}.`);
});

app.post("/wines", async (req, res) => {
  const wine = await db.save(req.body);
  if (wine) res.location(`/wines/${wine._id}`).status(201).send("Vino creado");
  else res.status(400).send("Valores incorrectos para crear un vino.");
});

app.patch("/wines/:id", async (req, res) => {
  const updatedWine = await db.rate(req.params.id, req.body.score);
  if (updatedWine) res.sendStatus(204);
  else res.status(404).send(`No existe un vino con ID=${req.params.id}.`);
});

app.delete("/wines/:id", async (req, res) => {
  if (await db.delete(req.params.id)) res.sendStatus(204);
  else res.status(404).send(`No existe un vino con ID=${req.params.id}.`);
});

db.connect().then(() => {
  console.log("Conectado a la base de datos.");
  app.listen(PORT, () =>
    console.log(`Servidor escuchando en el puerto ${PORT}.`)
  );
});
