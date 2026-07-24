// Real Gmail SMTP sends are slow/unreliable inside a CI-style test run, so
// stub the transport rather than depend on a live third-party network call.
// The route, controller, and service (including Zod validation) still run
// for real — only the actual outbound email is mocked.
const sendMail = jest.fn().mockResolvedValue({});
jest.mock("nodemailer", () => ({
  createTransport: () => ({ sendMail }),
}));

import request from "supertest";
import app from "../../app";
import { connectTestDb, disconnectTestDb } from "./testDb";

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

describe("Contact Integration Tests", () => {
  it("POST /contact sends a message successfully", async () => {
    const res = await request(app).post("/api/v1/contact").send({
      name: "Integration Test",
      email: "inttest_contact@example.com",
      message: "This message was sent by an automated integration test.",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: "inttest_contact@example.com",
        subject: expect.stringContaining("Integration Test"),
      }),
    );
  });

  it("POST /contact rejects a missing name", async () => {
    const res = await request(app).post("/api/v1/contact").send({
      email: "inttest_contact@example.com",
      message: "no name provided",
    });

    expect(res.status).toBe(400);
  });

  it("POST /contact rejects an invalid email", async () => {
    const res = await request(app).post("/api/v1/contact").send({
      name: "Integration Test",
      email: "not-an-email",
      message: "invalid email provided",
    });

    expect(res.status).toBe(400);
  });

  it("POST /contact rejects a missing message", async () => {
    const res = await request(app).post("/api/v1/contact").send({
      name: "Integration Test",
      email: "inttest_contact@example.com",
    });

    expect(res.status).toBe(400);
  });
});
