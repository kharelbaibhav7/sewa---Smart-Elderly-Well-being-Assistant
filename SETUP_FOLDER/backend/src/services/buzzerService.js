/**
 * Buzzer service — triggers hardware buzzer via HTTP to the Raspberry Pi controller.
 * Falls back to console alert when hardware is unavailable.
 */

const BUZZER_URL = process.env.BUZZER_URL || "http://localhost:5001/buzzer";
const BUZZER_DURATION_MS = parseInt(process.env.BUZZER_DURATION_MS || "10000", 10);

let buzzerActive = false;

export async function triggerBuzzer(durationMs = BUZZER_DURATION_MS) {
  buzzerActive = true;

  try {
    const response = await fetch(`${BUZZER_URL}/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration_ms: durationMs }),
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      console.warn("[Buzzer] Hardware controller returned non-OK status");
    } else {
      console.log("[Buzzer] Hardware buzzer activated");
    }
  } catch {
    console.warn(
      "[Buzzer] Hardware controller unreachable — ensure hardware/buzzer_controller.py is running on the Pi"
    );
  }

  setTimeout(() => {
    buzzerActive = false;
  }, durationMs);

  return { triggered: true, hardware: buzzerActive };
}

export async function stopBuzzer() {
  buzzerActive = false;

  try {
    await fetch(`${BUZZER_URL}/deactivate`, {
      method: "POST",
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    /* hardware may be offline */
  }

  return { stopped: true };
}

export function isBuzzerActive() {
  return buzzerActive;
}
