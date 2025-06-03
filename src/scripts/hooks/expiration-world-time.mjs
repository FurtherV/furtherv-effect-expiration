import { EXPIRATION_TYPES } from "../constants.mjs";
import { effectShouldExpireOn, expireEffect, isEffectTemporary } from "../utils.mjs";

export default function init() {
  Hooks.on("updateWorldTime", onUpdateWorldTime);
}

/**
 * @param {number} newWorldTime
 * @param {number} timeDelta
 * @param {Object} options
 * @param {number} userId
 */
function onUpdateWorldTime(newWorldTime, timeDelta, options, userId) {
  // Only the active GM processes
  if (!game.users.activeGM?.isSelf) return;

  // Only process with time actually advanced into the future (0 is fine as well since advancing turns is an update with 0)
  if (timeDelta < 0) return;

  // Only process tokens on the active scene
  const scene = game.scenes.active;
  if (!scene) return;

  // Grab all tokens and their actors
  const actors = scene.tokens.map((x) => x.actor).filter((x) => !!x);

  // Process all expired effects on those actors
  for (const actor of actors) {
    const effects = actor.appliedEffects;
    for (const effect of effects) {
      if (!isEffectTemporary(effect)) continue;
      if (!effectShouldExpireOn(effect, EXPIRATION_TYPES.TIME.DURATION_EXCEEDED)) continue;

      const remaining = effect.duration.remaining;
      if ((remaining != null) && (remaining <= 0)) {
        expireEffect(effect, EXPIRATION_TYPES.TIME.DURATION_EXCEEDED);
      }
    }
  }
}
