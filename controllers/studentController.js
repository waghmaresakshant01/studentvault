const Student = require('../models/Student');

// Add Student (POST /api/students)
exports.createStudent = async (req, res) => {
  try {
    const { name, rollNo, branch, year, email, phone, address } = req.body;

    const newStudent = new Student({
      name,
      rollNo,
      branch,
      year,
      email,
      phone,
      address
    });

    await newStudent.save();

    return res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: newStudent
    });

  } catch (err) {
    console.error('Create student error:', err);
    
    // Handle unique constraint violations (code 11000)
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A student with this ${duplicateField} already exists.`
      });
    }

    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to add student.'
    });
  }
};

// Get All Students (GET /api/students)
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

// Get One Student (GET /api/students/:id)
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: student
    });
  } catch (err) {
    console.error('Get student by ID error:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to retrieve student.'
    });
  }
};

// Update Student (PUT /api/students/:id)
exports.updateStudent = async (req, res) => {
  try {
    const { name, rollNo, branch, year, email, phone, address } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Assign fields if provided
    if (name) student.name = name;
    if (rollNo) student.rollNo = rollNo;
    if (branch) student.branch = branch;
    if (year) student.year = year;
    if (email) student.email = email;
    if (phone) student.phone = phone;
    if (address !== undefined) student.address = address;

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (err) {
    console.error('Update student error:', err);

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A student with this ${duplicateField} already exists.`
      });
    }

    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to update student.'
    });
  }
};

// Delete Student (DELETE /api/students/:id)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: student
    });

  } catch (err) {
    console.error('Delete student error:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to delete student.'
    });
  }
};
