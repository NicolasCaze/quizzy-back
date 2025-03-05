import { Test, TestingModule } from '@nestjs/testing';
import { QuizzService } from './quizz.service';
import { QuizzRepository } from '../repository/quizz.repository';
import { FirebaseService } from '../../firebase/firebase.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('QuizzService', () => {
  let service: QuizzService;
  let repository: jest.Mocked<QuizzRepository>;
  let firebaseService: jest.Mocked<FirebaseService>;

  beforeEach(async () => {
    // creation d'un faux quizz repozitory
    const mockRepository = {
      createQuiz: jest.fn(),
      getQuizzes: jest.fn(),
      getQuizById: jest.fn(),
      updateQuizTitle: jest.fn(),
      addQuestionToQuiz: jest.fn(),
    };

    const mockFirebaseService = {
      db: {} 
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzService,
        { 
          provide: QuizzRepository, 
          useValue: mockRepository 
        },
        {
          provide: FirebaseService,
          useValue: mockFirebaseService
        }
      ],
    }).compile();

    service = module.get<QuizzService>(QuizzService);
    repository = module.get(QuizzRepository);
    firebaseService = module.get(FirebaseService);
  });

  it('service doit etre defini', () => {
    expect(service).toBeDefined();
  });

  it('doit creer le quizz', async () => {
    repository.createQuiz.mockResolvedValue({ id: '123', message: 'Quiz created successfully' });
    const result = await service.createQuiz('Test Quiz', 'Description', 'user123');
    expect(result).toEqual({ id: '123', message: 'Quiz created successfully' });
    expect(repository.createQuiz).toHaveBeenCalledWith('Test Quiz', 'Description', 'user123');
  });

  it('doit recuperer les quizz de user', async () => {
    repository.getQuizzes.mockResolvedValue({ data: [{ id: '123', title: 'Test Quiz' }] });
    const result = await service.getQuizzes('user123');
    expect(result).toEqual({ data: [{ id: '123', title: 'Test Quiz' }] });
    expect(repository.getQuizzes).toHaveBeenCalledWith('user123');
  });

  it('doit recuperer les quizz par id', async () => {
    const mockQuiz = { 
      title: 'Test Quiz', 
      description: 'Description', 
      questions: [{ title: 'Question 1' }] 
    };
    repository.getQuizById.mockResolvedValue(mockQuiz);
    const result = await service.getQuizById('123', 'user123');
    expect(result).toEqual({
      title: 'Test Quiz',
      description: 'Description',
      questions: [{ title: 'Question 1' }]
    });
    expect(repository.getQuizById).toHaveBeenCalledWith('123', 'user123');
  });

  it('doit throw NotFoundException si le quizz non trouvee par id', async () => {
    repository.getQuizById.mockResolvedValue(null);
    await expect(service.getQuizById('123', 'user123')).rejects.toThrow(NotFoundException);
  });

  it('doit mettre a jour le titre du quizz', async () => {
    const mockQuiz = { userId: 'user123', title: 'Old Title' };
    repository.getQuizById.mockResolvedValue(mockQuiz);
    repository.updateQuizTitle.mockResolvedValue(undefined);

    await service.updateQuizTitle('123', 'New Title', 'user123');
    
    expect(repository.getQuizById).toHaveBeenCalledWith('123', 'user123');
    expect(repository.updateQuizTitle).toHaveBeenCalledWith('123', 'New Title');
  });

  it('doit throw NotFoundException quand met a jour le quizz qui existe pas', async () => {
    repository.getQuizById.mockResolvedValue(null);

    await expect(service.updateQuizTitle('123', 'New Title', 'user123'))
      .rejects.toThrow(NotFoundException);
  });

  it('doit throw ForbiddenException quand mise a jour du quizz dun autre user', async () => {
    const mockQuiz = { userId: 'different-user', title: 'Old Title' };
    repository.getQuizById.mockResolvedValue(mockQuiz);

    await expect(service.updateQuizTitle('123', 'New Title', 'user123'))
      .rejects.toThrow(ForbiddenException);
  });

  it('doit ajouter la question au quizz', async () => {
    const mockQuiz = { userId: 'user123', title: 'Test Quiz' };
    const questionData = { 
      title: 'New Question', 
      answers: [{ title: 'Answer 1', isCorrect: true }] 
    };

    repository.getQuizById.mockResolvedValue(mockQuiz);
    repository.addQuestionToQuiz.mockResolvedValue('question123');

    const result = await service.addQuestionToQuiz('123', questionData, 'user123');
    
    expect(result).toEqual('question123');
    expect(repository.getQuizById).toHaveBeenCalledWith('123', 'user123');
    expect(repository.addQuestionToQuiz).toHaveBeenCalledWith('123', questionData);
  });

  it('doit throw ForbiddenException quand ajout de question dans le quizz dun autre user', async () => {
    const mockQuiz = { userId: 'different-user', title: 'Test Quiz' };
    const questionData = { 
      title: 'New Question', 
      answers: [{ title: 'Answer 1', isCorrect: true }] 
    };

    repository.getQuizById.mockResolvedValue(mockQuiz);

    await expect(service.addQuestionToQuiz('123', questionData, 'user123'))
      .rejects.toThrow(ForbiddenException);
  });
});