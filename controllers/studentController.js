const Student = require('../models/Student');
const firebaseService = require('../services/firebaseStudentService');

// ─── Helper: fire-and-forget Firebase sync ────────────────────────────────
// Errors are logged but NEVER block the API response (MongoDB is source of truth)
function fbSync(operation, ...args) {
  firebaseService[operation](...args).catch(err =>
    console.error(`[Firebase Sync] ${operation} failed:`, err.message)
  );
}

// ─── Add Student (POST /api/students) ─────────────────────────────────────
exports.createStudent = async (req, res) => {
  try {
    const { name, rollNo, branch, year, email, phone, address } = req.body;

    const newStudent = new Student({
      name: name.trim(),
      rollNo: rollNo.trim(),
      branch: branch.trim().toUpperCase(),
      year: Number(year),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address ? address.trim() : undefined
    });

    await newStudent.save();

    // 🔥 Non-blocking Firebase sync (does not delay the response)
    fbSync('syncCreate', newStudent);

    return res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: newStudent
    });

  } catch (err) {
    console.error('Create student error:', err);

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: duplicateField, message: `A student with this ${duplicateField} already exists.` }
        ]
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to add student.'
    });
  }
};

// ─── Get All Students (GET /api/students) — reads from MongoDB ────────────
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: students
    });
  } catch (err) {
    console.error('Get all students error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to retrieve students.'
    });
  }
};

// ─── Get All Students from Firebase mirror (GET /api/students/firebase) ───
exports.getStudentsFromFirebase = async (req, res) => {
  try {
    const students = await firebaseService.getAll();
    return res.status(200).json({
      success: true,
      message: `Students retrieved from Firestore (${students.length} records)`,
      source: 'firebase',
      data: students
    });
  } catch (err) {
    console.error('Get students from Firebase error:', err);
    return res.status(503).json({
      success: false,
      message: 'Firebase Firestore unavailable. Check credentials and connectivity.',
      error: err.message
    });
  }
};

// ─── Get One Student (GET /api/students/:id) ──────────────────────────────
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: student
    });
  } catch (err) {
    console.error('Get student by ID error:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to retrieve student.'
    });
  }
};

// ─── Update Student (PUT /api/students/:id) ───────────────────────────────
exports.updateStudent = async (req, res) => {
  try {
    const { name, rollNo, branch, year, email, phone, address } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const errors = [];

    // Email validation
    if (email) {
      const emailNormalized = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailNormalized)) {
        errors.push({ field: 'email', message: 'Please provide a valid email address' });
      } else if (emailNormalized !== student.email) {
        const existingEmail = await Student.findOne({ email: emailNormalized });
        if (existingEmail) {
          errors.push({ field: 'email', message: 'A student with this email already exists.' });
        }
      }
      if (errors.length === 0) student.email = emailNormalized;
    }

    // Roll number validation
    if (rollNo) {
      const rollNoTrimmed = rollNo.trim();
      if (!rollNoTrimmed) {
        errors.push({ field: 'rollNo', message: 'Roll number is required' });
      } else if (rollNoTrimmed !== student.rollNo) {
        const existingRollNo = await Student.findOne({ rollNo: rollNoTrimmed });
        if (existingRollNo) {
          errors.push({ field: 'rollNo', message: 'A student with this roll number already exists.' });
        }
      }
      if (errors.length === 0) student.rollNo = rollNoTrimmed;
    }

    // Branch validation
    if (branch) {
      const branchTrimmed = branch.trim().toUpperCase();
      const allowedBranches = ['CSE', 'IT', 'ECE', 'ME', 'CE'];
      if (!allowedBranches.includes(branchTrimmed)) {
        errors.push({ field: 'branch', message: 'Branch must be one of CSE, IT, ECE, ME, CE' });
      } else {
        student.branch = branchTrimmed;
      }
    }

    // Year validation
    if (year !== undefined) {
      const parsedYear = Number(year);
      if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4) {
        errors.push({ field: 'year', message: 'Year must be an integer between 1 and 4' });
      } else {
        student.year = parsedYear;
      }
    }

    // Phone validation
    if (phone) {
      const phoneTrimmed = phone.trim();
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phoneTrimmed)) {
        errors.push({ field: 'phone', message: 'Phone number must be exactly 10 digits' });
      } else {
        student.phone = phoneTrimmed;
      }
    }

    if (name) {
      const nameTrimmed = name.trim();
      if (!nameTrimmed) {
        errors.push({ field: 'name', message: 'Name is required' });
      } else {
        student.name = nameTrimmed;
      }
    }

    if (address !== undefined) {
      student.address = address.trim();
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    await student.save();

    // 🔥 Non-blocking Firebase sync
    fbSync('syncUpdate', req.params.id, student);

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (err) {
    console.error('Update student error:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to update student.'
    });
  }
};

// ─── Delete Student (DELETE /api/students/:id) ────────────────────────────
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.id);

    // 🔥 Non-blocking Firebase sync
    fbSync('syncDelete', req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: student
    });

  } catch (err) {
    console.error('Delete student error:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to delete student.'
    });
  }
};

// ─── Filter by Branch (GET /api/students/branch/:branch) ─────────────────
exports.getStudentsByBranch = async (req, res) => {
  try {
    const branch = req.params.branch.toUpperCase().trim();
    const students = await Student.find({ branch }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: `Students in branch ${branch} retrieved successfully`,
      data: students
    });
  } catch (err) {
    console.error('Filter students by branch error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to retrieve students by branch.'
    });
  }
};

// ─── Filter by Year (GET /api/students/year/:year) ────────────────────────
exports.getStudentsByYear = async (req, res) => {
  try {
    const year = Number(req.params.year);
    if (isNaN(year) || year < 1 || year > 4) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'year', message: 'Year must be an integer between 1 and 4' }]
      });
    }

    const students = await Student.find({ year }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: `Students in year ${year} retrieved successfully`,
      data: students
    });
  } catch (err) {
    console.error('Filter students by year error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to retrieve students by year.'
    });
  }
};
