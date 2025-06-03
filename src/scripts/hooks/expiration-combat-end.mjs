import { EXPIRATION_TYPES } from "../constants.mjs";
import { effectShouldExpireOn, isEffectTemporary, expireEffect } from "../utils.mjs";

export default function init() {
  Hooks.on("deleteCombat", onDeleteCombat);
}

function onCombatEnd(combat) {

  // Only the active GM processes
  if (!game.users.activeGM?.isSelf) return;

  // We ignore actors that do not take part in the combat
  const actors = combat.combatants.map((x) => x.actor).filter((x) => x != null);

  for (const actor of actors) {
    const effects = actor.appliedEffects;
    for (const effect of effects) {
      if (!isEffectTemporary(effect)) continue;
      if (!effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.COMBAT_END)) continue;

      expireEffect(effect, EXPIRATION_TYPES.COMBAT.COMBAT_END);
    }
  }
}

function onDeleteCombat(combat, options, userId) {
  // Ignore combats that have not started (prevents accidents)
  if (!combat.started) return;

  onCombatEnd(combat);
}
