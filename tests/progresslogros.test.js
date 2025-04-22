const request = require("supertest");
const { expect } = require("chai");

describe("POST /apiV1/usuarios/:id/addLogros", function () {
  this.timeout(10000); // Tiempo extra por si el servidor tarda

  const baseUrl = "https://desarrollar-api-documentada.onrender.com";
  let token;
  let userId;

  // Se ejecuta antes de cada prueba para hacer login y obtener el token
  before(async () => {
    const loginRes = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send({
        email: "luancuevascr@ittepic.edu.mx",
        password: "LAYCC"
      });

    expect(loginRes.status).to.equal(200);
    token = loginRes.body.token;
    userId = loginRes.body.userId; // Guardamos el userId para usarlo en la prueba
  });

  // Agregar logros a un jugador
  it("✅ Debe agregar logros al jugador correctamente", async () => {
    const logros = [
      { 
        "nombre": "El elixir de la Vida",
        "descripcion": "Toma tu primer poción de curación.",
      }
    ];

    const res = await request(baseUrl)
      .post(`/apiV1/usuarios/${userId}/addLogros`)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json") // Asegúrate de incluir el tipo de contenido
      .send(logros); // Enviar el array de logros

    // Verifica que la respuesta sea exitosa
    expect(res.status).to.equal(200);

    // Verifica que el mensaje incluya "Logros agregados correctamente"
    expect(res.body).to.have.property("message").that.includes("Logros agregados correctamente");

    // Verifica que los logros estén en la respuesta
    expect(res.body).to.have.property("logros").that.is.an("array");
    expect(res.body.logros).to.have.lengthOf(1); // Asegúrate de que haya solo 1 logro

    // Verifica que el logro tiene las propiedades correctas
    expect(res.body.logros[0]).to.have.property("id");
    expect(res.body.logros[0]).to.have.property("nombre", "El elixir de la Vida");
    expect(res.body.logros[0]).to.have.property("descripcion", "Toma tu primer poción de curación.");
  });

  it("❌ Debe devolver 400 si no se envía un array de logros", async () => {
    const res = await request(baseUrl)
      .post(`/apiV1/usuarios/${userId}/addLogros`)
      .set("Authorization", `Bearer ${token}`)
      .send({}); // No es un array, así que debería fallar
  
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error", "Debes enviar un array de logros en el body");
  });
  
});