// Importa la librería Supertest para hacer peticiones HTTP a la API
const request = require("supertest");

// Importa expect desde Chai para hacer las pruebas
const { expect } = require("chai");

describe("API de Login de Usuarios", function () {
  // Establece un tiempo máximo de 10 segundos por prueba 
  this.timeout(10000);

  // Define la URL base de la API desplegada en Render
  const baseUrl = "https://desarrollar-api-documentada.onrender.com";

  // Verifica que un usuario pueda iniciar sesión correctamente
  it("Debe iniciar sesión exitosamente", async () => {
    // Datos de inicio de sesión válidos 
    const datosLogin = {
      email: "juan@gmail.com",
      password: "123456",
    };

    // Realiza una petición POST con los datos de inicio de sesión
    const res = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send(datosLogin)
      .set("Accept", "application/json");

    // Imprime en consola la respuesta recibida en caso de éxito
    console.log("Login exitoso:", res.body);

    // Código 200, mensaje exitoso y presencia del userId
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Login exitoso");
    expect(res.body).to.have.property("userId");
  });

  // Verifica que el login falle con credenciales incorrectas
  it("Debe fallar el login con credenciales incorrectas", async () => {
    const datosInvalidos = {
      email: "juan@gmail.com",
      password: "contrasenaIncorrecta", // contraseña incorrecta
    };

    // Se realiza la petición con credenciales inválidas
    const res = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send(datosInvalidos)
      .set("Accept", "application/json");

    // Verifica que la respuesta sea 401 y contenga el mensaje de error adecuado
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("error", "Credenciales incorrectas");
  });

  // Verifica que falle si falta alguno de los campos obligatorios
  it("Debe fallar el login si falta el email o password", async () => {
    const datosIncompletos = {
      email: "juan@gmail.com",
      // No se envía la contraseña
    };

    // Se envían datos incompletos a la API
    const res = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send(datosIncompletos)
      .set("Accept", "application/json");

    // Verifica que devuelva código 400 y un mensaje de error 
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "error",
      "Email y contraseña son obligatorios"
    );
  });
});
