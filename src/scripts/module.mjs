import "../less/furtherv-effect-expiration.less";

import { MODULE_TITLE } from "./constants.mjs";
import { log } from "./utils.mjs";
import * as hooks from "./hooks/_module.mjs";
import * as triggers from "./triggers/_module.mjs";

function init() {
  log(`Initializing ${MODULE_TITLE}.`);
  triggers.time();
  triggers.combat();

  if (game.system.id === "dnd5e") {
    triggers.dnd5e();
  }

}

// Initialize all hooks
Hooks.on("init", init);
for (const fn of Object.values(hooks)) {
  fn();
}
