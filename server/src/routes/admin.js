import express from 'express';
import {
  summary,
  query,
  listStudents,
  listTeachers,
  listTeacherStudents,
  createTeacher,
  createProgram,
  updateProgram,
  getProgram,
  createTimeSlot,
  listPendingRegistrations,
  reviewRegistration,
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/summary', summary);
router.get('/query', query);
router.get('/students', listStudents);
router.get('/teachers', listTeachers);
router.get('/teachers/:id/students', listTeacherStudents);
router.post('/teachers', createTeacher);
router.get('/programs/:id', getProgram);
router.post('/programs', createProgram);
router.patch('/programs/:id', updateProgram);
router.post('/time-slots', createTimeSlot);
router.get('/registrations', listPendingRegistrations);
router.patch('/registrations/:id', reviewRegistration);

export default router;
