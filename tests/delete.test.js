// Importa Supertest para hacer peticiones HTTP al servidor
const request = require("supertest");

// Importa 'expect' de Chai para realizar las validaciones
const { expect } = require("chai");

describe("Debe eliminar al usuario", function () {
  // Aumenta el tiempo máximo de espera para las peticiones 
  this.timeout(10000);

  // URL base de la API desplegada
  const baseUrl = "https://api-players-4mub.onrender.com";

  // ID del usuario que se va a eliminar
  const userId = "89sKndv3GaiCjiet3636";

  // Token de autenticación para las peticiones protegidas
  let token;

  // Antes de ejecutar los tests, inicia sesión para obtener el token
  before(async () => {
    const loginData = {
      email: "juanss@gmail.com",
      password: "123456",
    };

    // Petición POST para login
    const resLogin = await request(baseUrl)
      .post("/apiV1/usuarios/login")
      .send(loginData)
      .set("Accept", "application/json");

    // Almacena el token para usarlo en las siguientes peticiones
    token = resLogin.body.token;
  });

  // Eliminar correctamente un usuario existente
  it("Debe eliminar correctamente al usuario existente", async () => {
    const res = await request(baseUrl)
      .delete(`/apiV1/usuarios/${userId}`) 
      .set("Authorization", `Bearer ${token}`) // Autenticación
      .set("Accept", "application/json");

    // Mostrar respuesta en consola (útil para depuración)
    console.log("Respuesta al eliminar:", res.body);

    // Validaciones
    expect(res.status).to.equal(200); // Estado esperado: OK
    expect(res.body.data[0].message).to.equal(
      "Usuario eliminado correctamente"
    );
  });

  // Intenta eliminar al mismo usuario otra vez
  it("Debe retornar 404 si el usuario ya fue eliminado", async () => {
    const res = await request(baseUrl)
      .delete(`/apiV1/usuarios/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).to.equal(404); // No encontrado
    expect(res.body.error).to.equal("Usuario no encontrado");
  });

  // Intentar eliminar sin proporcionar un ID
  it("Debe retornar 400 si no se proporciona un ID", async () => {
    const res = await request(baseUrl)
      .delete(`/apiV1/usuarios/`) // Ruta incompleta
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    // Dependiendo retornar error 400 o 404
    expect(res.status).to.satisfy((status) => status === 400 || status === 404);
  });
});
