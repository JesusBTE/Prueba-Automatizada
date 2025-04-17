// Importa la librería Supertest para hacer peticiones HTTP a la API
const request = require("supertest");

// Importa expect desde Chai para hacer las pruebas
const { expect } = require("chai");

describe("API de Usuarios y Progresos en Render", function () {
  // Establece un tiempo máximo de 10 segundos por prueba
  this.timeout(10000);

  // URL base de la API desplegada en Render
  const baseUrl = "https://desarrollar-api-documentada.onrender.com";

  // Verifica que un usuario pueda registrarse correctamente
  it("Debe registrar el usuario", async () => {
    const nuevoUsuario = {
      nombre: "Juan Pérez",
      email: "juanpepes@gmail.com",
      password: "123456",
      confirmPassword: "123456",
      edad: 20,
      nivel: 1,
      experiencia: 0,
    };

    // Muestra en consola los datos enviados
    console.log("Enviando datos:", nuevoUsuario);

    const res = await request(baseUrl)
      .post("/apiV1/usuarios/register")
      .send(nuevoUsuario)
      .set("Accept", "application/json");

    // Muestra en consola la respuesta recibida
    console.log("Respuesta de la API:", res.body);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.be.an("array");

    const usuario = res.body.data[0];

    // Se valida que exista el accessKey
    expect(usuario).to.have.property("accessKey");
  });
});
