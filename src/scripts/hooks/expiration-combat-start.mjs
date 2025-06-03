import { EXPIRATION_TYPES } from "../constants.mjs";
import { effectShouldExpireOn, isEffectTemporary, expireEffect } from "../utils.mjs";

export default function init() {
  Hooks.on("updateCombat", onUpdateCombat);
}

function onCombatStart(combat) {
  // Only the active GM processes
  if (!game.users.activeGM?.isSelf) return;

  // We ignore actors that do not take part in the combat
  const actors = combat.combatants.map((x) => x.actor).filter((x) => x != null);
  for (const actor of actors) {
    const effects = actor.appliedEffects;
    for (const effect of effects) {
      if (!isEffectTemporary(effect)) continue;
      if (!effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.COMBAT_START)) continue;

      expireEffect(effect, EXPIRATION_TYPES.COMBAT.COMBAT_START);
    }
  }
}

function onUpdateCombat(combat, changed, options, userId) {
  // XXX: We might be able to replace this with the combatStart hook
  // because that one also might only run on **a** GM client

  // When a combat is started, an update occurs with round 1 and turn 0
  // Advancing back to round 1 and turn 0 does not trigger this as either round OR turn is missing from the update data
  if ((changed.round === 1) && (changed.turn === 0)) {
    onCombatStart(combat);
  }
}
