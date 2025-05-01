// Importa Supertest para simular las peticiones HTTP
const request = require("supertest");

// Importa expect desde Chai para hacer las validaciones
const { expect } = require("chai");

describe("Debe Actualizar parcialmente la información del usuario", function () {
  // Aumenta el tiempo de espera en caso de que el servidor tarde en responder
  this.timeout(10000);

  // URL base de la API en Render
  const baseUrl = "https://api-players-4mub.onrender.com";

  // Variable donde se guardará el token
  let token;

  // ID del usuario que se va a actualizar parcialmente
  const userId = "umdcLw5dSHqtHnkN0yoX";

  // Antes de ejecutar los tests, realiza login para obtener el token
  before(async () => {
    const datosLogin = {
      email: "juan@gmail.com",
      password: "123456",
    };

    // Petición de login para obtener el token JWT
    const resLogin = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send(datosLogin)
      .set("Accept", "application/json");

    // Se almacena el token en una variable global para usar en las pruebas
    token = resLogin.body.token;
  });

  // Actualización parcial exitosa 
  it("Debe actualizar parcialmente los datos del usuario", async () => {
    const partialUpdate = {
      experiencia: 1600,
    };

    const res = await request(baseUrl)
      .patch(`/apiV1/usuarios/${userId}`)
      .send(partialUpdate)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    // Muestra la respuesta del servidor para revisar
    console.log("Respuesta PATCH parcial:", res.body);

    // Validaciones
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "message",
      "Datos actualizados correctamente."
    );
    expect(res.body.data[0]).to.have.property(
      "experiencia",
      partialUpdate.experiencia
    );
  });

  // Cuando no se envía ningún dato en el cuerpo
  it("Debe retornar 400 si no se envían datos", async () => {
    const res = await request(baseUrl)
      .patch(`/apiV1/usuarios/${userId}`)
      .send({})
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "error",
      "No se proporcionaron datos para actualizar"
    );
  });

  // Cuando se intenta actualizar un usuario que no existe
  it("Debe retornar 404 si el usuario no existe", async () => {
    const fakeId = "usuario_inexistente_patch";

    const res = await request(baseUrl)
      .patch(`/apiV1/usuarios/${fakeId}`)
      .send({ experiencia: 900 })
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("error", "Usuario no encontrado");
  });

  // Fallo cuando no se envía el token en la petición
  it("Debe retornar 403 si no se proporciona token de autenticación", async () => {
    const res = await request(baseUrl)
      .patch(`/apiV1/usuarios/${userId}`)
      .send({ experiencia: 1000 });

    expect(res.status).to.equal(403);
    expect(res.body).to.have.property("message", "No autorizado");
  });

  //Cuando el cuerpo de la petición no es un objeto válido
  it("Debe retornar 400 si el body no es un objeto válido", async () => {
    const res = await request(baseUrl)
      .patch(`/apiV1/usuarios/${userId}`)
      .send("no es un objeto json") // Cuerpo inválido
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json"); 

    // Dependiendo devuelve error 400 o 422
    expect(res.status).to.be.oneOf([400, 422]);
  });
});
