import assert from "node:assert/strict";
import test from "node:test";

import { formatTaskMessage } from "../src/task-log";

test("interpolates %%key%% tokens from values", () => {
  assert.equal(
    formatTaskMessage("Added %%name%% as a contact at %%company%%", {
      name: "Bob",
      company: "Initech",
    }),
    "Added Bob as a contact at Initech",
  );
});

test("stringifies non-string values", () => {
  assert.equal(
    formatTaskMessage("Moved %%count%% deals to %%stage%%", { count: 3, stage: "Won" }),
    "Moved 3 deals to Won",
  );
});

test("leaves tokens in place when the key is missing or nullish", () => {
  assert.equal(
    formatTaskMessage("Added %%name%% as a contact", { name: null }),
    "Added %%name%% as a contact",
  );
  assert.equal(formatTaskMessage("Added %%name%%", {}), "Added %%name%%");
});

test("returns the template untouched without values", () => {
  assert.equal(formatTaskMessage("Refreshed the dashboard"), "Refreshed the dashboard");
});

test("interpolates repeated tokens", () => {
  assert.equal(
    formatTaskMessage("%%name%% emailed — filed %%name%%'s reply", { name: "Ada" }),
    "Ada emailed — filed Ada's reply",
  );
});
