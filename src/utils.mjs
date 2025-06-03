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
