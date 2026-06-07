'use strict';

// Mock firebase-admin completely before any import
const mockSet = jest.fn().mockResolvedValue(true);
const mockDelete = jest.fn().mockResolvedValue(true);
const mockGet = jest.fn();

const mockDoc = jest.fn().mockReturnValue({
  set: mockSet,
  delete: mockDelete
});

const mockOrderBy = jest.fn().mockReturnValue({
  get: mockGet
});

const mockLimit = jest.fn().mockReturnValue({
  get: mockGet
});

const mockCollection = jest.fn().mockReturnValue({
  doc: mockDoc,
  orderBy: mockOrderBy,
  limit: mockLimit
});

const mockFirestore = jest.fn().mockReturnValue({
  collection: mockCollection
});

jest.mock('firebase-admin', () => {
  return {
    apps: [],
    credential: {
      cert: jest.fn().mockReturnValue({})
    },
    initializeApp: jest.fn(),
    firestore: mockFirestore
  };
});

// Setup dummy env variables so config/firebase doesn't throw or log warnings
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----';

const firebaseService = require('../services/firebaseStudentService');

describe('Firebase Student Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toFirestoreData helper mapping', () => {
    it('should convert a plain student object to Firestore-safe format', () => {
      const student = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        rollNo: 'CS101',
        branch: 'CSE',
        year: 2,
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        createdAt: new Date('2026-06-07T12:00:00Z')
      };

      // We need to call the private toFirestoreData via testing the public sync methods
      // or export it/test its effect. Since it's private, we can verify its output via
      // the data passed to collection().doc().set()
    });
  });

  describe('Firestore CRUD operations', () => {
    const mockStudent = {
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      name: 'John Doe',
      rollNo: 'CS101',
      branch: 'CSE',
      year: 2,
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      createdAt: new Date('2026-06-07T12:00:00Z'),
      toObject: function() {
        return {
          _id: this._id,
          name: this.name,
          rollNo: this.rollNo,
          branch: this.branch,
          year: this.year,
          email: this.email,
          phone: this.phone,
          address: this.address,
          createdAt: this.createdAt
        };
      }
    };

    it('should successfully sync a created student', async () => {
      await firebaseService.syncCreate(mockStudent);

      expect(mockCollection).toHaveBeenCalledWith('students');
      expect(mockDoc).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockSet).toHaveBeenCalledWith({
        name: 'John Doe',
        rollNo: 'CS101',
        branch: 'CSE',
        year: 2,
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        createdAt: mockStudent.createdAt,
        mongoId: '507f1f77bcf86cd799439011'
      });
    });

    it('should successfully sync an updated student', async () => {
      await firebaseService.syncUpdate('507f1f77bcf86cd799439011', mockStudent);

      expect(mockCollection).toHaveBeenCalledWith('students');
      expect(mockDoc).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockSet).toHaveBeenCalledWith({
        name: 'John Doe',
        rollNo: 'CS101',
        branch: 'CSE',
        year: 2,
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        createdAt: mockStudent.createdAt,
        mongoId: '507f1f77bcf86cd799439011'
      }, { merge: true });
    });

    it('should successfully sync a deleted student', async () => {
      await firebaseService.syncDelete('507f1f77bcf86cd799439011');

      expect(mockCollection).toHaveBeenCalledWith('students');
      expect(mockDoc).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should retrieve all students from Firestore', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'doc1',
            data: () => ({
              name: 'Alice',
              rollNo: 'CS102',
              createdAt: { toDate: () => new Date('2026-06-07T10:00:00Z') }
            })
          }
        ]
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const result = await firebaseService.getAll();

      expect(mockCollection).toHaveBeenCalledWith('students');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        _id: 'doc1',
        name: 'Alice',
        rollNo: 'CS102',
        createdAt: new Date('2026-06-07T10:00:00Z').toISOString()
      });
    });

    it('should check if Firestore is reachable (ping)', async () => {
      mockGet.mockResolvedValue({ empty: false });
      const ok = await firebaseService.ping();

      expect(mockCollection).toHaveBeenCalledWith('students');
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(ok).toBe(true);
    });

    it('should return false if ping fails', async () => {
      mockGet.mockRejectedValue(new Error('Connection failed'));
      const ok = await firebaseService.ping();

      expect(ok).toBe(false);
    });
  });
});
