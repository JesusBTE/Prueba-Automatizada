// app.js

const express = require("express");
const app = express();

// Middleware para parsear el body de las peticiones en formato JSON
app.use(express.json());




module.exports = app;
