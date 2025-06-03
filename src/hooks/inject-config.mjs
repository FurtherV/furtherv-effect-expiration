import { EXPIRATION_TYPES, FLAGS, I18N_ID, MODULE_ID } from "../constants.mjs";
import { camelToPascal, effectShouldExpireOn, getEffectExpirationTypes, isEffectTemporary, expireEffect } from "../utils.mjs";

export default function init() {
  Hooks.on("renderActiveEffectConfig", onRenderActiveEffectConfig);
}

/**
 * @param {Application} app
 * @param {HTMLElement | JQuery} jqOrHtml
 * @param {Object} data
 */
function onRenderActiveEffectConfig(app, jqOrHtml, data) {
  /**
   * @type {HTMLElement}
   */
  const html = jqOrHtml instanceof jQuery ? jqOrHtml[0] : jqOrHtml;

  // Get the tab we want to insert our stuff in
  const durationSection = html.querySelector(".tab[data-tab='duration']");

  // Add a horizontal line v12 style
  durationSection.appendChild(document.createElement("hr"));

  // Create MultiCheckbox Element

  // TODO: rework this or make it make more sense
  const options = Object.entries(EXPIRATION_TYPES).flatMap(
    ([k, v]) => Object.values(v).map(
      (x) => ({ group: k.toLowerCase(), value: x, label: `${I18N_ID}.Trigger.${k}.${camelToPascal(x)}` }),
    ),
  ).filter((x) => {
    if (x.group.startsWith("module.")) {
      return game.modules.has(x.group.slice("module.".length));
    }
    if (x.group.startsWith("system.")) {
      return game.system.id == x.group.slice("system.".length);
    }
    return true;
  });
  options.forEach((x) => {
    x.group = `${I18N_ID}.Trigger.${x.group.toUpperCase()}.GroupName`;
  });

  const multiCheckboxElement = foundry.applications.fields.createMultiSelectInput(
    {
      name: `flags.${MODULE_ID}.${FLAGS.EXPIRATION_TRIGGERS}`,
      type: "checkboxes",
      options: options,
      sort: false,
      required: false,
      localize: true,
      value: getEffectExpirationTypes(app.document),
    });

  // Turn our multicheckbox element into a form group and add it
  const formGroup = foundry.applications.fields.createFormGroup({
    input: multiCheckboxElement,
    label: `${I18N_ID}.ExpireOn.Label`,
    hint: `${I18N_ID}.ExpireOn.Hint`,
    localize: true,
    stacked: true,
    classes: [MODULE_ID],
  });

  // Appending without cloning first leads to the custom element losing its contents
  durationSection.appendChild(formGroup.cloneNode(true));

  // Makes the application the correct size again
  const currentPosition = { ...app.position };
  currentPosition.width = Math.max(currentPosition.width, 780);
  app.setPosition(currentPosition);
}
