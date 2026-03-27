const supabase = require('./supabase')

const express = require('express');
const router = express.Router();

// GET /programs - all available programs, with optional age filtering.
router.get('/programs', async (req, res) => { 

    const { data, error } = await supabase
        .from('programs')
        .select('*')

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

// GET /registrations - list all registrations (admin only).
router.get('/registrations', async (req, res) => {

    let query = supabase
        .from('registrations')
        .select('*, students(*), programs(*), time_slots(*)') // Join related student, program, and time slot data.

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json({ registrations: data });
})

// GET /registrations/my - list current parent's registrations.
router.get('/registrations/my', async (req, res) => {
    const { id } = req.query; // Temporary: will be replaced with auth middleware later.

    let query = supabase
        .from('/admin/registrations')
        .select('*, students(*), programs(*), time_slots(*)') // Join related student, program, and time slot data.
        .eq('student_id', id) // Only return registrations belonging to the current user.

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json({ registrations: data });

})

// POST /registrations - submit a new registration (parent only).
router.post('/registrations', async (req, res) => {
    const { student_id, program_id, time_slot_id } = req.body;

    // Step 1: Check capacity
    const { data: slot, error: slotError } = await supabase
        .from('time_slots')
        .select('current_count, max_capacity')
        .eq('id', time_slot_id)
        .single()

        if (slotError) return res.status(500).json({ error: slotError.message }); // Error 500: Internal error.
        if (!slot) return res.status(404).json({ error: 'Time slot not found' }); // Error 404: No matching slot.

        if(slot.current_count >= slot.max_capacity) {
            return res.status(400).json({error: 'Time slot is full'}) // Error 400: Slot is at max capacity.
        }
    
    
    // Step 2: Insert registration
    const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert({
            student_id,
            program_id,
            time_slot_id
        })
        .select()
        .single()

        if (regError) return res.status(500).json({ error: regError.message });


    // Step 3: Increment current_count
    const { error: incrementError } = await supabase
        .from('time_slots')
        .update({ current_count: slot.current_count + 1 }) // Increment count by 1.
        .eq('id', time_slot_id)

    if (incrementError) return res.status(500).json({ error: incrementError.message }); // Error 500: Internal error.


    res.status(201).json({ message: 'Registration submitted', registration });
})

module.exports = router;