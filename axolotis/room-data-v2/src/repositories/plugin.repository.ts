import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Plugin, PluginRelations} from '../models';

export class PluginRepository extends DefaultCrudRepository<
  Plugin,
  typeof Plugin.prototype.id,
  PluginRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Plugin, dataSource);
  }
}
