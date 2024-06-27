import { Novu } from "novu";

const novu = new Novu(process.env.NOVU_API_KEY);

/**
 * General function to send any type of notification using Novu.
 *
 * @param {string} eventType - The type of the event ('newTask', 'newProject', 'chatMessage', etc.)
 * @param {object} payload - The payload containing details about the event.
 * @param {array} recipientIds - Array of recipient IDs.
 */

async function novuNotifier(eventType, payload, recipientIds) {
  try {
    // Send notifications using Novu based on the eventType
    for (const id of recipientIds) {
      novu.trigger(eventType, {
        to: {
          subscriberId: id.toString(),
        },
        payload: payload,
      });
    }

    console.log("Info sent successfully.");
  } catch (error) {
    console.error("Failed to send info:", error);
    throw error;
  }
}

export { novuNotifier };
