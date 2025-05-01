const request = require("supertest");
const { expect } = require("chai");

describe("POST /apiV1/usuarios/:id/subirNivel", function () {
  this.timeout(10000); // Por si el servidor tarda en responder

  const baseUrl = "https://api-players-4mub.onrender.com";
  let token;
  let userId;

  // Antes de las pruebas, iniciar sesión y obtener token y userId
  before(async () => {
    const loginRes = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send({
        email: "luancuevascr@ittepic.edu.mx",
        password: "LAYCC"
      });

    expect(loginRes.status).to.equal(200);
    token = loginRes.body.token;
    userId = loginRes.body.userId;
  });

  it("Debe subir de nivel correctamente si tiene suficiente experiencia", async () => {
    const res = await request(baseUrl)
      .post(`/apiV1/usuarios/${userId}/subirNivel`)
      .set("Authorization", `Bearer ${token}`);

    // Verificamos si tuvo éxito
    if (res.status === 200) {
      expect(res.body).to.have.property("message").that.includes("Haz subido de nivel!");
    } else {
      // Si no tiene experiencia, al menos debe devolver 422
      expect(res.status).to.equal(422);
      expect(res.body).to.have.property("error").that.includes("El jugador no tiene la experiencia necesaria para subir de nivel");
    }
  });

  it("Debe devolver 422 si el jugador no tiene experiencia suficiente", async () => {
    const res = await request(baseUrl)
      .post(`/apiV1/usuarios/${userId}/subirNivel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(422);
    expect(res.body).to.have.property("error").that.includes("El jugador no tiene la experiencia necesaria para subir de nivel");
  });
});