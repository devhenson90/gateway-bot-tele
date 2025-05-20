import { BadRequestException, Logger } from '@nestjs/common';
import { AssociateRepository } from 'artifacts/rds/core/associate.repository';
import { RelationRepository } from 'artifacts/rds/core/relation.repository';
import { Op, Model } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { SearchDTO } from 'src/common/dto/search.dto';

export class AssociationBaseService {
  constructor(private readonly repository: AssociateRepository) {}

  newEntity(data?: any): any {
    if (data instanceof Model) {
      return Object.assign({}, data.toJSON());
    }
    return Object.assign({}, data);
  }

  protected validateView(view: string) {
    if (!Object.values(this.repository.getView()).includes(view)) {
      throw new BadRequestException('view is not valid');
    }
  }

  async createRelation(relationDTO: any): Promise<any> {
    if (!this.repository.getRelationRepository()) {
      throw new BadRequestException('relation not found');
    }
    return await this.repository
      .getRelationRepository()
      .insert(relationDTO);
  }

  async create(view: string, dto: any): Promise<any> {
    const data = await this.repository.include(view).insert(dto);
    return this.newEntity(data);
  }

  async read(view: string, id: string): Promise<any> {
    const data = await this.repository
      .include(view)
      .where({ id: id }, 'id')
      .findOne();
    return this.newEntity(data);
  }

  private repositoryPagination(searchDTO: SearchDTO) {
    if (!searchDTO.ignorePage) {
      this.repository.page(searchDTO.page, searchDTO.limit);
    }
  }

  private repositoryQuery(searchDTO: SearchDTO) {
    if (searchDTO.query) {
      this.repository.where({
        name: { [Op.iLike]: `%${searchDTO.query}%` },
      });
    }
  }

  private repositoryOrderBy(searchDTO: SearchDTO) {
    if (searchDTO.orderBy) {
      if (searchDTO.orderType === 'asc') {
        this.repository.order(searchDTO.orderBy, 'ASC');
      } else {
        this.repository.order(searchDTO.orderBy, 'DESC');
      }
    }
  }

  private repositoryBetween(searchDTO: SearchDTO) {
    if (searchDTO.between && searchDTO.betweenDate) {
      const betweenCondition = {};
      betweenCondition[searchDTO.between] = {
        [Op.between]: [
          new Date(searchDTO.getStartDate()).toUTCString(),
          new Date(searchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.repository.where(betweenCondition);
    }
  }
  
  async search(
    view: string,
    searchDTO: SearchDTO, 
    attrs?: any,
  ): Promise<ResponseDTO<any[]>> {
    this.repository.include(view);

    this.repositoryPagination(searchDTO);
    this.repositoryQuery(searchDTO);
    this.repositoryOrderBy(searchDTO);
    this.repositoryBetween(searchDTO);

    const dtos: any[] = [];
    const responseDTO = new ResponseDTO<any[]>();

    if (searchDTO.count) {
      if (!attrs) {
        attrs = {}
      }
      const { count, rows } = await this.repository.findAndCountAll(attrs);
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(dtos, rows);
    } else {
      responseDTO.data = Object.assign(
        dtos,
        await this.repository.findAll(attrs),
      );
    }
    return responseDTO;
  }

  async update(view: string, updateDTO: any): Promise<any> {
    updateDTO.updatedAt = new Date();
    const dtoUpdated = await this.repository
      .include(view)
      .update(updateDTO, {
        where: { id: updateDTO.id },
        returning: true,
      });
    const updateResponse = {
      count: dtoUpdated[0],
      [this.repository.getModel().getTableName().toString()]: dtoUpdated[1]
    };
    if (this.repository instanceof RelationRepository) {
       const repositories = this.repository.getRepositories();
       for (let repository of repositories) {
        if (repository.getIdentifierName() === 
          this.repository.getMainRepository().getIdentifierName()) {
          continue;
        }
        const tableName = repository.getModel().getTableName().toString();
        const innerUpdates = [];
        const innerUpdateDTOs = updateDTO[tableName];
        if (!innerUpdateDTOs) {
          continue;
        }
        for (let innerUpdateDTO of innerUpdateDTOs) {
          const innerDTOUpdated = await repository.update(innerUpdateDTO, {
            where: { id: innerUpdateDTO.id },
            returning: true,
          });
          innerUpdates.push(innerDTOUpdated[1]);
        }
        updateResponse[tableName] = innerUpdates;
       }
    }
    return updateResponse;
  }

  async delete(relationId: string): Promise<any> {
    if (!(this.repository instanceof RelationRepository)) {
      throw new BadRequestException('delete function is not support for this relation');
    }

    const relationRepo = this.repository.getRelationRepository();
    if (!relationRepo) {
      throw new BadRequestException('relation not found');
    }

    let relationData = await relationRepo.where({ id: relationId }).findOne();
    if (!relationData) {
      throw new BadRequestException('data not found');
    }
    relationData = this.newEntity(relationData);

    const deleteRelationCount = await relationRepo
      .where({ id: relationId })
      .delete();

    let deleteMainCount = 0;
    const mainRepo = this.repository.getMainRepository();
    const mainIdName = mainRepo.getRelationIdName();
    const existCount = await relationRepo
    .where({ [mainIdName]: relationData[mainIdName] })
    .count();

    if (!existCount) {
      deleteMainCount = await mainRepo
        .where({ id: relationData[mainIdName] })
        .delete();
    }

    const delResponse = {};
    delResponse[relationRepo.getModel().getTableName().toString()] = deleteRelationCount;
    delResponse[mainRepo.getModel().getTableName().toString()] = deleteMainCount;
    
    const repositories = this.repository.getRepositories();
    for (let repository of repositories) {
      if (repository.getIdentifierName() === 
        this.repository.getMainRepository().getIdentifierName()) {
        continue;
      }
      if (repository.getModel().getTableName.toString() === 
          relationRepo.getModel().getTableName().toString()) {
        continue;
      }
      let deleteSecCount = 0;
      try {
        deleteSecCount = await repository
        .where({ id: relationData[repository.getRelationIdName()] })
        .delete();
      } catch (err) {
        delResponse[repository.getModel().getTableName().toString()] = err.message;
        Logger.error(err, err.stack, AssociationBaseService.name + ' - ' + 'delete');
        continue;
      }
      delResponse[repository.getModel().getTableName().toString()] = deleteSecCount;
    }
    return delResponse;
  }
}
