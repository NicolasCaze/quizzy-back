import { 
  Controller, Post, Body, Req, Get, HttpCode, Request, Res, 
  Param, Patch, NotFoundException, Put, BadRequestException 
} from '@nestjs/common';

import { QuizzService } from '../service/quizz.service';
import { RequestWithUser } from '../../auth/model';
import { Auth } from '../../auth/middleware/auth.decorator';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@Controller('quiz')
@ApiTags('Quiz') // Ajoute un tag pour Swagger
export class QuizzController {
  constructor(private readonly quizService: QuizzService) {}

  @Post()
  @Auth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Créer un nouveau quiz' })
  @ApiResponse({ status: 201, description: 'Quiz créé avec succès' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Histoire de France' },
        description: { type: 'string', example: 'Un quiz sur l’histoire de France' }
      }
    }
  })
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
  @ApiOperation({ summary: 'Récupérer tous les quiz de l’utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des quiz récupérée avec succès' })
  async getQuizzes(@Req() request: RequestWithUser) {
      const uid = request.user.uid;
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      return this.quizService.getQuizzes(uid, baseUrl);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Récupérer un quiz par ID' })
  @ApiResponse({ status: 200, description: 'Quiz trouvé' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé ou n’appartient pas à l’utilisateur' })
  @ApiParam({ name: 'id', required: true, description: 'ID du quiz' })
  async getQuizById(@Req() request: RequestWithUser, @Param('id') quizId: string): Promise<any> {
    const uid = request.user.uid;
    const quiz= await this.quizService.getQuizById(quizId, uid);
    if (!quiz) {
      throw new NotFoundException('Quiz not found or does not belong to the user');
    }
    return quiz;
  }

  @Patch(':id')
  @Auth()
  @HttpCode(204)
  @ApiOperation({ summary: 'Mettre à jour le titre d’un quiz' })
  @ApiResponse({ status: 204, description: 'Titre mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Opération invalide ou quiz non trouvé' })
  @ApiParam({ name: 'id', required: true, description: 'ID du quiz' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          op: { type: 'string', example: 'replace' },
          path: { type: 'string', example: '/title' },
          value: { type: 'string', example: 'Nouveau titre du quiz' }
        }
      }
    }
  })
  async updateQuizTitle(
    @Param('id') id: string,
    @Body() operations: { op: string; path: string; value: string }[],
    @Req() request: RequestWithUser
  ) {
    const userId = request.user.uid;
    const updateOperation = operations.find(op => op.op === "replace" && op.path === "/title");
    if (!updateOperation) {
      throw new NotFoundException("Invalid update operation");
    }
    await this.quizService.updateQuizTitle(id, updateOperation.value, userId);
  }

  @Post(':id/questions')
  @Auth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Ajouter une question à un quiz' })
  @ApiResponse({ status: 201, description: 'Question ajoutée avec succès' })
  @ApiParam({ name: 'id', required: true, description: 'ID du quiz' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Quelle est la capitale de la France ?' },
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', example: 'Paris' },
              isCorrect: { type: 'boolean', example: true }
            }
          }
        }
      }
    }
  })
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
  @Auth()
  @HttpCode(204)
  @ApiOperation({ summary: 'Mettre à jour une question d’un quiz' })
  @ApiResponse({ status: 204, description: 'Question mise à jour avec succès' })
  @ApiParam({ name: 'id', required: true, description: 'ID du quiz' })
  @ApiParam({ name: 'questionId', required: true, description: 'ID de la question' })
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
  @ApiOperation({ summary: 'Démarrer un quiz' })
  @ApiResponse({ status: 201, description: 'Quiz démarré avec succès' })
  @ApiResponse({ status: 400, description: 'Quiz non prêt à être démarré' })
  @ApiResponse({ status: 404, description: 'Quiz non trouvé' })
  @ApiParam({ name: 'id', required: true, description: 'ID du quiz' })
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
