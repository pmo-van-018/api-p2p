import { Connection } from 'typeorm';
import { Factory, Seeder, times } from 'typeorm-seeding';

import { Fiat } from '@api/master-data/models/Fiat';

export class FiatSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const em = connection.createEntityManager();
    const fiats = await this.fetchFiats();
    await times(fiats.length, async (n) => {
      const fiat: Fiat = new Fiat();

      fiat.id = fiats[n].id;
      fiat.name = fiats[n].name;
      fiat.precision = fiats[n].precision;
      fiat.symbol = fiats[n].symbol;

      return await em.save(fiat);
    });
  }

  public async fetchFiats(): Promise<Fiat[]> {
    const fiats: Fiat[] = [];
    fiats.push({
      name: 'VND',
      precision: 2,
      symbol: '₫',
    } as Fiat);
    return new Promise((resolve) => {
      resolve(fiats);
    });
  }
}
