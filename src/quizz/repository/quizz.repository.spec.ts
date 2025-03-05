import { Test, TestingModule } from '@nestjs/testing';
import { QuizzRepository } from './quizz.repository';
import { FirebaseConstants, FirebaseAdmin } from 'nestjs-firebase';

describe('QuizzRepository', () => {
  let repository: QuizzRepository;
  let mockFirebaseAdmin: jest.Mocked<FirebaseAdmin>;

  // Mocks pour Firestore
  const mockFirestore = {
    collection: jest.fn(),
  };

  beforeEach(async () => {
    mockFirebaseAdmin = {
      firestore: mockFirestore as any,
    } as jest.Mocked<FirebaseAdmin>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzRepository,
        {
          provide: FirebaseConstants.FIREBASE_TOKEN,
          useValue: mockFirebaseAdmin,
        },
      ],
    }).compile();

    repository = module.get<QuizzRepository>(QuizzRepository);
  });

  it('doit créer un quiz', async () => {
    const mockDocRef = {
      id: 'quiz123',
      set: jest.fn().mockResolvedValue(undefined),
    };

    mockFirestore.collection = jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(mockDocRef),
    });

    const result = await repository.createQuiz('Test Quiz', 'Description', 'user123');

    expect(mockFirestore.collection).toHaveBeenCalledWith('quiz');
    expect(mockDocRef.set).toHaveBeenCalledWith(
      { title: 'Test Quiz', description: 'Description', userId: 'user123' }, 
      { merge: true }
    );
    expect(result).toEqual({ id: 'quiz123', message: 'Quiz created successfully' });
  });

  it('doit récupérer les quiz d\'un utilisateur', async () => {
    const mockDocs = [
      { 
        id: 'quiz1', 
        data: () => ({ title: 'Quiz 1' }) 
      },
      { 
        id: 'quiz2', 
        data: () => ({ title: 'Quiz 2' }) 
      }
    ];

    const mockQuerySnapshot = {
      empty: false,
      docs: mockDocs,
    };

    const mockWhereQuery = {
      get: jest.fn().mockResolvedValue(mockQuerySnapshot),
    };

    mockFirestore.collection = jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue(mockWhereQuery),
    });

    const result = await repository.getQuizzes('user123');

    expect(mockFirestore.collection).toHaveBeenCalledWith('quiz');
    expect(result).toEqual({
      data: [
        { id: 'quiz1', title: 'Quiz 1' },
        { id: 'quiz2', title: 'Quiz 2' }
      ]
    });
  });

  it('doit récupérer un quiz par id pour un utilisateur', async () => {
    const mockQuizData = { 
      userId: 'user123', 
      title: 'Test Quiz', 
      description: 'Description' 
    };

    const mockDocSnapshot = {
      exists: true,
      data: () => mockQuizData,
      id: 'quiz123',
    };

    const mockDocRef = {
      get: jest.fn().mockResolvedValue(mockDocSnapshot),
    };

    mockFirestore.collection = jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(mockDocRef),
    });

    const result = await repository.getQuizById('quiz123', 'user123');

    expect(mockFirestore.collection).toHaveBeenCalledWith('quiz');
    expect(result).toEqual({ 
      id: 'quiz123', 
      userId: 'user123', 
      title: 'Test Quiz', 
      description: 'Description' 
    });
  });

  it('doit retourner null si le quiz n\'existe pas', async () => {
    const mockDocSnapshot = {
      exists: false,
    };

    const mockDocRef = {
      get: jest.fn().mockResolvedValue(mockDocSnapshot),
    };

    mockFirestore.collection = jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(mockDocRef),
    });

    const result = await repository.getQuizById('quiz123', 'user123');

    expect(result).toBeNull();
  });

  it('doit mettre à jour le titre du quiz', async () => {
    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockFirestore.collection = jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(mockDocRef),
    });

    await repository.updateQuizTitle('quiz123', 'Nouveau Titre');

    expect(mockFirestore.collection).toHaveBeenCalledWith('quiz');
    expect(mockDocRef.update).toHaveBeenCalledWith({ title: 'Nouveau Titre' });
  });

  it('doit ajouter une question à un quiz', async () => {
    const questionData = { 
      title: 'New Question', 
      answers: [{ title: 'Answer 1', isCorrect: true }] 
    };

    const mockQuestionDocRef = {
      id: 'question123',
      set: jest.fn().mockResolvedValue(undefined),
    };

    const mockQuizDocRef = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue(mockQuestionDocRef),
      }),
    };

    mockFirestore.collection = jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(mockQuizDocRef),
    });

    const result = await repository.addQuestionToQuiz('quiz123', questionData);

    expect(mockQuizDocRef.collection).toHaveBeenCalledWith('questions');
    expect(mockQuestionDocRef.set).toHaveBeenCalledWith(questionData);
    expect(result).toBe('question123');
  });
});