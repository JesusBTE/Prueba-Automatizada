const request = require("supertest");
const { expect } = require("chai");

describe("API de Solicitudes de Amistad", function () {
  this.timeout(10000);
  const baseUrl = "https://api-players-4mub.onrender.com/apiV1/usuarios";
  let authToken;
  const userId = "2wwM9v40g76hX5eYSkWc"; // ID fijo del usuario emisor
  const otroUsuarioId = "dOBLBDHzC4ApzyyWpijX"; // ID fijo del usuario receptor
  const idInexistente = "00000000000000000000000"; // ID que no existe
  let solicitudId;

  before(async () => {
    // Login para obtener token
    const res = await request(baseUrl.replace('/apiV1/usuarios', ''))
      .post("/apiV1/usuarios/login")
      .send({
        email: "casaamba@gmail.com",
        password: "123456"
      });
    authToken = res.body.token;
  });

  after(async () => {
    // Limpieza después de todas las pruebas
    if (solicitudId) {
      await request(baseUrl)
        .delete(`/solicitud/${solicitudId}`)
        .set("Authorization", `Bearer ${authToken}`);
    }
  });

  describe("POST /solicitud", () => {
    it("Debe crear una solicitud exitosamente", async () => {
      const res = await request(baseUrl)
        .post("/solicitud")
        .send({
          de_usuario_id: userId,
          para_usuario_id: otroUsuarioId
        })
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.data).to.include({
        de_usuario_id: userId,
        para_usuario_id: otroUsuarioId,
        estado: "pendiente"
      });
      solicitudId = res.body.data.id;
    });

    it("Debe fallar (403) si no se envía token", async () => {
      const res = await request(baseUrl)
        .post("/solicitud")
        .send({
          de_usuario_id: userId,
          para_usuario_id: otroUsuarioId
        });
      
      expect(res.status).to.equal(403);
      expect(res.body).to.eql({ message: "No autorizado" });
    });

    it("Debe fallar (403) si el token no coincide con emisor", async () => {
      // Usamos un ID de emisor diferente al del token
      const res = await request(baseUrl)
        .post("/solicitud")
        .send({
          de_usuario_id: "otro_id_diferente", 
          para_usuario_id: otroUsuarioId
        })
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).to.equal(403);
      expect(res.body).to.eql({ 
        error: "No tienes permiso para enviar esta solicitud" 
      });
    });

    it("Debe fallar (404) si el receptor no existe", async () => {
      const res = await request(baseUrl)
        .post("/solicitud")
        .send({
          de_usuario_id: userId,
          para_usuario_id: idInexistente
        })
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).to.equal(404);
      expect(res.body).to.eql({ 
        error: "Usuario emisor o receptor no encontrado" 
      });
    });
  });

  describe("GET /obtener/solicitud", () => {
    it("Debe obtener todas las solicitudes", async () => {
      const res = await request(baseUrl)
        .get("/obtener/solicitud")
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.friendRequests).to.be.an("array");
    });

    it("Debe fallar (403) sin token", async () => {
      const res = await request(baseUrl)
        .get("/obtener/solicitud");
      
      expect(res.status).to.equal(403);
      expect(res.body).to.eql({ message: "No autorizado" });
    });
  });

  describe("GET /solicitud/{id}", () => {
    it("Debe obtener una solicitud por ID", async () => {
      const res = await request(baseUrl)
        .get(`/solicitud/${solicitudId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.deep.include({
        de_usuario_id: userId,
        para_usuario_id: otroUsuarioId,
        estado: "pendiente"
      });
    });

    it("Debe fallar (404) si la solicitud no existe", async () => {
      const res = await request(baseUrl)
        .get(`/solicitud/${idInexistente}`)
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).to.equal(404);
    });

    it("Debe fallar (403) sin token", async () => {
      const res = await request(baseUrl)
        .get(`/solicitud/${solicitudId}`);
      
      expect(res.status).to.equal(403);
      expect(res.body).to.eql({ message: "No autorizado" });
    });
  });

  describe("GET /solicitud/usuario/{id}", () => {
    it("Debe obtener solicitudes de un usuario", async () => {
      const res = await request(baseUrl)
        .get(`/solicitud/usuario/${otroUsuarioId}`)
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array");
    });

    it("Debe fallar (404) si el usuario no existe", async () => {
      const res = await request(baseUrl)
        .get(`/solicitud/usuario/${idInexistente}`)
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).to.equal(404);
      expect(res.body).to.eql({ error: "Usuario no encontrado" });
    });

    it("Debe fallar (403) sin token", async () => {
      const res = await request(baseUrl)
        .get(`/solicitud/usuario/${otroUsuarioId}`);
      
      expect(res.status).to.equal(403);
      expect(res.body).to.eql({ message: "No autorizado" });
    });
  });

  describe("DELETE /solicitud/{id}", () => {
    it("Debe eliminar una solicitud", async () => {
      const res = await request(baseUrl)
        .delete(`/solicitud/${solicitudId}`)
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(res.status).to.equal(200);
      solicitudId = null; // Marcamos como eliminada
    });

    it("Debe fallar (401) sin token", async () => {
      // Primero creamos una solicitud para intentar borrarla
      const createRes = await request(baseUrl)
        .post("/solicitud")
        .send({
          de_usuario_id: userId,
          para_usuario_id: otroUsuarioId
        })
        .set("Authorization", `Bearer ${authToken}`);
      
      const tempId = createRes.body.data.id;
      
      const res = await request(baseUrl)
        .delete(`/solicitud/${tempId}`);
      
      expect(res.status).to.equal(403);
      expect(res.body).to.eql({ message: "No autorizado" });

      // Limpiamos
      await request(baseUrl)
        .delete(`/solicitud/${tempId}`)
        .set("Authorization", `Bearer ${authToken}`);
    });
  });
});