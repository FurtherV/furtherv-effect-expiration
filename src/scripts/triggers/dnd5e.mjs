import { EXPIRATION_TYPES } from "../constants.mjs";
import { effectShouldExpireOn, expireEffect, isEffectTemporary } from "../utils.mjs";

export default function init() {
  Hooks.on("dnd5e.restCompleted", restCompleted);
}

/* -------------------------------------------------- */

/**
 * @param {Actor} actor
 * @param {Object} result
 * @param {Object} config
 */
function restCompleted(actor, result, config) {
  console.debug({ actor, result, config });

  const isShortRest = !result.longRest;
  const isLongRest = result.longRest;
  const isNewDay = result.newDay;

  const effects = actor.appliedEffects;
  for (const effect of effects) {
    if (!isEffectTemporary(effect)) continue;

    if (effectShouldExpireOn(effect, EXPIRATION_TYPES.SYSTEM.DND5E.SHORT_REST) && isShortRest) {
      expireEffect(effect, EXPIRATION_TYPES.SYSTEM.DND5E.SHORT_REST);
      continue;
    }

    if (effectShouldExpireOn(effect, EXPIRATION_TYPES.SYSTEM.DND5E.LONG_REST) && isLongRest) {
      expireEffect(effect, EXPIRATION_TYPES.SYSTEM.DND5E.LONG_REST);
      continue;
    }

    if (effectShouldExpireOn(effect, EXPIRATION_TYPES.SYSTEM.DND5E.NEW_DAY) && isNewDay) {
      expireEffect(effect, EXPIRATION_TYPES.SYSTEM.DND5E.NEW_DAY);
    }
  }
}
