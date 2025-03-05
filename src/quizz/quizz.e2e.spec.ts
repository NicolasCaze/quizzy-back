import { Test, TestingModule } from '@nestjs/testing';
import { QuizzService } from './service/quizz.service';
import { QuizzRepository } from './repository/quizz.repository';
import { UserService } from '../users/service/user.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('QuizzService', () => {
  let service: QuizzService;
  let repository: jest.Mocked<QuizzRepository>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    // creation d'un faux quizz repozitory
    const mockRepository = {
      createQuiz: jest.fn(),
      getQuizzes: jest.fn(),
      getQuizById: jest.fn(),
      updateQuizTitle: jest.fn(),
      addQuestionToQuiz: jest.fn(),
      updateQuestion: jest.fn(),
      startQuizExecution: jest.fn(),
    };

    const mockUserService = {
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
          provide: UserService,
          useValue: mockUserService
        }
      ],
    }).compile();

    service = module.get<QuizzService>(QuizzService);
    repository = module.get(QuizzRepository);
    userService = module.get(UserService);
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
    
    // Mock pour isQuizStartable (méthode privée)
    jest.spyOn<any, any>(service, 'isQuizStartable').mockResolvedValueOnce(true);
    
    const result = await service.getQuizzes('user123', 'http://localhost:3000');
    
    expect(result).toEqual({ 
      data: [{ 
        id: '123', 
        title: 'Test Quiz',
        _links: { start: 'http://localhost:3000/api/quiz/123/start' } 
      }],
      _links: { create: 'http://localhost:3000/api/quiz' } 
    });
    
    expect(repository.getQuizzes).toHaveBeenCalledWith('user123');
  });

  it('doit recuperer les quizz de user sans lien de démarrage quand non démarrable', async () => {
    repository.getQuizzes.mockResolvedValue({ data: [{ id: '123', title: 'Test Quiz' }] });
    
    // Mock pour isQuizStartable (méthode privée)
    jest.spyOn<any, any>(service, 'isQuizStartable').mockResolvedValueOnce(false);
    
    const result = await service.getQuizzes('user123', 'http://localhost:3000');
    
    expect(result).toEqual({ 
      data: [{ 
        id: '123', 
        title: 'Test Quiz',
        _links: {} 
      }],
      _links: { create: 'http://localhost:3000/api/quiz' } 
    });
  });

  it('isQuizStartable doit retourner true pour un quiz valide', async () => {
    const mockQuiz = {
      id: '123',
      userId: 'user123',
      title: 'Test Quiz',
      description: 'Description',
      questions: [
        {
          title: 'Question 1',
          answers: [
            { title: 'Answer 1', isCorrect: true },
            { title: 'Answer 2', isCorrect: false }
          ]
        }
      ]
    };
    
    repository.getQuizById.mockResolvedValue(mockQuiz);
    
    // Accès à la méthode privée via any
    const result = await (service as any).isQuizStartable('123', 'user123');
    
    expect(result).toBe(true);
    expect(repository.getQuizById).toHaveBeenCalledWith('123', 'user123');
  });

  it('isQuizStartable doit retourner false pour un quiz sans questions', async () => {
    const mockQuiz = {
      id: '123',
      userId: 'user123',
      title: 'Test Quiz',
      description: 'Description',
      questions: []
    };
    
    repository.getQuizById.mockResolvedValue(mockQuiz);
    
    const result = await (service as any).isQuizStartable('123', 'user123');
    
    expect(result).toBe(false);
  });

  it('isQuizStartable doit retourner false pour un quiz avec une question sans réponse correcte', async () => {
    const mockQuiz = {
      id: '123',
      userId: 'user123',
      title: 'Test Quiz',
      description: 'Description',
      questions: [
        {
          title: 'Question 1',
          answers: [
            { title: 'Answer 1', isCorrect: false },
            { title: 'Answer 2', isCorrect: false }
          ]
        }
      ]
    };
    
    repository.getQuizById.mockResolvedValue(mockQuiz);
    
    const result = await (service as any).isQuizStartable('123', 'user123');
    
    expect(result).toBe(false);
  });

  it('isQuizStartable doit retourner false pour un quiz avec plusieurs réponses correctes', async () => {
    const mockQuiz = {
      id: '123',
      userId: 'user123',
      title: 'Test Quiz',
      description: 'Description',
      questions: [
        {
          title: 'Question 1',
          answers: [
            { title: 'Answer 1', isCorrect: true },
            { title: 'Answer 2', isCorrect: true }
          ]
        }
      ]
    };
    
    repository.getQuizById.mockResolvedValue(mockQuiz);
    
    const result = await (service as any).isQuizStartable('123', 'user123');
    
    expect(result).toBe(false);
  });

  it('doit recuperer les quizz par id', async () => {
    const mockQuiz = { 
      id: '123',
      userId: 'user123',
      title: 'Test Quiz', 
      description: 'Description', 
      questions: [{ 
        title: 'Question 1',
        answers: [
          { title: 'Answer 1', isCorrect: true },
          { title: 'Answer 2', isCorrect: false }
        ] 
      }] 
    };
    repository.getQuizById.mockResolvedValue(mockQuiz);
    const result = await service.getQuizById('123', 'user123');
    expect(result).toEqual({
      id: '123',
      title: 'Test Quiz',
      description: 'Description',
      questions: [{ 
        title: 'Question 1',
        answers: [
          { title: 'Answer 1', isCorrect: true },
          { title: 'Answer 2', isCorrect: false }
        ] 
      }]
    });
    expect(repository.getQuizById).toHaveBeenCalledWith('123', 'user123');
  });

  it('doit throw NotFoundException si le quizz non trouvee par id', async () => {
    repository.getQuizById.mockResolvedValue(null);
    await expect(service.getQuizById('123', 'user123')).rejects.toThrow(NotFoundException);
  });

  it('doit mettre a jour le titre du quizz', async () => {
    const mockQuiz = { 
      id: '123',
      userId: 'user123', 
      title: 'Old Title',
      description: 'Description',
      questions: [] 
    };
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
    const mockQuiz = { 
      id: '123',
      userId: 'different-user', 
      title: 'Old Title',
      description: 'Description',
      questions: []
    };
    repository.getQuizById.mockResolvedValue(mockQuiz);

    await expect(service.updateQuizTitle('123', 'New Title', 'user123'))
      .rejects.toThrow(ForbiddenException);
  });

  it('doit ajouter la question au quizz', async () => {
    const mockQuiz = { 
      id: '123',
      userId: 'user123', 
      title: 'Test Quiz',
      description: 'Description',
      questions: []
    };
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
    const mockQuiz = { 
      id: '123',
      userId: 'different-user', 
      title: 'Test Quiz',
      description: 'Description',
      questions: []
    };
    const questionData = { 
      title: 'New Question', 
      answers: [{ title: 'Answer 1', isCorrect: true }] 
    };

    repository.getQuizById.mockResolvedValue(mockQuiz);

    await expect(service.addQuestionToQuiz('123', questionData, 'user123'))
      .rejects.toThrow(ForbiddenException);
  });

  it('doit mettre à jour une question dans un quiz', async () => {
    const questionData = {
      title: 'Updated Question',
      answers: [
        { title: 'Answer 1', isCorrect: true },
        { title: 'Answer 2', isCorrect: false }
      ]
    };

    repository.updateQuestion.mockResolvedValue(true);
    
    const result = await service.updateQuestion('123', 'question123', 'user123', questionData);
    
    expect(result).toBe(true);
    expect(repository.updateQuestion).toHaveBeenCalledWith('123', 'question123', 'user123', questionData);
  });

  it('doit throw NotFoundException quand la mise à jour de question échoue', async () => {
    const questionData = {
      title: 'Updated Question',
      answers: [
        { title: 'Answer 1', isCorrect: true },
        { title: 'Answer 2', isCorrect: false }
      ]
    };

    repository.updateQuestion.mockResolvedValue(false);
    
    await expect(service.updateQuestion('123', 'question123', 'user123', questionData))
      .rejects.toThrow(NotFoundException);
  });

  it('doit démarrer l\'exécution d\'un quiz', async () => {
    repository.startQuizExecution.mockResolvedValue('execution123');
    
    const result = await service.startQuizExecution('123', 'user123');
    
    expect(result).toBe('execution123');
    expect(repository.startQuizExecution).toHaveBeenCalledWith('123', 'user123');
  });

  it('doit throw NotFoundException quand le démarrage du quiz échoue', async () => {
    repository.startQuizExecution.mockResolvedValue(null);
    
    await expect(service.startQuizExecution('123', 'user123'))
      .rejects.toThrow(NotFoundException);
  });
});