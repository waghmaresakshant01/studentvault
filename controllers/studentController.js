const Student = require('../models/Student');

// Simple regex validations matching the model
const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^\d{10}$/;
  return re.test(phone);
};

// Create a new student (Admin only)
exports.createStudent = async (req, res) => {
  try {
    const { name, rollNo, branch, year, email, phone } = req.body;

    // Validate fields presence
    if (!name || !rollNo || !branch || !year || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, rollNo, branch, year, email, phone) are required.'
      });
    }

    // Validate formatting rules
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits.'
      });
    }

    const parsedYear = Number(year);
    if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 1 and 4.'
      });
    }

    // Enforce unique rollNo constraint
    const existingStudent = await Student.findOne({ rollNo: rollNo.trim() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this roll number already exists.'
      });
    }

    // Save student
    const newStudent = new Student({
      name: name.trim(),
      rollNo: rollNo.trim(),
      branch: branch.trim(),
      year: parsedYear,
      email: email.toLowerCase().trim(),
      phone: phone.trim()
    });

    await newStudent.save();

    return res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      data: newStudent
    });

  } catch (err) {
    console.error('Create student error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to create student record.',
      error: err.message
    });
  }
};

// Get all student records (All authenticated users)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Student records retrieved successfully.',
      data: students
    });
  } catch (err) {
    console.error('Get all students error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to retrieve student records.',
      error: err.message
    });
  }
};

// Get single student record by ID (All authenticated users)
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student record retrieved successfully.',
      data: student
    });
  } catch (err) {
    console.error('Get student by ID error:', err);
    // Handle invalid ObjectId cast error
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to retrieve student record.',
      error: err.message
    });
  }
};

// Update student record by ID (Admin only)
exports.updateStudent = async (req, res) => {
  try {
    const { name, rollNo, branch, year, email, phone } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    // If updating rollNo, check for uniqueness conflicts
    if (rollNo && rollNo.trim() !== student.rollNo) {
      const existingStudent = await Student.findOne({ rollNo: rollNo.trim() });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A student with this roll number already exists.'
        });
      }
      student.rollNo = rollNo.trim();
    }

    // Update and validate format rules if fields are supplied
    if (name) student.name = name.trim();
    if (branch) student.branch = branch.trim();

    if (year !== undefined) {
      const parsedYear = Number(year);
      if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4) {
        return res.status(400).json({
          success: false,
          message: 'Year must be between 1 and 4.'
        });
      }
      student.year = parsedYear;
    }

    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }
      student.email = email.toLowerCase().trim();
    }

    if (phone) {
      if (!validatePhone(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be exactly 10 digits.'
        });
      }
      student.phone = phone.trim();
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      data: student
    });

  } catch (err) {
    console.error('Update student error:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to update student record.',
      error: err.message
    });
  }
};

// Delete student record by ID (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    // Hard delete
    await Student.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Student record deleted successfully.'
    });

  } catch (err) {
    console.error('Delete student error:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to delete student record.',
      error: err.message
    });
  }
};
