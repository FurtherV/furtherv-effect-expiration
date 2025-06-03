import { EXPIRATION_TYPES, FLAGS, MODULE_ID } from "./constants.mjs";
import { camelToPascal, effectShouldExpireOn, getEffectExpirationTypes } from "./utils.mjs";

/**
 * @param {number} newWorldTime
 * @param {number} timeDelta
 * @param {Object} options
 * @param {number} userId
 */
export function onUpdateWorldTime(newWorldTime, timeDelta, options, userId) {
  // Only the active GM processes effects
  if (!game.users.activeGM?.isSelf) return;

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
        expireEffect(effect);
      }
    }
  }
}

/**
 * @param {Application} app
 * @param {HTMLElement | JQuery} jqOrHtml
 * @param {Object} data
 */
export function onRenderActiveEffectConfig(app, jqOrHtml, data) {
  /**
   * @type {HTMLElement}
   */
  const html = jqOrHtml instanceof jQuery ? jqOrHtml[0] : jqOrHtml;

  // Get the tab we want to insert our stuff in
  const durationSection = html.querySelector(".tab[data-tab='duration']");

  // Add a horizontal line v12 style
  durationSection.appendChild(document.createElement("hr"));

  // Create MultiCheckbox Element
  const options = Object.entries(EXPIRATION_TYPES).flatMap(
    ([k, v]) => Object.values(v).map(
      (x) => ({ group: k, value: x, label: camelToPascal(x) }),
    ),
  );

  const multiCheckboxElement = foundry.applications.fields.createMultiSelectInput(
    {
      name: `flags.${MODULE_ID}.${FLAGS.EXPIRATION_TRIGGERS}`,
      type: "checkboxes",
      options: options,
      sort: false,
      required: false,
      localize: false,
      value: getEffectExpirationTypes(app.document),
    });

  // Turn our multicheckbox element into a form group and add it
  const formGroup = foundry.applications.fields.createFormGroup({
    input: multiCheckboxElement,
    label: "Expire On",
    hint: "Determines when this effect automatically expires.",
    localize: false,
    stacked: true,
  });

  // Appending without cloning first leads to the custom element losing its contents
  durationSection.appendChild(formGroup.cloneNode(true));

  // Makes the application the correct size again
  app.setPosition({ ...app.position });
}

function expireEffect(effect) {
  const target = effect.target;
  console.debug(`Effect '${effect.name}' targeting '${target.name}' is expired.`);
  //TODO: Implement expired handling
}

function isEffectTemporary(effect) {
  // We need this custom function because ActiveEffect#isTemporary also
  // returns true if its a status effect which dont have durations we handle...

  const duration = effect.duration.seconds ?? (effect.duration.rounds || effect.duration.turns) ?? 0;
  return (duration > 0);
}
