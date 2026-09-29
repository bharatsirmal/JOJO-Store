import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import * as fs from "fs";
import { describe, beforeAll, afterAll, beforeEach, it, expect } from "vitest";

let testEnv: RulesTestEnvironment;

describe("Firestore Security Rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "jojo-store-test",
      firestore: { host: "127.0.0.1", port: 8080,
        rules: fs.readFileSync("../firestore.rules", "utf8"),
      },
    });
  });

  afterAll(async () => {
    if (testEnv) { await testEnv.cleanup(); }
  });

  beforeEach(async () => {
    if (testEnv) { await testEnv.clearFirestore(); }
  });

  it("Customer can read their own profile but not others", async () => {
    const alice = testEnv.authenticatedContext("alice", { role: "customer" });
    const bob = testEnv.unauthenticatedContext();
    
    // Setup Alice's document using admin
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("alice").set({ name: "Alice", role: "customer" });
    });

    // Alice can read her own doc
    await assertSucceeds(alice.firestore().collection("users").doc("alice").get());
    
    // Alice cannot read Bob's doc
    await assertFails(alice.firestore().collection("users").doc("bob").get());

    // Unauthenticated Bob cannot read Alice's doc
    await assertFails(bob.firestore().collection("users").doc("alice").get());
  });

  it("Admin can read any profile", async () => {
    const admin = testEnv.authenticatedContext("admin_user", { role: "admin" });
    
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("alice").set({ name: "Alice", role: "customer" });
    });

    await assertSucceeds(admin.firestore().collection("users").doc("alice").get());
  });

  it("Users cannot tamper with their role field", async () => {
    const alice = testEnv.authenticatedContext("alice", { role: "customer" });

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("alice").set({ name: "Alice", role: "customer" });
    });

    // Alice tries to update her name (allowed)
    await assertSucceeds(alice.firestore().collection("users").doc("alice").update({ name: "Alice 2" }));
    
    // Alice tries to update her role (denied)
    await assertFails(alice.firestore().collection("users").doc("alice").update({ role: "admin" }));
  });
});


