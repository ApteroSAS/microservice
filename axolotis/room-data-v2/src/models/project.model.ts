import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Project extends Entity {
  @property({
    type: 'object',
  })
  plugins?: object;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  thumbnail?: string;

  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  // describe navigational properties here
}

export type ProjectWithRelations = Project & ProjectRelations;
