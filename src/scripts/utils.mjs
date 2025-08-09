import { EXPIRATION_TYPES, FLAGS, I18N_ID, MODULE_ID, MODULE_TITLE, TEMPLATE_FOLDER } from "./constants.mjs";

/**
 * Logs a styled console message with the module title as prefix.
 *
 * @param {string} message - Message to display.
 * @param {object} [options={}] - Optional settings.
 * @param {string} [options.color="#0b8000"] - Log message color.
 * @param {any[]} [options.extras=[]] - Additional arguments for the log.
 * @param {string} [options.level="log"] - Console method (log, warn, error, etc).
 */
export function log(message, { color = "#0b8000", extras = [], level = "log" } = {}) {
  console[level](
    `%c${MODULE_TITLE} | %c${message}`,
    `color: ${color}; font-variant: small-caps`,
    "color: revert",
    ...extras,
  );
}

/* -------------------------------------------------- */

/**
 * Retrieves the expiration trigger types for a given effect.
 *
 * @param {ActiveEffect} effect - The effect to inspect.
 * @returns {string[]} - Array of expiration type identifiers.
 */
export function getEffectExpirationTypes(effect) {
  return effect?.getFlag(MODULE_ID, FLAGS.EXPIRATION_TRIGGERS) ?? [
    EXPIRATION_TYPES.TIME.DURATION_EXCEEDED,
  ];
}

/* -------------------------------------------------- */

/**
 * Checks whether the effect should expire on a given type of expiration trigger.
 *
 * @param {ActiveEffect} effect - The effect to evaluate.
 * @param {string} expirationType - The expiration trigger to check.
 * @returns {boolean} - Whether the effect should expire for this trigger.
 */
export function effectShouldExpireOn(effect, expirationType) {
  return getEffectExpirationTypes(effect).includes(expirationType);
}

/* -------------------------------------------------- */

/**
 * Determines if an effect is temporary, excluding certain default types.
 *
 * @param {ActiveEffect} effect - The effect to check.
 * @returns {boolean} - True if the effect is temporary.
 */
export function isEffectTemporary(effect) {
  // Filter out default expiration types like duration exceeded
  const expirationTypes = getEffectExpirationTypes(effect).filter(
    (x) => x !== EXPIRATION_TYPES.TIME.DURATION_EXCEEDED,
  );

  const duration =
    effect.duration?.seconds ??
    effect.duration?.rounds ??
    effect.duration?.turns ??
    0;

  return (duration > 0) || (expirationTypes.length > 0);
}

/* -------------------------------------------------- */

/**
 * Expire an active effect, prompting with a Chat Message.
 *
 * @param {ActiveEffect} effect - The expired effect.
 * @param {string} reason - The reason for expiration.
 */
export async function expireEffect(effect, reason) {
  const target = effect.target;

  const messageContent = await renderTemplate(`${TEMPLATE_FOLDER}/expiration-message.hbs`, {
    MODULE_ID,
    I18N_ID,
    effect,
    target,
    reason,
  });
  const msg = await ChatMessage.implementation.create({
    content: messageContent,
    whisper: game.users.filter((x) => x.isGM).map((x) => x.id),
    [`flags.${MODULE_ID}`]: {
      [FLAGS.EFFECT_UUID]: effect.uuid,
    },
  });
}

/* -------------------------------------------------- */

/**
 * Converts a camelCase string to PascalCase.
 *
 * @param {string} str - The input string.
 * @returns {string} - The PascalCase result.
 */
export function camelToPascal(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* -------------------------------------------------- */

/**
 * Attempts to extract the originating Actor from an ActiveEffect's origin.
 *
 * @param {ActiveEffect} effect - The effect with an origin.
 * @returns {Actor | null} - The originating actor, or null if not found.
 */
export function getEffectOriginActor(effect) {
  if (!effect?.origin) return null;

  let entity = fromUuidSync(effect.origin);
  if (!entity) return null;

  // Traverse up to 3 levels to find the parent Actor
  for (let i = 0; i < 3; i++) {
    if (entity instanceof Actor) return entity;
    entity = entity.parent;
  }

  return null;
}
