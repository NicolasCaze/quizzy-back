import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './controller/users.controller';
<<<<<<< HEAD:src/firebase/users/user.e2e.spec.ts
import { UserService } from './service/users.service';
=======
import { UserService } from './service/user.service';
>>>>>>> main:src/users/user.e2e.spec.ts
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';
import { RequestWithUser } from '../auth/model';
import { BadRequestException } from '@nestjs/common';

describe('Users Integration Test', () => {
  let controller: UsersController;
<<<<<<< HEAD:src/firebase/users/user.e2e.spec.ts
  let firebaseService: UserService;
=======
  let userService: UserService;
>>>>>>> main:src/users/user.e2e.spec.ts
  let mockFirebaseAdmin: Partial<FirebaseAdmin>;

  // Mock de la requête avec utilisateur
  const mockRequest = {
    user: { uid: 'test-uid' }
  } as RequestWithUser;

  beforeEach(async () => {
    // Création de mocks pour Firestore et DocumentReference
    const mockDocRef = {
      set: jest.fn(),
      get: jest.fn(),
    };

    const mockCollection = {
      doc: jest.fn().mockReturnValue(mockDocRef)
    };

    mockFirebaseAdmin = {
      firestore: {
        collection: jest.fn().mockReturnValue(mockCollection)
      } as any
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UserService,
        {
          provide: FirebaseConstants.FIREBASE_TOKEN,
          useValue: mockFirebaseAdmin
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
<<<<<<< HEAD:src/firebase/users/user.e2e.spec.ts
    firebaseService = module.get<UserService>(UserService);
=======
    userService = module.get<UserService>(UserService);
>>>>>>> main:src/users/user.e2e.spec.ts
  });

  describe('Création d\'utilisateur (addUser)', () => {
    it('devrait créer un utilisateur avec un username valide', async () => {
      // Préparer les données de test
      const username = 'testuser';
      
      // Configurer le mock de Firestore pour un ajout réussi
      (mockFirebaseAdmin.firestore.collection('users').doc as jest.Mock)
        .mockReturnValue({
          set: jest.fn().mockResolvedValue(null)
        });

      // Appeler la méthode du contrôleur
      const result = await controller.addUser(mockRequest, { username });

      // Vérifications
      expect(result).toEqual({ message: 'User created successfully' });
      
      // Vérifier que le service Firebase a été appelé correctement
      expect(mockFirebaseAdmin.firestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirebaseAdmin.firestore.collection('users').doc).toHaveBeenCalledWith('test-uid');
    });

    it('devrait lever une exception pour un username vide', async () => {
      // Tenter de créer un utilisateur avec un username vide
      await expect(
        controller.addUser(mockRequest, { username: '' })
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait gérer les erreurs de service lors de la création', async () => {
      // Simuler une erreur du service Firebase
      (mockFirebaseAdmin.firestore.collection('users').doc as jest.Mock)
        .mockReturnValue({
          set: jest.fn().mockRejectedValue(new Error('Erreur de connexion'))
        });

      // Tenter de créer un utilisateur
      await expect(
        controller.addUser(mockRequest, { username: 'testuser' })
      ).rejects.toThrow('Erreur lors de l\'ajout de l\'utilisateur : Erreur de connexion');
    });
  });

  describe('Récupération d\'utilisateur (getUser)', () => {
    it('devrait récupérer les informations d\'un utilisateur existant', async () => {
      // Préparer les données de test
      const userData = { username: 'existinguser' };
      
      // Configurer le mock de Firestore pour une récupération réussie
      (mockFirebaseAdmin.firestore.collection('users').doc as jest.Mock)
        .mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => userData
          })
        });

      // Appeler la méthode du contrôleur
      const result = await controller.getUser(mockRequest);

      // Vérifications
      expect(result).toEqual({ 
        uid: 'test-uid', 
        ...userData 
      });
      
      // Vérifier que le service Firebase a été appelé correctement
      expect(mockFirebaseAdmin.firestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirebaseAdmin.firestore.collection('users').doc).toHaveBeenCalledWith('test-uid');
    });

    it('devrait gérer la récupération d\'un utilisateur inexistant', async () => {
      // Configurer le mock de Firestore pour un utilisateur inexistant
      (mockFirebaseAdmin.firestore.collection('users').doc as jest.Mock)
        .mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false
          })
        });

      // Tenter de récupérer l'utilisateur
      await expect(
        controller.getUser(mockRequest)
      ).rejects.toThrow('Utilisateur non trouvé');
    });

    it('devrait gérer les erreurs de service lors de la récupération', async () => {
      // Simuler une erreur du service Firebase
      (mockFirebaseAdmin.firestore.collection('users').doc as jest.Mock)
        .mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error('Erreur de récupération'))
        });

      // Tenter de récupérer l'utilisateur
      await expect(
        controller.getUser(mockRequest)
      ).rejects.toThrow('Erreur lors de la récupération de l\'utilisateur : Erreur de récupération');
    });
  });
});