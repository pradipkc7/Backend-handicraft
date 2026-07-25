import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../../app";
import { connectTestDb, disconnectTestDb } from "./testDb";

let uploadedFilePath: string | undefined;

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
  if (uploadedFilePath) {
    const absolute = path.join(__dirname, "../../../", uploadedFilePath);
    fs.rm(absolute, { force: true }, () => {});
  }
});

describe("File Upload Integration Tests", () => {
  it("POST /file/upload rejects a request with no file attached", async () => {
    const res = await request(app).post("/api/v1/file/upload");

    expect(res.status).toBe(400);
  });

  it("POST /file/upload accepts an image and returns its stored path", async () => {
    const res = await request(app)
      .post("/api/v1/file/upload")
      .attach("image", Buffer.from("fake-image-bytes"), "integration-test.png");

    expect(res.status).toBe(200);
    expect(res.body.data.path).toMatch(/^\/uploads\//);
    uploadedFilePath = res.body.data.path;
  });
});
