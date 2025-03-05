import { Test, TestingModule } from '@nestjs/testing';
import { QuizzController } from './quizz.controller';
import { QuizzService } from '../service/quizz.service';
import { RequestWithUser } from '../../auth/model';
import { Response } from 'express';
import { NotFoundException } from '@nestjs/common';

describe('QuizzController', () => {
  let controller: QuizzController;
  let mockQuizzService: jest.Mocked<QuizzService>;

  beforeEach(async () => {
    const mockService = {
      createQuiz: jest.fn(),
      getQuizzes: jest.fn(),
      getQuizById: jest.fn(),
      updateQuizTitle: jest.fn(),
      addQuestionToQuiz: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizzController],
      providers: [
        {
          provide: QuizzService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<QuizzController>(QuizzController);
    mockQuizzService = module.get(QuizzService) as jest.Mocked<QuizzService>;
  });

  it('controller doit etre defini', () => {
    expect(controller).toBeDefined();
  });

  it('doit créer un quiz', async () => {
    const mockRequest = {
      user: { uid: 'user123' },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
    } as unknown as RequestWithUser;

    const mockResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    const createBody = { title: 'Test Quiz', description: 'Quiz description' };
    
    mockQuizzService.createQuiz.mockResolvedValue({ id: 'quiz123', message: 'Quiz created' });

    await controller.createQuiz(mockRequest, createBody, mockResponse);

    expect(mockQuizzService.createQuiz).toHaveBeenCalledWith(
      createBody.title, 
      createBody.description, 
      'user123'
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Location', 
      'http://localhost:3000/api/quiz/quiz123'
    );
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalled();
  });

  it('doit récupérer les quiz de l\'utilisateur', async () => {
    const mockRequest = {
      user: { uid: 'user123' },
    } as RequestWithUser;

    const mockQuizzes = { data: [{ id: 'quiz1', title: 'Quiz 1' }] };
    mockQuizzService.getQuizzes.mockResolvedValue(mockQuizzes);

    const result = await controller.getQuizzes(mockRequest);

    expect(mockQuizzService.getQuizzes).toHaveBeenCalledWith('user123');
    expect(result).toEqual(mockQuizzes);
  });

  it('doit récupérer un quiz par son id', async () => {
    const mockRequest = {
      user: { uid: 'user123' },
    } as RequestWithUser;

    const mockQuiz = { 
      title: 'Test Quiz', 
      description: 'Quiz description', 
      questions: [] 
    };
    mockQuizzService.getQuizById.mockResolvedValue(mockQuiz);

    const result = await controller.getQuizById(mockRequest, 'quiz123');

    expect(mockQuizzService.getQuizById).toHaveBeenCalledWith('quiz123', 'user123');
    expect(result).toEqual(mockQuiz);
  });

  it('doit lever une erreur si le quiz n\'est pas trouvé', async () => {
    const mockRequest = {
      user: { uid: 'user123' },
    } as RequestWithUser;

    mockQuizzService.getQuizById.mockResolvedValue(null);

    await expect(controller.getQuizById(mockRequest, 'quiz123'))
      .rejects.toThrow(Error);
  });

  it('doit mettre à jour le titre du quiz', async () => {
    const mockRequest = {
      user: { uid: 'user123' },
    } as RequestWithUser;

    const updateOperations = [{ 
      op: 'replace', 
      path: '/title', 
      value: 'New Quiz Title' 
    }];

    await controller.updateQuizTitle('quiz123', updateOperations, mockRequest);

    expect(mockQuizzService.updateQuizTitle).toHaveBeenCalledWith(
      'quiz123', 
      'New Quiz Title', 
      'user123'
    );
  });

  it('doit lever une erreur pour une opération de mise à jour invalide', async () => {
    const mockRequest = {
      user: { uid: 'user123' },
    } as RequestWithUser;

    const invalidUpdateOperations = [{ 
      op: 'add', 
      path: '/description', 
      value: 'New description' 
    }];

    await expect(
      controller.updateQuizTitle('quiz123', invalidUpdateOperations, mockRequest)
    ).rejects.toThrow(NotFoundException);
  });

  it('doit ajouter une question au quiz', async () => {
    const mockRequest = {
      user: { uid: 'user123' },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
    } as unknown as RequestWithUser;

    const mockResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    const questionData = { 
      title: 'New Question', 
      answers: [{ title: 'Answer 1', isCorrect: true }] 
    };

    mockQuizzService.addQuestionToQuiz.mockResolvedValue('question123');

    await controller.addQuestionToQuiz(
      'quiz123', 
      questionData, 
      mockRequest, 
      mockResponse
    );

    expect(mockQuizzService.addQuestionToQuiz).toHaveBeenCalledWith(
      'quiz123', 
      questionData, 
      'user123'
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Location', 
      'http://localhost:3000/api/quiz/quiz123/questions/question123'
    );
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalled();
  });
});