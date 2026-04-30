/**
 * Jest tests for the Express server
 * These tests are run by the CI/CD pipeline to validate the application.
 */

const request = require("supertest");
const app = require("../src/index");

describe("Express Server", () => {
  describe("GET /", () => {
    it("should return 200 with a greeting message", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Hello, GitHub Actions!");
    });

    it("should include version and environment in response", async () => {
      const response = await request(app).get("/");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /health", () => {
    it("should return 200 with healthy status", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "healthy" });
    });
  });

  describe("Unknown routes", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/unknown-route");
      expect(response.status).toBe(404);
    });
  });
});
