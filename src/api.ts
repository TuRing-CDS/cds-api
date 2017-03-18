/**
 * Created by Z on 2017-03-18.
 */
import {loadApiSync, api08, api10,} from 'raml-1-parser';
import {IParsedTypeCollection, loadTypeCollection} from 'raml-typesystem';
import * as path from 'path';
import * as fs from 'fs';
import * as vm from 'vm';

export class Api {

    apiPath: string;
    api: api08.Api|api10.Api;
    schemas: Map<string,any> = new Map();

    load(apiPath: string) {
        this.apiPath = apiPath;
        this.api = loadApiSync(this.apiPath);
        this.loadSchemas(this.api.schemas());
        this.loadResources(this.api.resources());
    }

    schemaToJsonSchema(schema: api10.TypeDeclaration): any {
        let json: any = schema.toJSON();
        json = json[schema.name()];
        if (json.type && json.type.length) {
            return Object.assign({name: schema.name()}, this.jsonToJsonSchema(json.type[json.type.length - 1]));
        }
        return null;
    }

    jsonToJsonSchema(jsonStr: string): any {
        try {
            return JSON.parse(jsonStr);
        } catch (ex) {
            return null
        }
    }

    loadSchemas(schemas: Array<api08.GlobalSchema|api10.TypeDeclaration>): void {
        schemas.forEach((item: api10.TypeDeclaration) => {
            let jsonSchema: any = this.schemaToJsonSchema(item);
            if (null !== jsonSchema) {
                this.addSchema(jsonSchema.name, jsonSchema);
            }
        });
    }

    loadResources(resources: any[]) {

    }


    addSchema(name: string, jsonSchema: any) {
        this.schemas.set(name, jsonSchema);
    }
}