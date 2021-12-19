import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Plugin} from '../models';
import {PluginRepository} from '../repositories';

export class PluginController {
  constructor(
    @repository(PluginRepository)
    public pluginRepository : PluginRepository,
  ) {}

  @post('/plugins')
  @response(200, {
    description: 'Plugin model instance',
    content: {'application/json': {schema: getModelSchemaRef(Plugin)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plugin, {
            title: 'NewPlugin',
            exclude: ['id'],
          }),
        },
      },
    })
    plugin: Omit<Plugin, 'id'>,
  ): Promise<Plugin> {
    return this.pluginRepository.create(plugin);
  }

  @get('/plugins/count')
  @response(200, {
    description: 'Plugin model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Plugin) where?: Where<Plugin>,
  ): Promise<Count> {
    return this.pluginRepository.count(where);
  }

  @get('/plugins')
  @response(200, {
    description: 'Array of Plugin model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Plugin, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Plugin) filter?: Filter<Plugin>,
  ): Promise<Plugin[]> {
    return this.pluginRepository.find(filter);
  }

  @patch('/plugins')
  @response(200, {
    description: 'Plugin PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plugin, {partial: true}),
        },
      },
    })
    plugin: Plugin,
    @param.where(Plugin) where?: Where<Plugin>,
  ): Promise<Count> {
    return this.pluginRepository.updateAll(plugin, where);
  }

  @get('/plugins/{id}')
  @response(200, {
    description: 'Plugin model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Plugin, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Plugin, {exclude: 'where'}) filter?: FilterExcludingWhere<Plugin>
  ): Promise<Plugin> {
    return this.pluginRepository.findById(id, filter);
  }

  @patch('/plugins/{id}')
  @response(204, {
    description: 'Plugin PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Plugin, {partial: true}),
        },
      },
    })
    plugin: Plugin,
  ): Promise<void> {
    await this.pluginRepository.updateById(id, plugin);
  }

  @put('/plugins/{id}')
  @response(204, {
    description: 'Plugin PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() plugin: Plugin,
  ): Promise<void> {
    await this.pluginRepository.replaceById(id, plugin);
  }

  @del('/plugins/{id}')
  @response(204, {
    description: 'Plugin DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.pluginRepository.deleteById(id);
  }
}
