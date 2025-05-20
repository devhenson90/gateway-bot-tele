import { Injectable } from '@nestjs/common';
import { AssociationBaseService } from 'artifacts/api/association.service';
import { Op } from 'sequelize';
import { Status } from '../role/enum/status.enum';
import { ApplicationAssoSearchDTO } from './dto/application-asso-search.dto';
import { ApplicationAssoRepository } from './repositories/application-asso.repository';

@Injectable()
export class ApplicationAssoService extends AssociationBaseService {
  constructor(private readonly applicationAssoRepository: ApplicationAssoRepository) {
    super(applicationAssoRepository)
  }

  async search(view: string, searchDTO: ApplicationAssoSearchDTO) {
    return await super.search(view, searchDTO, {
      where: {
        status: {
          [Op.ne]: Status.Delete
        },
        // adminConsoleId: searchDTO.adminConsoleId ? searchDTO.adminConsoleId : { [Op.ne]: null },
      },
      distinct: true
    });
  }

  async readView(view: string, id: string, adminConsoleId: number): Promise<any> {
    const data = await this.applicationAssoRepository
      .include(view)
      .where({
        id: id,
        status: {
          [Op.ne]: Status.Delete
        },
        // adminConsoleId: adminConsoleId ? adminConsoleId : { [Op.ne]: null },
      })
      .findOne();
    return this.newEntity(data);
  }
}
