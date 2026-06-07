const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Read operations (accessible to all authenticated users)
router.get('/', auth, studentController.getAllStudents);
router.get('/:id', auth, studentController.getStudentById);

// Write operations (accessible only to admin users)
router.post('/', auth, isAdmin, studentController.createStudent);
router.put('/:id', auth, isAdmin, studentController.updateStudent);
router.delete('/:id', auth, isAdmin, studentController.deleteStudent);

module.exports = router;
