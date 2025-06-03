/* -------------------------------------------- */
/*  Logging                                     */
/* -------------------------------------------- */

import { EXPIRATION_TYPES, FLAGS, MODULE_ID, MODULE_TITLE } from "./constants.mjs";

/**
 * Log a console message with the module title as prefix and styling.
 * @param {string} message                    Message to display.
 * @param {object} [options={}]
 * @param {string} [options.color="#0b8000"]  Color to use for the log.
 * @param {any[]} [options.extras=[]]         Extra options passed to the logging method.
 * @param {string} [options.level="log"]      Console logging method to call.
 */
export function log(message, { color = "#0b8000", extras = [], level = "log" } = {}) {
  console[level](
    `%c${MODULE_TITLE} | %c${message}`, `color: ${color}; font-variant: small-caps`, "color: revert", ...extras,
  );
}

/**
 * @param {ActiveEffect} effect
 * @returns {string[]}
 */
export function getEffectExpirationTypes(effect) {
  const configuredTypes = effect?.getFlag(MODULE_ID, FLAGS.EXPIRATION_TRIGGERS) ?? [EXPIRATION_TYPES.TIME.DURATION_EXCEEDED];
  return configuredTypes;
}

/**
 * @param {ActiveEffect} effect
 * @param {string} expirationType
 * @returns {boolean}
 */
export function effectShouldExpireOn(effect, expirationType) {
  const configuredTypes = getEffectExpirationTypes(effect);
  return configuredTypes.includes(expirationType);
}

/**
 * Converts a camelCase string to PascalCase.
 * @param {string} str - The camelCase input string.
 * @returns {string} - The PascalCase version of the string.
 */
export function camelToPascal(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Attempts to retrieve the origin Actor of a given ActiveEffect.
 * @param {ActiveEffect} effect - The active effect to extract the origin actor from.
 * @returns {Actor | null} - The originating Actor or null if not found.
 */
export function getEffectOriginActor(effect) {
  if (!effect?.origin) return null;

  const originEntity = fromUuidSync(effect.origin);
  if (!originEntity) return null;

  // Traverse up to two parent levels to find an Actor
  let current = originEntity;
  for (let i = 0; i < 3; i++) {
    if (current instanceof Actor) return current;
    current = current.parent;
  }

  return null;
}


export function expireEffect(effect) {
  const target = effect.target;
  const txt = `Effect '${effect.name}' targeting '${target.name}' is expired.`;
  console.debug(txt);
  ChatMessage.implementation.create({content: txt});
  //TODO: Implement expired handling
}

export function isEffectTemporary(effect) {
  // We need this custom function because ActiveEffect#isTemporary also
  // returns true if its a status effect which dont have durations we handle...

  // TODO: Update this so it also works for foundry-passive effects that have a expiration trigger set

  const duration = effect.duration.seconds ?? (effect.duration.rounds || effect.duration.turns) ?? 0;
  return (duration > 0);
}
