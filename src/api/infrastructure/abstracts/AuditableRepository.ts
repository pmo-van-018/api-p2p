import { DeepPartial, FindConditions, InsertResult, SaveOptions, UpdateResult } from "typeorm";
import { RepositoryBase } from "./RepositoryBase";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { getNamespace } from "cls-hooked";
import { CURRENT_USER_ID, SECURITY_NAMESPACE } from "@api/middlewares/ClsMiddleware";
import { Auditable } from "./Auditable";

/**
 * Should using this instead of Entity-Listener or Subscribers due to the limitation of TypeORM(See: https://typeorm.biunav.com/en/listeners-and-subscribers.html)
 *
 */
export class AuditableRepository<T extends Auditable> extends RepositoryBase<T> {

  public async update(
    criteria: string | string[] | number | number[] | Date | Date[] | FindConditions<T>,
    partialEntity: QueryDeepPartialEntity<T>,
    audit = true
  ): Promise<UpdateResult> {
    await this.beforeUpdate(partialEntity);
    if (!audit) {
      const result = super.update(criteria, partialEntity);
      await this.afterUpdate(partialEntity);
      return result;
    }

    const securityContext = getNamespace(SECURITY_NAMESPACE).get(CURRENT_USER_ID);
    if (securityContext) {
      partialEntity.updatedBy = securityContext.id;
    }
    const result = await super.update(criteria, partialEntity);
    await this.afterUpdate(partialEntity);
    return result;
  }

  public async insert(entity: QueryDeepPartialEntity<T> | (QueryDeepPartialEntity<T>[])): Promise<InsertResult> {
    await this.beforeInsert(entity);
    const securityContext = getNamespace(SECURITY_NAMESPACE).get(CURRENT_USER_ID);
    if (securityContext) {
      if (Array.isArray(entity)) {
        entity.forEach(obj => obj.createdBy = securityContext.id);
      } else {
        entity.createdBy = securityContext.id;
      }
    }
    const result = await super.insert(entity);
    await this.afterInsert(entity);
    return result;  
  }

  public async save<E extends DeepPartial<T>>(entity: E, options?: SaveOptions): Promise<E & T> {
    await this.beforeSave(entity);
    const securityContext = getNamespace(SECURITY_NAMESPACE).get(CURRENT_USER_ID);
    if (securityContext) {
      entity.updatedBy = securityContext.id;
    }
    const result = await super.save(entity, options);
    await this.afterSave(entity);
    return result;
  }
  
  public async beforeInsert(entity: QueryDeepPartialEntity<T> | (QueryDeepPartialEntity<T>[])): Promise<void> {
    //
  }

  public async afterInsert(entity: QueryDeepPartialEntity<T> | (QueryDeepPartialEntity<T>[])): Promise<void> {
    //
  }

  public async beforeUpdate(entity: QueryDeepPartialEntity<T>): Promise<void> {
    //
  }

  public async afterUpdate(entity: QueryDeepPartialEntity<T>): Promise<void> {
    //
  }

  public async beforeSave(entity: DeepPartial<T>): Promise<void> {
    //
  }

  public async afterSave(entity: DeepPartial<T>): Promise<void> {
    //
  }

  public async beforeDelete(entity: QueryDeepPartialEntity<T>): Promise<void> {
    //
  }

  public async afterDelete(entity: QueryDeepPartialEntity<T>): Promise<void> {
    //
  }

}
