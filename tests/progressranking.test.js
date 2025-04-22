const request = require("supertest");
const { expect } = require("chai");

describe("GET /apiV1/usuarios/global/ranking", function () {
  this.timeout(10000); // Tiempo extra por si el servidor tarda

  const baseUrl = "https://desarrollar-api-documentada.onrender.com";
  let token;

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
  });

  // Obtener el ranking global
  it("Debe obtener el ranking global correctamente", async () => {
    const res = await request(baseUrl)
      .get("/apiV1/usuarios/global/ranking")
      .set("Authorization", `Bearer ${token}`); // Incluye el token en los headers

    // Verifica que la respuesta sea exitosa
    expect(res.status).to.equal(200);

    // Verifica que la respuesta sea un array
    expect(res.body).to.be.an("array");

    // Verifica que al menos un elemento tenga las propiedades esperadas
    expect(res.body[0]).to.have.property("id");
    expect(res.body[0]).to.have.property("nombre");
    expect(res.body[0]).to.have.property("nivel");
    expect(res.body[0]).to.have.property("experiencia");
    expect(res.body[0]).to.have.property("ranking");

  });
});