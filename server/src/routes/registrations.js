const express = require("express");
const sql = require("../config/supabase");
const router = express.Router();

// GET /registrations/my - list current parent's registrations.
router.get("/registrations/my", async (req, res) => {
  const { id } = req.query; // Temporary: will be replaced with auth middleware later.

  try {
    const registrations = await sql`SELECT * FROM registrations
        JOIN programs ON registrations.program_id = programs.id
        JOIN time_slots ON registrations.time_slot_id = time_slots.id
        WHERE registrations.student_id = ${id}`;

    res.json({ registrations });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /registrations - submit a new registration (parent only).
router.post("/registrations", async (req, res) => {
  const { student_id, program_id, time_slot_id } = req.body;

  try {
    // Step 1: Check capacity
    const [slot] = await sql`SELECT current_count, max_capacity
        FROM time_slots
        WHERE id = ${time_slot_id}`;

    if (!slot) return res.status(404).json({ error: "Time slot not found" });

    if (slot.current_count >= slot.max_capacity) {
      return res.status(400).json({ error: "Time slot is full" });
    }

    // Step 2: Insert registration
    const [registration] =
      await sql`INSERT INTO registrations (student_id, program_id, time_slot_id)
        VALUES (${student_id}, ${program_id}, ${time_slot_id})
        RETURNING *`;

    // Step 3: Increment current_count
    await sql`UPDATE time_slots
        SET current_count = ${slot.current_count + 1}
        WHERE id = ${time_slot_id}`;

    res.status(201).json({ message: "Registration submitted", registration });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
