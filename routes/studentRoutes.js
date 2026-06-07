const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { validateStudentRules, validate } = require('../middleware/validateStudent');

router.post('/', validateStudentRules, validate, studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/branch/:branch', studentController.getStudentsByBranch);
router.get('/year/:year', studentController.getStudentsByYear);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
