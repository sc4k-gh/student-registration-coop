const express = require('express');
const router = express.Router();

// Temporary mock database for testing locally; REAL database added later.
let programs = [
    {
        id: "1",
        name: "Piano Basics",
        min_age: 5,
        max_age: 8,
        "description": "Introductory piano course for young learners",
        "is_active": true
    }
]

// GET /programs - all available programs, with optional age filtering.
router.get('/programs', (req, res) => {
    const { age } = req.query; // Age is specified using URL queries (e.g. /programs/?age=7).

    if (age) {
        const filtered = programs.filter(p =>
            p.min_age <= age && age <= p.max_age // only return programs within specified age range
        )
        return res.json({programs: filtered});
    }
    res.json({programs}) // No age range, return everything.
})

// POST /programs - add a new program.
router.post('/programs', (req, res) => {
    const { name, min_age, max_age, description } = req.body; // Extract the given program data.

    const newProgram = {
        id: crypto.randomUUID(),
        name,
        min_age,
        max_age,
        description,
        is_active: true
    }
    programs.push(newProgram); // Add new program to the mock database array.
    res.status(201).json({ message: 'Program created', program: newProgram });
})

// PUT /programs/:id - update an existing program.
router.put('/programs/:id', (req, res) => {
    const { id } = req.params // get the program ID from the URL.
    const { name, min_age, max_age, description, is_active } = req.body; // Extract the given program data.
    
    const searchID = programs.findIndex(p => p.id === id); // Find the index of the program with the matching ID.

    if (searchID !== -1) { // -1 means the program was not found.
        programs[searchID] = { ...programs[searchID], ...req.body } // Update existing data with the new content.
        res.status(200).json({ message: 'Updated Program object', program: programs[searchID] });
    }

    else {
        res.status(404).send('Program not found');
    }

})

// DELETE /programs/:id - deactivate an existing program.
router.delete('/programs/:id', (req, res) => {
    const { id } = req.params // get the program ID from the URL.
    
    const searchID = programs.findIndex(p => p.id === id); // Find the index of the program with the matching ID.

    if (searchID !== -1) { // -1 means the program was not found.
        programs[searchID].is_active = false; // Soft delete (deactivate) the selected program.
        res.status(200).send('Program deactivated');
    }

    else {
        res.status(404).send('Program not found');
    }

})

module.exports = router;