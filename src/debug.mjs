import { EXPIRATION_TYPES, MODULE_ID, MODULE_TITLE } from "./scripts/constants.mjs";
import { log } from "./scripts/utils.mjs";

Hooks.on("init", () => {
  log("Debug Mode enabled!");
});

Hooks.on("quenchReady", (quench) => {
  quench.registerBatch(`${MODULE_ID}.validation.EXPIRATION_TYPES`, (context) => {
    const { describe, it, assert } = context;

    describe("EXPIRATION_TYPES", function () {
      const enumGroups = {
        SYSTEM: EXPIRATION_TYPES.SYSTEM,
        MODULE: EXPIRATION_TYPES.MODULE,
      };

      for (const [groupName, packageValues] of Object.entries(enumGroups)) {
        for (const [subKey, values] of Object.entries(packageValues)) {
          for (const [enumKey, enumValue] of Object.entries(values)) {
            it(`${groupName}.${subKey}.${enumKey} = "${enumValue}"`, function () {
              assert.ok(
                typeof enumValue === "string",
                `Value should be a string, got: ${typeof enumValue}`,
              );

              const parts = enumValue.split(".").filter(Boolean);

              assert.ok(
                parts.length === 2,
                `Value "${enumValue}" should have two non-empty parts separated by a '.'`,
              );
            });
          }
        }
      }
    });
  }, {
    displayName: `${MODULE_TITLE}: EXPIRATION_TYPES Validation`,
  });
});
