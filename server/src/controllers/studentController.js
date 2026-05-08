import { supabase } from '../config/supabase.js';

export const create = async(req, res) => {
    // Check for required fields.
    // Students can't be created if any of these are missing.
    if (
        !req.body.parent_id || 
        !req.body.student_name || 
        !req.body.age || 
        !req.body.parent_name ||
        !req.body.parent_email ||
        !req.body.parent_phone
    )
        {return res.status(400).json(
            { error: 'Please fill in all required fields: student name, age, parent name, email, and phone'}
        )};


    const { data, error } = await supabase
    .from('students')
    .insert({
        'parent_id': req.body.parent_id,
        'student_name': req.body.student_name,
        'student_email': req.body.student_email,
        'student_phone': req.body.student_phone,
        'age': req.body.age,
        'description': req.body.description,
        'parent_name': req.body.parent_name,
        'parent_email': req.body.parent_email,
        'parent_phone': req.body.parent_phone
    })
    .select()
    .single();

    if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
};