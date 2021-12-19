import {Entity, model, property} from '@loopback/repository';

@model()
export class Plugin extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    default: "plugin",
  })
  name?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
    default: "https://files.aptero.co/api/public/dl/vBcgbzDY?inline=true",
  })
  imgurl?: string;

  @property({
    type: 'string',
    default: "ecs-component-loader",
  })
  type?: string;

  @property({
    type: 'string',
  })
  url?: string;


  constructor(data?: Partial<Plugin>) {
    super(data);
  }
}

export interface PluginRelations {
  // describe navigational properties here
}

export type PluginWithRelations = Plugin & PluginRelations;
