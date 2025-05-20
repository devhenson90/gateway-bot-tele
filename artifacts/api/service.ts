import { BaseRepository } from 'artifacts/rds/core/base.repository';
import { ICRUDService } from 'artifacts/rds/core/common/interfaces/interface.crud.service';
import { Op, Model } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { SearchDTO } from 'src/common/dto/search.dto';

export class BaseService<T> implements ICRUDService<T, void> {
  constructor(private readonly repository: BaseRepository) {}

  newEntity(data?: any): any {
    if (data instanceof Model) {
      return Object.assign({}, data.toJSON());
    }
    return Object.assign({}, data);
  }

  async create(dto: T): Promise<T> {
    const data = await this.repository.insert(dto);
    return this.newEntity(data);
  }

  async read(id: string): Promise<T> {
    const data = await this.repository.where({ id: id }, 'id').findOne();
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

  async search(searchDTO: SearchDTO, attrs?: any): Promise<ResponseDTO<T[]>> {
    this.repositoryPagination(searchDTO);
    this.repositoryQuery(searchDTO);
    this.repositoryOrderBy(searchDTO);
    this.repositoryBetween(searchDTO);

    const dtos: T[] = [];
    const responseDTO = new ResponseDTO<T[]>();

    if (searchDTO.count) {
      if (!attrs) {
        attrs = {}
      }
      attrs.distinct = true;
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

  async update(updateDTO: any): Promise<T> {
    updateDTO.updatedAt = new Date();
    const dataUpdated = await this.repository.update(updateDTO, {
      where: { id: updateDTO.id },
      returning: true,
    });
    return this.newEntity(dataUpdated[1][0]);
  }

  async delete(id: string): Promise<any> {
    return {
      deleteCount: await this.repository.where({ id: id }).delete(),
    };
  }
}
