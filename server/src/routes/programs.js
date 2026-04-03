const sql = require("../config/supabase");

const express = require("express");
const router = express.Router();

// GET /programs - all available programs.
router.get("/programs", async (req, res) => {
  try {
    const programs = await sql`SELECT * FROM programs`;
    res.json({ programs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /programs - add a new program.
router.post("/programs", async (req, res) => {
  const { name, level, target_age, description, prerequisites } = req.body; // Extract the given program data.

  try {
    const [program] =
      await sql`INSERT INTO programs (name, level, target_age, description, prerequisites)
        VALUES (${name}, ${level}, ${target_age}, ${description}, ${prerequisites})
        RETURNING *`;

    res.status(201).json({ message: "Program created", program });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /programs/:id - update an existing program.
router.put("/programs/:id", async (req, res) => {
  const { id } = req.params; // get the program ID from the URL.

  try {
    const [program] = await sql`UPDATE programs
        SET ${sql(req.body, "name", "level", "target_age", "description", "prerequisites")}
        WHERE programs.id = ${id}
        RETURNING *`;

    if (!program) return res.status(404).json({ error: "Program not found" });

    res.status(200).json({ message: "Updated Program object", program });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /programs/:id - deactivate an existing program.
router.delete("/programs/:id", async (req, res) => {
  const { id } = req.params; // get the program ID from the URL.

  try {
    const [program] = await sql`UPDATE programs
        SET status = 'inactive'
        WHERE programs.id = ${id}
        RETURNING *`;

    if (!program) return res.status(404).json({ error: "Program not found" });

    res.status(200).json({ message: "Program deactivated", program });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
