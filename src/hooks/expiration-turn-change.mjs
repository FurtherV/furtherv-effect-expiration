import {EXPIRATION_TYPES} from "../constants.mjs";
import {effectShouldExpireOn, expireEffect, getEffectOriginActor, isEffectTemporary} from "../utils.mjs";

/**
 * Initializes the hooks in this file.
 */
export default function init() {
  Hooks.on("combatTurnChange", onCombatTurnChange);
}

/**
 * @param {Combat} combat
 * @param {CombatHistoryData} prior
 * @param {CombatHistoryData} current
 * @returns
 */
function onCombatTurnChange(combat, prior, current) {
// Only the active GM processes
  if (!game.users.activeGM?.isSelf) return;

  // Ignore combats that have not started yet
  if (!combat.started) return;

  // We ignore actors that do not take part in the combat
  const actors = combat.combatants.map((x) => x.actor).filter((x) => !!x);
  for (const actor of actors) {
    const effects = actor.appliedEffects;
    for (const effect of effects) {
      if (!isEffectTemporary(effect)) continue;

      // FIXME: This might be null
      const effectSourceActor = getEffectOriginActor(effect);
      // FIXME: This might not be an actor
      const effectTargetActor = effect.target;

      // FIXME: This might be null
      const priorActor = combat.combatants.get(prior.combatantId)?.actor;
      // FIXME: This might be null
      const currentActor = combat.combatants.get(current.combatantId)?.actor;

      // console.debug(effect.name +" ::: "+ actor.name);
      // console.debug(effectSourceActor);
      // console.debug(effectTargetActor);
      // console.debug("===");
      // console.debug(priorActor);
      // console.debug(currentActor);
      // console.debug("<<<");

      // Expire effects that end on turn end of previous actor, but...
      // ignore those that started on that turn (end of next turn)

      if(effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.NEXT_SOURCE_TURN_END) && priorActor === effectSourceActor) {
        if(effect.duration.startRound == prior.round && effect.duration.startTurn == prior.turn) continue;
        expireEffect(effect);
        continue; // proceed with next effect
      }

      if (effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.NEXT_TARGET_TURN_END) && priorActor === effectTargetActor) {
        if(effect.duration.startRound == prior.round && effect.duration.startTurn == prior.turn) continue;
        expireEffect(effect);
        continue; // proceed with next effect
      }

      // Expire effects that end on turn start of current actor, but...
      // ignore those that started on that turn (start of next) turn, but...
      // there cant be such an effect!

      if (effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.NEXT_SOURCE_TURN_START) && currentActor === effectSourceActor) {
        expireEffect(effect);
        continue; // proceed with next effect
      }

      if (effectShouldExpireOn(effect, EXPIRATION_TYPES.COMBAT.NEXT_TARGET_TURN_START) && currentActor === effectTargetActor) {
        expireEffect(effect);
        continue; // proceed with next effect
      }

    }
  }
}
