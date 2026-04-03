const express = require("express");
const sql = require("../config/supabase");
const router = express.Router();

// GET /time-slots - list available slots, filterable by program, mode, and location.
router.get("/time-slots", async (req, res) => {
  const { program_id, mode, location_id } = req.query;

  try {
    const timeSlots = await sql`
          SELECT * FROM time_slots
          WHERE (${program_id ?? null}::uuid IS NULL OR program_id = ${program_id ?? null}::uuid)
          AND (${mode ?? null} IS NULL OR mode = ${mode ?? null}::text)
          AND (${location_id ?? null}::uuid IS NULL OR location_id = ${location_id ?? null}::uuid)`;

    res.json({ timeSlots });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
