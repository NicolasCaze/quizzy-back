import { Injectable, Inject } from '@nestjs/common';
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';

@Injectable()
export class PingService {
  private db;

  constructor(
    @Inject(FirebaseConstants.FIREBASE_TOKEN)
    private readonly fa: FirebaseAdmin,
  ) {
    this.db = this.fa.firestore;
  }

  async getPing(): Promise<{ status: string; details: { database: string } }> {
    let dbStatus = 'OK';

    try {
      // Vérification Firestore avec une requête minimale
      await this.db.collection('healthcheck').doc('ping').get();
    } catch (error) {
      dbStatus = 'KO'; // Ne pas jeter d'exception, juste mettre à jour le statut
    }

    return {
      status: dbStatus === 'OK' ? 'OK' : 'Partial',
      details: { database: dbStatus },
    };
  }
}
