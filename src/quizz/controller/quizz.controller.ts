
import { Controller, Post, Body, Req, Get, HttpCode, Request, Res, Param, Patch, NotFoundException, Put, BadRequestException } from '@nestjs/common';

import { QuizzService } from '../service/quizz.service';
import { RequestWithUser } from '../../auth/model';
import { Auth } from '../../auth/middleware/auth.decorator';
import { Response } from 'express';

@Controller('quiz')
export class QuizzController {
  constructor(private readonly quizService: QuizzService) {}

  @Post()
  @Auth()
  @HttpCode(201)
  async createQuiz(
    @Request() req: RequestWithUser, 
    @Body() body: { title: string, description: string },
    @Res() res: Response
  ) {
    const userId = req.user.uid;
    const result = await this.quizService.createQuiz(body.title, body.description, userId);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const location = `${baseUrl}/api/quiz/${result.id}`;
    res.setHeader('Location', location);
    res.status(201).send();
  }

  @Get()
  @Auth()
  async getQuizzes(@Req() request: RequestWithUser) {
      const uid = request.user.uid;
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      return this.quizService.getQuizzes(uid, baseUrl);
  }
  


  @Get(':id')
  @Auth()
  async getQuizById(@Req() request: RequestWithUser, @Param('id') quizId: string): Promise<any> {
    const uid = request.user.uid;
    const quiz= await this.quizService.getQuizById(quizId, uid);
    if (!quiz) {
      throw new Error('Quiz not found or does not belong to the user');
    }
    return quiz;
  }


  @Patch(':id')
  @Auth()
  @HttpCode(204)
  async updateQuizTitle(
    @Param('id') id: string,
    @Body() operations: { op: string; path: string; value: string }[],
    @Req() request: RequestWithUser
  ) {
    const userId = request.user.uid;

    // Vérifier si la requête est correcte
    const updateOperation = operations.find(op => op.op === "replace" && op.path === "/title");
    if (!updateOperation) {
      throw new NotFoundException("Invalid update operation");
    }

    await this.quizService.updateQuizTitle(id, updateOperation.value, userId);
  }

  @Post(':id/questions')
  @Auth()
  @HttpCode(201)
  async addQuestionToQuiz(
    @Param('id') id: string,
    @Body() body: { title: string; answers: { title: string; isCorrect: boolean }[] },
    @Req() request: RequestWithUser,
    @Res() res: Response
  ) {
    const userId = request.user.uid;
    const questionId = await this.quizService.addQuestionToQuiz(id, body, userId);
  
    const location = `${request.protocol}://${request.get('host')}/api/quiz/${id}/questions/${questionId}`;
    res.setHeader('Location', location);
    res.status(201).send();
  }


  @Put(':id/questions/:questionId')
  @Auth() // Vérification de l'authentification
  @HttpCode(204)
  async updateQuestion(
    @Param('id') quizId: string,
    @Param('questionId') questionId: string,
    @Req() req: RequestWithUser,
    @Body() body: { title: string; answers: any[] },
    @Res() res: Response
  ) {
    const userId = req.user.uid;

    await this.quizService.updateQuestion(quizId, questionId, userId, body);

    res.status(204).send();
  }


  @Post(':id/start')
  @Auth()
  @HttpCode(201)
  async startQuizExecution(
    @Param('id') quizId: string,
    @Req() req: RequestWithUser,
    @Res() res: Response
  ) {
    const userId = req.user.uid;

    try {
      const executionId = await this.quizService.startQuizExecution(quizId, userId);
      
      const location = `${req.protocol}://${req.get('host')}/api/execution/${executionId}`;
      

      res.setHeader('Location', location);
      res.status(201).send();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException("Quiz is not ready to be started");
    }
  }
}