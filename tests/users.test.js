// Importa Supertest para hacer peticiones HTTP a la API
const request = require("supertest");

// Importa expect desde Chai para realizar las pruebas
const { expect } = require("chai");

describe("Debe obtener todos los usuarios", function () {
  // Define un tiempo máximo de 10 segundos para cada prueba
  this.timeout(10000);

  // URL base de la API desplegada en Render
  const baseUrl = "https://api-players-4mub.onrender.com";

  // Variable que almacenará el token de autenticación
  let token;

  // Sse ejecuta antes de las pruebas para iniciar sesión y obtener el token
  before(async () => {
    const datosLogin = {
      email: "juan@gmail.com",
      password: "123456",
    };

    // Realiza una petición de login para obtener un token válido
    const resLogin = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send(datosLogin)
      .set("Accept", "application/json");

    // Almacena el token recibido para usarlo en las pruebas
    token = resLogin.body.token;
  });

  // Prueba que verifica que se pueden obtener todos los usuarios
  it("Debe obtener todos los usuarios correctamente", async () => {
    // Realiza una petición GET con el token de autorización
    const res = await request(baseUrl)
      .get(`/apiV1/usuarios`)
      .set("Authorization", `Bearer ${token}`) // Header con token
      .set("Accept", "application/json");

    // Muestra en consola la respuesta para verificación visual
    console.log("Respuesta getAll:", res.body);

    // Verifica que el estado HTTP sea 200 (OK)
    expect(res.status).to.equal(200);

    // Verifica que el cuerpo de la respuesta sea un arreglo
    expect(res.body).to.be.an("array");

    // Si hay usuarios, verifica propiedades específicas del primer usuario
    if (res.body.length > 0) {
      expect(res.body[0]).to.have.property("id");
      expect(res.body[0]).to.have.property("nombre");
      expect(res.body[0]).to.have.property("email");
      expect(res.body[0]).to.not.have.property("password"); // El password no debe ser retornado
    }
  });

  // Prueba que verifica que la solicitud falle sin token
  it("Debe fallar si no se proporciona token", async () => {
    // Realiza la misma petición GET pero sin token
    const res = await request(baseUrl)
      .get(`/apiV1/usuarios`)
      .set("Accept", "application/json");

    // Verifica que el estado sea 403
    expect(res.status).to.equal(403);

    // Verifica que el mensaje de error sea el esperado
    expect(res.body).to.have.property("message", "No autorizado");
  });
});
