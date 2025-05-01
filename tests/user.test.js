// Importa Supertest para realizar peticiones HTTP a la API
const request = require("supertest");

// Importa expect de Chai para hacer las pruebas
const { expect } = require("chai");

describe("API de Usuarios - Obtener Usuario por ID", function () {
  // Establece un tiempo máximo de 10 segundos por cada prueba
  this.timeout(10000); 

  // Define la URL base de la API desplegada en Render
  const baseUrl = "https://api-players-4mub.onrender.com";

  // Variable para guardar el token de autenticación
  let token;

  // Se ejecuta antes de las pruebas para iniciar sesión y obtener el token
  before(async () => {
    const datosLogin = {
      email: "juan@gmail.com",
      password: "123456",
    };

    // Realiza login para obtener un token válido
    const resLogin = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send(datosLogin)
      .set("Accept", "application/json");

    // Guarda el token recibido para usarlo en las pruebas posteriores
    token = resLogin.body.token;
  });

  // Prueba que obtiene un usuario por ID usando un token válido
  it("Debe obtener el usuario correctamente por ID", async () => {
    const userId = "kTkdfjtNWw3T5U6AJhVJ"; // ID del usuario a consultar

    // Realiza una petición GET con el token de autorización
    const res = await request(baseUrl)
      .get(`/apiV1/usuarios/${userId}`)
      .set("Authorization", `Bearer ${token}`) // Envía el token en los headers
      .set("Accept", "application/json");

    // Muestra la respuesta en consola para verificar visualmente
    console.log("Respuesta de obtener usuario:", res.body);

    // Verifica que el estado HTTP sea 200 (OK)
    expect(res.status).to.equal(200);

    // Verifica que la respuesta tenga la propiedad `data` y que sea un array
    expect(res.body).to.have.property("data").that.is.an("array");

    // Verifica que el primer objeto dentro del array tenga propiedades esperadas
    expect(res.body.data[0]).to.have.property("nombre");
    expect(res.body.data[0]).to.have.property("email");
  });

  // Prueba que falla cuando no se proporciona un token
  it("Debe fallar si no se proporciona un token", async () => {
    const userId = "kTkdfjtNWw3T5U6AJhVJ"; // Mismo ID que antes

    // Realiza una petición sin el token de autorización
    const res = await request(baseUrl)
      .get(`/apiV1/usuarios/${userId}`)
      .set("Accept", "application/json");

    // Verifica que el estado HTTP sea 403 (prohibido)
    expect(res.status).to.equal(403);

    // Verifica que el mensaje de error sea el esperado
    expect(res.body).to.have.property("message", "No autorizado");
  });
});
