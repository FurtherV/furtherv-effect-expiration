import { FLAGS, MODULE_ID } from "../constants.mjs";

export default function init() {
  Hooks.on("renderChatMessageHTML", onRenderChatMessage);
}

/**
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 * @param {*} options
 */
async function onRenderChatMessage(message, jqOrHtml, options) {
  /**
   * @type {HTMLElement}
   */
  const html = jqOrHtml instanceof HTMLElement ? jqOrHtml : jqOrHtml[0];

  // Check if its one of our messages
  if (html.querySelector(`.${MODULE_ID}.expiration-card`) == null) return;

  // Add listener to buttons
  html.querySelectorAll(".card-buttons button").forEach((el) => {
    el.addEventListener("click", onClick);
  });

  /** @type {boolean} */
  const deleted = (message.getFlag(MODULE_ID, FLAGS.EFFECT_DATA) != null);
  if (!deleted) {
    // effect exists, hide undo button
    html.querySelector(`.card-buttons button[data-action="undo"]`).style.display = "none";
  } else {
    // effect exists, hide delete button
    html.querySelector(`.card-buttons button[data-action="delete"]`).style.display = "none";
  }
}

/**
 * @param {PointerEvent} event
 */
async function onClick(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  switch (action) {
    case "delete": {
      onDeleteAction(event, target);
      break;
    }
    case "undo": {
      onUndoAction(event, target);
      break;
    }
  }
}

async function onDeleteAction(event, target) {
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

      await message.setFlag(MODULE_ID, FLAGS.EFFECT_DATA, effectData);
      await effect.delete();
    }
  } finally {
    target.disabled = false;
  }

}

async function onUndoAction(event, target) {
  target.disabled = true;
  try {
    const messageElement = target.closest(".chat-message[data-message-id]");
    const messageId = messageElement.dataset.messageId;
    const message = game.messages.get(messageId);

    const effectData = message.getFlag(MODULE_ID, FLAGS.EFFECT_DATA);
    if (effectData) {
      const parentUuid = effectData.parentUuid;
      const parent = await fromUuid(parentUuid);
      delete effectData.parentUuid;
      if (parent) {
        await ActiveEffect.implementation.create(effectData, { parent, keepId: true });
        await message.unsetFlag(MODULE_ID, FLAGS.EFFECT_DATA);
      }
    }
  } finally {
    target.disabled = false;
  }
}
