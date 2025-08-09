import { EXPIRATION_TYPES, FLAGS, I18N_ID, MODULE_ID } from "../constants.mjs";
import { camelToPascal, getEffectExpirationTypes } from "../utils.mjs";

export default function init() {
  Hooks.on("renderActiveEffectConfig", renderActiveEffectConfig);
}

/* -------------------------------------------------- */

/**
 * @param {Application} app
 * @param {HTMLElement} jqOrHtml
 * @param {Object} data
 */
function renderActiveEffectConfig(app, html, data) {
  // Get the tab we want to insert our stuff in
  const durationSection = html.querySelector(".tab[data-tab='duration']");

  // Add a horizontal line v12 style
  durationSection.appendChild(document.createElement("hr"));

  // Create MultiCheckbox Element

  // An option needs a group, a label and the actual value that will be stored
  const options = Object.entries(EXPIRATION_TYPES).flatMap(([groupId, groupSpace]) => {
    if ((groupId === "SYSTEM") || (groupId === "MODULE")) {
      return Object.entries(groupSpace).flatMap(([packageId, packageSpace]) => {
        // Check if relevant system or module is installed and active
        if ((groupId === "SYSTEM") && (game.system.id !== packageId.toLowerCase())) {
          return [];
        }

        if ((groupId === "MODULE") && (game.modules.get(packageId.toLowerCase())?.active !== true)) {
          return [];
        }

        // NOTE: we have to remove package prefix from enum value first
        return Object.values(packageSpace).map((enumValue) => ({
          group: `${I18N_ID}.Trigger.${groupId}.${packageId}.groupName`,
          value: enumValue,
          label: `${I18N_ID}.Trigger.${groupId}.${packageId}.${enumValue.split(".").at(1)}`,
        }));
      });
    } else {
      return Object.values(groupSpace).map((enumValue) => ({
        group: `${I18N_ID}.Trigger.${groupId}.groupName`,
        value: enumValue,
        label: `${I18N_ID}.Trigger.${groupId}.${enumValue}`,
      }));
    }
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
  // const currentPosition = { ...app.position };
  // currentPosition.width = Math.max(currentPosition.width, 780);
  // app.setPosition(currentPosition);
}
