#!/usr/bin/env python3
"""
SEWA Hardware Buzzer Controller
Run this on a Raspberry Pi connected to a buzzer on GPIO pin 17.

Wiring:
  Buzzer (+) -> GPIO 17
  Buzzer (-) -> GND

Usage:
  pip install flask RPi.GPIO
  python buzzer_controller.py
"""

import os
import threading
import time

from flask import Flask, jsonify, request

app = Flask(__name__)

BUZZER_PIN = int(os.environ.get("BUZZER_PIN", "17"))
SIMULATION_MODE = os.environ.get("SIMULATION", "0") == "1"
PORT = int(os.environ.get("BUZZER_PORT", "5001"))

_gpio = None
_buzzer_thread = None
_buzzer_active = False


def setup_gpio():
    global _gpio
    if SIMULATION_MODE:
        print("[SEWA Buzzer] Running in simulation mode (no GPIO)")
        return

    import RPi.GPIO as GPIO

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(BUZZER_PIN, GPIO.OUT)
    GPIO.output(BUZZER_PIN, GPIO.LOW)
    _gpio = GPIO
    print(f"[SEWA Buzzer] GPIO {BUZZER_PIN} configured")


def _buzzer_loop(duration_ms):
    global _buzzer_active
    _buzzer_active = True
    end_time = time.time() + duration_ms / 1000.0

    while time.time() < end_time and _buzzer_active:
        if SIMULATION_MODE:
            print("[SEWA Buzzer] BEEP")
        else:
            _gpio.output(BUZZER_PIN, _gpio.HIGH)
        time.sleep(0.25)

        if not _buzzer_active:
            break

        if SIMULATION_MODE:
            print("[SEWA Buzzer] ...")
        else:
            _gpio.output(BUZZER_PIN, _gpio.LOW)
        time.sleep(0.25)

    if not SIMULATION_MODE and _gpio:
        _gpio.output(BUZZER_PIN, _gpio.LOW)

    _buzzer_active = False


@app.route("/buzzer/activate", methods=["POST"])
def activate():
    global _buzzer_thread

    data = request.get_json(silent=True) or {}
    duration_ms = int(data.get("duration_ms", 10000))

    if _buzzer_thread and _buzzer_thread.is_alive():
        _buzzer_active = False
        _buzzer_thread.join(timeout=1)

    _buzzer_thread = threading.Thread(
        target=_buzzer_loop, args=(duration_ms,), daemon=True
    )
    _buzzer_thread.start()

    return jsonify({"status": "activated", "duration_ms": duration_ms})


@app.route("/buzzer/deactivate", methods=["POST"])
def deactivate():
    global _buzzer_active
    _buzzer_active = False

    if not SIMULATION_MODE and _gpio:
        _gpio.output(BUZZER_PIN, _gpio.LOW)

    return jsonify({"status": "deactivated"})


@app.route("/buzzer/status", methods=["GET"])
def status():
    return jsonify({"active": _buzzer_active, "simulation": SIMULATION_MODE})


if __name__ == "__main__":
    setup_gpio()
    print(f"[SEWA Buzzer] Listening on port {PORT}")
    app.run(host="0.0.0.0", port=PORT)
