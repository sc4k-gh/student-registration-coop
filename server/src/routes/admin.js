import express from 'express';
import {
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
import { validateUuidParam } from '../middleware/validateUuidParam.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/students', asyncHandler(listStudents));
router.get('/teachers', asyncHandler(listTeachers));
router.get('/teachers/:id/students', validateUuidParam('id'), asyncHandler(listTeacherStudents));
router.post('/teachers', asyncHandler(createTeacher));
router.get('/programs/:id', validateUuidParam('id'), asyncHandler(getProgram));
router.post('/programs', asyncHandler(createProgram));
router.patch('/programs/:id', validateUuidParam('id'), asyncHandler(updateProgram));
router.post('/time-slots', asyncHandler(createTimeSlot));
router.get('/registrations', asyncHandler(listPendingRegistrations));
router.patch('/registrations/:id', validateUuidParam('id'), asyncHandler(reviewRegistration));

export default router;
