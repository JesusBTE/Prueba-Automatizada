// Importa Supertest para realizar peticiones HTTP
const request = require("supertest");

// Importa expect desde Chai para hacer validaciones
const { expect } = require("chai");

describe("Debe actualizar correctamente los datos del usuario", function () {
  // Aumenta el tiempo máximo permitido por prueba a 10 segundos
  this.timeout(10000);

  // Define la URL base de la API
  const baseUrl = "https://api-players-4mub.onrender.com";

  // Variable global para almacenar el token
  let token;

  // ID del usuario a actualizar
  const userId = "umdcLw5dSHqtHnkN0yoX";

  // Se ejecuta antes de los tests para hacer login y obtener token
  before(async () => {
    const loginRes = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send({ email: "juanperez@gmail.com", password: "123456" });

    // Se almacena el token para futuras peticiones protegidas
    token = loginRes.body.token;
  });

  // Actualización exitosa de los datos de un usuario
  it("Debe actualizar correctamente los datos del usuario", async () => {
    const res = await request(baseUrl)
      .put(`/apiV1/usuarios/${userId}`)
      .set("Authorization", `Bearer ${token}`) // Envía el token en el header
      .send({ nombre: "Juan Salas", experiencia: 1100 }); // Nuevos datos

    // Muestra en consola la respuesta del servidor
    console.log("Respuesta actualización:", res.body);

    // Verifica el código de estado
    expect(res.status).to.equal(200);

    // Verifica el mensaje de éxito
    expect(res.body).to.have.property(
      "message",
      "Datos actualizados correctamente."
    );

    // Valida que los datos modificados estén presentes en la respuesta
    expect(res.body.data[0]).to.have.property("nombre", "Juan Actualizado");
  });

  // Actualización con formato de email inválido
  it("Debe fallar si el formato del email es inválido", async () => {
    const res = await request(baseUrl)
      .put(`/apiV1/usuarios/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "correo_invalido" });

    // Verifica que retorne error por formato inválido
    expect(res.status).to.equal(422);
    expect(res.body).to.have.property("error");
  });

  // Falla si la contraseña enviada es muy corta
  it("Debe fallar si la contraseña es muy corta", async () => {
    const res = await request(baseUrl)
      .put(`/apiV1/usuarios/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "123" });

    // Espera error 422 por validación de longitud de contraseña
    expect(res.status).to.equal(422);
    expect(res.body).to.have.property("error");
  });

  // Fallo por usuario inexistente
  it("Debe retornar 404 si el usuario no existe", async () => {
    const res = await request(baseUrl)
      .put(`/apiV1/usuarios/usuario_no_existe`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Test Inexistente" });

    // Verifica que se devuelve un error 404 con mensaje apropiado
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("error", "Usuario no encontrado");
  });

  // Falla si no se envían datos a actualizar
  it("Debe retornar 400 si no se envían datos", async () => {
    const res = await request(baseUrl)
      .put(`/apiV1/usuarios/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({}); // Sin datos

    // Verifica código de error y mensaje descriptivo
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "error",
      "No se proporcionaron datos para actualizar"
    );
  });
});
