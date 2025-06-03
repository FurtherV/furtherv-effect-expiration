/**
 * @type {string}
 */
export const MODULE_ID = "%config.id%";

/**
 * @type {string}
 */
export const I18N_ID = MODULE_ID.toUpperCase();

/**
 * @type {string}
 */
export const MODULE_TITLE = "%config.title%";

/**
 * @type {string}
 */
export const TEMPLATE_FOLDER = `modules/${MODULE_ID}/templates`;

/**
 * @enum {string}
 * @readonly
 */
export const FLAGS = {
  EXPIRATION_TRIGGERS: "expirationTriggers",
  EFFECT_UUID: "effect.uuid",
  EFFECT_DATA: "effect.data",
};

/**
 * @readonly
 * @const {Record<string, Record<string, string>>} EXPIRATION_TYPES
 */
export const EXPIRATION_TYPES = {
  TIME: {
    DURATION_EXCEEDED: "durationExceeded",
  },
  COMBAT: {
    COMBAT_START: "combatStart",
    COMBAT_END: "combatEnd",
    NEXT_TARGET_TURN_START: "nextTargetTurnStart",
    NEXT_TARGET_TURN_END: "nextTargetTurnEnd",
    NEXT_SOURCE_TURN_START: "nextSourceTurnStart",
    NEXT_SOURCE_TURN_END: "nextSourceTurnEnd",
  },
  MODULE: {
    PLACEHOLDER: {
      PLACEHOLDER: "placeholder.placeholder",
    },
  },
  SYSTEM: {
    DND5E: {
      SHORT_REST: "dnd5e.shortRest",
      LONG_REST: "dnd5e.longRest",
      NEW_DAY: "dnd5e.newDay",
    },
  },
};
