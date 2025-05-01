// Importa Supertest para hacer peticiones HTTP
const request = require("supertest");

// Importa expect desde Chai para realizar validaciones
const { expect } = require("chai");

// Describe el grupo de pruebas para la ruta de progreso del usuario
describe("GET /apiV1/usuarios/:idz/progreso", function () {
  // Aumenta el tiempo máximo permitido por prueba (en caso de demoras del servidor)
  this.timeout(10000);

  // URL base de la API
  const baseUrl = "https://desarrollar-api-documentada.onrender.com";

  // Variables para almacenar el token y el ID del usuario autenticado
  let token;
  let userId;

  // Hook que se ejecuta antes de las pruebas: hace login y obtiene token + ID
  before(async () => {
    const loginRes = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send({
        email: "luancuevascr@ittepic.edu.mx",
        password: "LAYCC",
      });

    // Asegura que el login fue exitoso
    expect(loginRes.status).to.equal(200);

    // Almacena el token y el ID para usarlos en las pruebas
    token = loginRes.body.token;
    userId = loginRes.body.userId;
  });

  // Prueba: debe obtener correctamente el progreso del jugador
  it("Debe obtener el progreso del jugador exitosamente", async () => {
    const res = await request(baseUrl)
      .get(`/apiV1/usuarios/${userId}/progreso`)
      .set("Authorization", `Bearer ${token}`);

    // Verifica que la respuesta fue exitosa
    expect(res.status).to.equal(200);

    // Asegura que el cuerpo tiene el formato esperado
    expect(res.body).to.have.property("message");
    expect(res.body).to.have.property("data");

    // Verifica que los campos 'experiencia' y 'nivel' están presentes en el objeto data
    expect(res.body.data).to.have.property("experiencia");
    expect(res.body.data).to.have.property("nivel");
  });

  // Prueba: debe retornar 404 si el usuario no existe
  it("Debe devolver 404 si el usuario no existe", async () => {
    const fakeId = "660fe9b13c8c999999999999"; // ID inválido

    const res = await request(baseUrl)
      .get(`/apiV1/usuarios/${fakeId}/progreso`)
      .set("Authorization", `Bearer ${token}`);

    // Verifica que devuelve un error 404
    expect(res.status).to.equal(404);

    // El cuerpo debe tener una propiedad 'error' con mensaje informativo
    expect(res.body).to.have.property("error").that.includes("Usuario no encontrado");
  });
});