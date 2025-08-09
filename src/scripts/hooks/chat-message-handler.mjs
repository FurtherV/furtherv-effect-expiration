import { FLAGS, MODULE_ID } from "../constants.mjs";
import { log } from "../utils.mjs";

export default function init() {
  Hooks.on("renderChatMessageHTML", renderChatMessageHTML);
}

/* -------------------------------------------------- */

/**
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 * @param {*} options
 */
async function renderChatMessageHTML(message, html, options) {
  // Check if its one of our messages
  if (html.querySelector(`.${MODULE_ID}.expiration-card`) == null) return;

  // Add listener to buttons
  html.querySelectorAll(".card-buttons button").forEach((el) => {
    el.addEventListener("click", onClick);
  });
}

/**
 * @param {PointerEvent} event
 */
async function onClick(event) {
  log("XXX");

  const target = event.currentTarget;
  const action = target.dataset.action;
  switch (action) {
    case "delete": {
      onDelete(event, target);
      break;
    }
  }
}

async function onDelete(event, target) {
  target.disabled = true;
  try {
    const messageElement = target.closest(".chat-message[data-message-id]");
    const messageId = messageElement.dataset.messageId;
    const message = game.messages.get(messageId);

    const effectUuid = message.getFlag(MODULE_ID, FLAGS.EFFECT_UUID);
    const effect = await fromUuid(effectUuid);
    if (effect) {
      const effectData = effect.toObject();
      const effectParent = effect.parent.uuid;
      effectData.parentUuid = effectParent;

      await effect.delete();
      await message.delete();
    }
  } finally {
    target.disabled = false;
  }

}
