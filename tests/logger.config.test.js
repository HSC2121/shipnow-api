
import { expect } from "chai";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import logger from "../src/config/logger.config.js";

describe("Winston Logger Configuration", () => {
  it("should configure both required log files", () => {
    const filenames = logger.transports
      .filter((transport) => transport.name === "file")
      .map((transport) => transport.filename);

    expect(filenames).to.include("error.log");
    expect(filenames).to.include("combined.log");
  });

  it("should restrict console logging to development", () => {
    expect(process.env.NODE_ENV).to.equal("test");

    const consoleTransports = logger.transports.filter(
      (transport) => transport.name === "console"
    );

    expect(consoleTransports).to.have.lengthOf(0);
  });

  it("should write JSON logs and filter error.log", () => {
    const temporaryDirectory = mkdtempSync(
      join(tmpdir(), "shipnow-logger-")
    );

    try {
      const loggerUrl = pathToFileURL(
        resolve("src/config/logger.config.js")
      ).href;

      const script = `
        import { once } from "node:events";
        import logger from ${JSON.stringify(loggerUrl)};

        const finished = once(logger, "finish");

        logger.error("Automated error verification", {
          test: true,
        });

        logger.info("Automated info verification", {
          test: true,
        });

        logger.end();
        await finished;
      `;

      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", script],
        {
          cwd: temporaryDirectory,
          env: {
            ...process.env,
            NODE_ENV: "test",
            LOG_LEVEL: "debug",
          },
          encoding: "utf8",
          timeout: 10000,
        }
      );

      expect(result.status, result.stderr).to.equal(0);

      const readEntries = (filename) =>
        readFileSync(
          join(temporaryDirectory, "logs", filename),
          "utf8"
        )
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));

      const combined = readEntries("combined.log");
      const errors = readEntries("error.log");

      expect(
        combined.some((entry) => entry.level === "error")
      ).to.equal(true);

      expect(
        combined.some((entry) => entry.level === "info")
      ).to.equal(true);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0].level).to.equal("error");
      expect(errors[0].test).to.equal(true);
      expect(errors[0].timestamp).to.be.a("string");

      expect(result.stdout).not.to.include(
        "Automated error verification"
      );
      expect(result.stdout).not.to.include(
        "Automated info verification"
      );
    } finally {
      rmSync(temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  });
});
