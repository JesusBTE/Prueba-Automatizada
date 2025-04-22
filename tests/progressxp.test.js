const request = require("supertest");
const { expect } = require("chai");

describe("PUT /apiV1/usuarios/:id/progreso", function () {
  this.timeout(10000); // Tiempo extra por si el servidor tarda

  const baseUrl = "https://desarrollar-api-documentada.onrender.com";
  let token;
  let userId;

  // Se ejecuta antes de las pruebas para hacer login y obtener el token
  before(async () => {
    const loginRes = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send({
        email: "luancuevascr@ittepic.edu.mx",
        password: "LAYCC"
      })
      .set("Accept", "application/json");

    expect(loginRes.status).to.equal(200);
    token = loginRes.body.token;
    userId = loginRes.body.userId;
  });

  // Prueba que actualiza la experiencia exitosamente
  it("Debe actualizar la experiencia del jugador exitosamente", async () => {
    // Primero obtenemos la experiencia actual del jugador
    const getProgressRes = await request(baseUrl)
      .get(`/apiV1/usuarios/${userId}/progreso`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");
    
    expect(getProgressRes.status).to.equal(200);

    const currentExperience = getProgressRes.body.data.experiencia; // Experiencia previa del usuario
    const experienceToAdd = 100; // Experiencia a agregar

    // Realiza la actualización de la experiencia
    const res = await request(baseUrl)
      .put(`/apiV1/usuarios/${userId}/progreso`)
      .set("Authorization", `Bearer ${token}`)
      .send({ experiencia: experienceToAdd })
      .set("Accept", "application/json");

    // Asegúrate de que la respuesta tenga la experiencia actualizada correctamente
    expect(res.status).to.equal(200);

    // Calcula la nueva experiencia como la previa más la nueva
    const expectedExperiencia = currentExperience + experienceToAdd;
    expect(res.body.data).to.have.property("experiencia", expectedExperiencia);
  });

  // Error 422 cuando se envía un valor de experiencia inválido
  it("Debe devolver 422 si la experiencia es inválida", async () => {
    const res = await request(baseUrl)
      .put(`/apiV1/usuarios/${userId}/progreso`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        experiencia: -100 // Valor negativo no permitido
      })
      .set("Accept", "application/json");

    expect(res.status).to.equal(422); // Cambiado de 400 a 422
    expect(res.body).to.have.property("error", "La experiencia debe ser un número entero positivo");
  });

  // Error 400 si no se envía el campo 'experiencia'
  it("Debe devolver 400 si no se envía experiencia", async () => {
    const res = await request(baseUrl)
      .put(`/apiV1/usuarios/${userId}/progreso`)
      .set("Authorization", `Bearer ${token}`)
      .send({}) // Sin el campo 'experiencia'
      .set("Accept", "application/json");

    expect(res.status).to.equal(400); // No cambia el código a 400
    expect(res.body).to.have.property("error", "No se proporcionó experiencia para actualizar");
  });
});