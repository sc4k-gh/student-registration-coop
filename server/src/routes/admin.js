const sql = require("../config/supabase");

const express = require("express");
const router = express.Router();

// GET admin/registrations - list all registrations (admin only).
router.get("/admin/registrations", async (req, res) => {
  try {
    const registrations = await sql`SELECT * FROM registrations
        JOIN students ON registrations.student_id = students.id
        JOIN programs ON registrations.program_id = programs.id
        JOIN time_slots ON registrations.time_slot_id = time_slots.id`;
    res.json({ registrations });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /admin/registrations/:id - approve or reject a registration.
router.patch("/admin/registrations/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // either 'approved' or 'rejected'

  try {
    // Step 1: Update registration status
    const [registrations] = await sql`UPDATE registrations
        SET status = ${status}
        WHERE id = ${id}
        RETURNING *
        `;

    // Step 2: If rejected, decrement current_count
    if (status === "rejected") {
      await sql`UPDATE time_slots
            SET current_count = ${slot.current_count - 1}
            WHERE id = ${time_slot_id}`;

      res.status(200).json({ message: "Registration rejected", registration });
    } else {
      res.status(200).json({ message: "Registration approved", registration });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /admin/time-slots - create a new time slot (admin only).
router.post("/admin/time-slots", async (req, res) => {
  const {
    program_id,
    teacher_id,
    location_id,
    mode,
    day_of_week,
    start_time,
    end_time,
  } = req.body;

  try {
    // your SQL here
    const [timeSlots] =
      await sql`INSERT INTO time_slots (program_id, teacher_id, location_id, mode, day_of_week, start_time, end_time)
        VALUES (${program_id}, ${teacher_id}, ${location_id}, ${mode}, ${day_of_week}, ${start_time}, ${end_time} )
        RETURNING *`;

    res.status(201).json({ message: "Time slot created", program });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
