const supabase = require('./supabase')

const express = require('express');
const router = express.Router();

// GET /programs - all available programs, with optional age filtering.
// Age is specified using URL queries (e.g. /programs/?age=7).
router.get('/programs', async (req, res) => { 
    const { age } = req.query;

    let query = supabase
        .from('programs')
        .select('*')

    if (age) {
        query = query.filter('target_age', 'cs', age) // Only return programs within specified age range.
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json({ programs: data });
})

// POST /programs - add a new program.
router.post('/programs', async (req, res) => {
    const { name, level, target_age, description, prerequisites } = req.body; // Extract the given program data.


    const { data, error } = await supabase
        .from('programs')
        .insert({
            name,
            level,
            target_age,
            description,
            prerequisites
        })
        .select()
        .single() // Return the newly created program as a single object.

    if (error) return res.status(500).json({ error: error.message })

    res.status(201).json({ message: 'Program created', program: data });
})

// PUT /programs/:id - update an existing program.
router.put('/programs/:id', async (req, res) => {
    const { id } = req.params; // get the program ID from the URL.

    const { data, error } = await supabase
        .from('programs')
        .update(req.body) // Update only the fields that were sent.
        .eq('id', id) // Only update the program with the matching ID.
        .select()
        .single() // Return the updated program as a single object.


     if (error) return res.status(500).json({ error: error.message }); // Error 500: Internal error.
    if (!data) return res.status(404).json({error: 'Program not found'}); // Error 404: No matching ID.


    res.status(200).json({ message: 'Updated Program object', program: data });
})

// DELETE /programs/:id - deactivate an existing program.
router.delete('/programs/:id', async (req, res) => {
    const { id } = req.params; // get the program ID from the URL.
    
    const { data, error } = await supabase
        .from('programs')
        .update({status: 'inactive'}) // Soft delete by setting status to inactive.
        .eq('id', id) // Only update the program with the matching ID.
        .select()
        .single() // Return the updated program as a single object.


     if (error) return res.status(500).json({ error: error.message }); // Error 500: Internal error.
    if (!data) return res.status(404).json({error: 'Program not found'}); // Error 404: No matching ID.


    res.status(200).json({ message: 'Program deactivated', program: data });

})

module.exports = router;