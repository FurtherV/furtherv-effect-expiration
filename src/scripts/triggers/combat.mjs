import { EXPIRATION_TYPES } from "../constants.mjs";
import { effectShouldExpireOn, expireEffect, getEffectOriginActor, isEffectTemporary } from "../utils.mjs";

export default function init() {
  Hooks.on("deleteCombat", deleteCombat);
  Hooks.on("updateCombat", updateCombat);
  Hooks.on("combatTurnChange", combatTurnChange);
}

/* -------------------------------------------------- */

function combatStart(combat) {
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

function combatEnd(combat) {

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

function deleteCombat(combat, options, userId) {
  // Ignore combats that have not started (prevents accidents)
  if (!combat.started) return;
  combatEnd(combat);
}

function updateCombat(combat, changed, options, userId) {
  // XXX: We might be able to replace this with the combatStart hook
  // because that one also might only run on **a** GM client

  // When a combat is started, an update occurs with round 1 and turn 0
  // Advancing back to round 1 and turn 0 does not trigger this as either round OR turn is missing from the update data
  if ((changed.round === 1) && (changed.turn === 0)) {
    combatStart(combat);
  }
}

/**
 * @param {Combat} combat
 * @param {CombatHistoryData} prior
 * @param {CombatHistoryData} current
 * @returns
 */
function combatTurnChange(combat, prior, current) {
  // Only the active GM processes
  if (!game.users.activeGM?.isSelf) return;

  // Ignore combats that have not started yet
  if (!combat.started) return;

  // We ignore actors that do not take part in the combat
  const actors = combat.combatants.map((x) => x.actor).filter((x) => x != null);
  for (const actor of actors) {
    const effects = actor.appliedEffects;
    for (const effect of effects) {
      if (!isEffectTemporary(effect)) continue;

      const effectSourceActor = getEffectOriginActor(effect);
      const effectTargetActor = (effect.target instanceof Item ? effect.target.parent : effect.target);
      const priorActor = combat.combatants.get(prior.combatantId)?.actor;
      const currentActor = combat.combatants.get(current.combatantId)?.actor;

      // without someone owning the effect we... uh... cant do much
      if (!effectTargetActor) continue;

      // Expire effects that end on turn end of previous actor, but...
      // ignore those that started on that turn (end of next turn)

      if (effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.NEXT_SOURCE_TURN_END) && (priorActor === effectSourceActor)) {
        if ((effect.duration.startRound == prior.round) && (effect.duration.startTurn == prior.turn)) continue;
        expireEffect(effect, EXPIRATION_TYPES.COMBAT.NEXT_SOURCE_TURN_END);
        continue; // proceed with next effect
      }

      if (effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.NEXT_TARGET_TURN_END) && (priorActor === effectTargetActor)) {
        if ((effect.duration.startRound == prior.round) && (effect.duration.startTurn == prior.turn)) continue;
        expireEffect(effect, EXPIRATION_TYPES.COMBAT.NEXT_TARGET_TURN_END);
        continue; // proceed with next effect
      }

      // Expire effects that end on turn start of current actor, but...
      // ignore those that started on that turn (start of next) turn, but...
      // there cant be such an effect!

      if (effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.NEXT_SOURCE_TURN_START) && (currentActor === effectSourceActor)) {
        expireEffect(effect, EXPIRATION_TYPES.COMBAT.NEXT_SOURCE_TURN_START);
        continue; // proceed with next effect
      }

      if (effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.NEXT_TARGET_TURN_START) && (currentActor === effectTargetActor)) {
        expireEffect(effect, EXPIRATION_TYPES.COMBAT.NEXT_TARGET_TURN_START);
        continue; // proceed with next effect
      }

    }
  }
}
