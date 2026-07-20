import { supabase } from '../config/supabase.js';
import { isUuid } from '../utils/validation.js';

const MODES = ['online', 'in-person'];

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const weekdayOf = (isoDate) => WEEKDAYS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
const toISODate = (d) => d.toISOString().slice(0, 10);

// GET /time-slots?program_id=&mode=&location_id=&date=
// With `date`: slots on that date's weekday that still have room.
// Without `date`: the soonest upcoming date (≤14 days) that has an open slot,
// returned as { next_date, slots } to drive the cascading form.
export const listAvailable = async (req, res) => {
  const { program_id, mode, location_id, date } = req.query;

  if (!program_id || !mode) {
    return res.status(400).json({ error: 'program_id and mode are required' });
  }
  if (!isUuid(program_id)) {
    return res.status(400).json({ error: 'program_id must be a uuid' });
  }
  if (!MODES.includes(mode)) {
    return res.status(400).json({ error: `mode must be ${MODES.join(' or ')}` });
  }
  if (location_id && !isUuid(location_id)) {
    return res.status(400).json({ error: 'location_id must be a uuid' });
  }

  let query = supabase
    .from('time_slots')
    .select()
    .eq('program_id', program_id)
    .eq('mode', mode);

  if (location_id) {
    query = query.eq('location_id', location_id);
  }

  const { data, error } = await query;
  if (error) {
    console.error('time-slots.listAvailable failed', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  const open = data.filter((s) => s.current_count < s.max_capacity);

  if (date) {
    const wd = weekdayOf(date);
    return res.json({ next_date: date, slots: open.filter((s) => s.day_of_week === wd) });
  }

  // No date supplied — find the soonest day (today..+14) with an open slot.
  const today = new Date();
  for (let i = 0; i < 15; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() + i);
    const iso = toISODate(d);
    const slots = open.filter((s) => s.day_of_week === weekdayOf(iso));
    if (slots.length > 0) {
      return res.json({ next_date: iso, slots });
    }
  }
  res.json({ next_date: null, slots: [] });
};
