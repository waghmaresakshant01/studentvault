'use strict';

const request = require('supertest');

// Setup testing environment variables BEFORE loading the app
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Bind to ephemeral port
process.env.MONGO_URI = 'mongodb://localhost:27017/mockdb';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';

// Mock config/db to prevent real database connections during tests
jest.mock('../config/db', () => {
  return {};
});

// Mock config/firebase to prevent real Firebase Admin SDK initialization
jest.mock('../config/firebase', () => {
  return {
    admin: {},
    db: {}
  };
});

// Mock the Firebase Student Service so we don't hit real Firestore
const mockFirebaseSyncCreate = jest.fn().mockResolvedValue(true);
const mockFirebaseSyncUpdate = jest.fn().mockResolvedValue(true);
const mockFirebaseSyncDelete = jest.fn().mockResolvedValue(true);
const mockFirebaseGetAll = jest.fn().mockResolvedValue([
  { _id: 'fb-doc-1', name: 'Firebase Bob', rollNo: 'CS201' }
]);
const mockFirebasePing = jest.fn().mockResolvedValue(true);

jest.mock('../services/firebaseStudentService', () => {
  return {
    syncCreate: mockFirebaseSyncCreate,
    syncUpdate: mockFirebaseSyncUpdate,
    syncDelete: mockFirebaseSyncDelete,
    getAll: mockFirebaseGetAll,
    ping: mockFirebasePing
  };
});

// Mock mongoose entirely to prevent any real connection attempts and to stub readyState
jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  return {
    ...originalMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      readyState: 1,
      on: jest.fn(),
      once: jest.fn(),
      db: {}
    }
  };
});

// Mock the Student Model
const Student = require('../models/Student');
jest.mock('../models/Student', () => {
  // We need to create a constructor function that mimics a Mongoose model
  function MockStudent(data) {
    this.name = data.name;
    this.rollNo = data.rollNo;
    this.branch = data.branch;
    this.year = data.year;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this._id = '507f1f77bcf86cd799439011';
    this.createdAt = new Date('2026-06-07T12:00:00Z');
    
    // instance save method
    this.save = jest.fn().mockImplementation(async function() {
      if (MockStudent.mockSaveError) {
        throw MockStudent.mockSaveError;
      }
      return this;
    });

    this.toObject = jest.fn().mockReturnValue({
      _id: this._id,
      name: this.name,
      rollNo: this.rollNo,
      branch: this.branch,
      year: this.year,
      email: this.email,
      phone: this.phone,
      address: this.address,
      createdAt: this.createdAt
    });
  }

  // Static methods
  MockStudent.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([])
  });
  MockStudent.findOne = jest.fn().mockResolvedValue(null);
  MockStudent.findById = jest.fn().mockResolvedValue(null);
  MockStudent.findByIdAndDelete = jest.fn().mockResolvedValue(null);

  // Custom controller triggers
  MockStudent.mockSaveError = null;

  return MockStudent;
});

const app = require('../server');

describe('Student Controller & API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Student.mockSaveError = null;
    Student.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    });
    Student.findOne.mockResolvedValue(null);
    Student.findById.mockResolvedValue(null);
    Student.findByIdAndDelete.mockResolvedValue(null);
  });

  describe('GET /api/health', () => {
    it('should return 200 OK and reports statuses for both databases', async () => {
      mockFirebasePing.mockResolvedValue(true);
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.databases.mongodb).toBe('connected');
      expect(res.body.databases.firebase).toBe('connected');
    });

    it('should show firebase as unreachable if ping fails', async () => {
      mockFirebasePing.mockResolvedValue(false);
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.databases.firebase).toBe('unreachable');
    });
  });

  describe('GET /api/students', () => {
    it('should retrieve all students sorted from MongoDB', async () => {
      const mockList = [
        { _id: '1', name: 'Alice', rollNo: 'CS102' }
      ];
      Student.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockList)
      });

      const res = await request(app).get('/api/students');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockList);
      expect(Student.find).toHaveBeenCalled();
    });
  });

  describe('GET /api/students/firebase', () => {
    it('should fetch mirrored documents directly from Firestore', async () => {
      const res = await request(app).get('/api/students/firebase');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.source).toBe('firebase');
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Firebase Bob');
      expect(mockFirebaseGetAll).toHaveBeenCalled();
    });
  });

  describe('POST /api/students', () => {
    const validStudentData = {
      name: 'John Doe',
      rollNo: 'CS101',
      branch: 'CSE',
      year: 2,
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St'
    };

    it('should create a student record and call non-blocking Firebase sync', async () => {
      const res = await request(app)
        .post('/api/students')
        .send(validStudentData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Student added successfully');
      expect(res.body.data.name).toBe('John Doe');

      // Verify that non-blocking firebase sync was called (using setTimeout or immediate)
      // Since it is non-blocking, we give it a tiny tick to execute
      await new Promise(resolve => setImmediate(resolve));
      expect(mockFirebaseSyncCreate).toHaveBeenCalled();
    });

    it('should handle MongoDB duplicate key errors gracefully', async () => {
      const mongoError = new Error('Duplicate key');
      mongoError.code = 11000;
      mongoError.keyPattern = { email: 1 };
      Student.mockSaveError = mongoError;

      const res = await request(app)
        .post('/api/students')
        .send(validStudentData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('email');
      expect(res.body.errors[0].message).toContain('already exists');
      expect(mockFirebaseSyncCreate).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/students/:id', () => {
    const updateData = {
      name: 'John Smith',
      branch: 'IT',
      year: 3,
      phone: '0987654321'
    };

    it('should update the student record and trigger non-blocking update sync', async () => {
      const mockStudentInstance = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        branch: 'CSE',
        save: jest.fn().mockResolvedValue(this),
        toObject: () => ({ name: 'John Smith', branch: 'IT' })
      };
      Student.findById.mockResolvedValue(mockStudentInstance);

      const res = await request(app)
        .put('/api/students/507f1f77bcf86cd799439011')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockStudentInstance.save).toHaveBeenCalled();

      await new Promise(resolve => setImmediate(resolve));
      expect(mockFirebaseSyncUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', mockStudentInstance);
    });

    it('should return 404 if student does not exist', async () => {
      Student.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/students/507f1f77bcf86cd799439011')
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(mockFirebaseSyncUpdate).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete the student and trigger non-blocking delete sync', async () => {
      const mockStudentInstance = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe'
      };
      Student.findById.mockResolvedValue(mockStudentInstance);
      Student.findByIdAndDelete.mockResolvedValue(mockStudentInstance);

      const res = await request(app).delete('/api/students/507f1f77bcf86cd799439011');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Student deleted successfully');

      await new Promise(resolve => setImmediate(resolve));
      expect(mockFirebaseSyncDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return 404 if student not found for deletion', async () => {
      Student.findById.mockResolvedValue(null);

      const res = await request(app).delete('/api/students/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(mockFirebaseSyncDelete).not.toHaveBeenCalled();
    });
  });
});
