/**
 * Created by Z on 2017-03-16.
 */
import {loadApiSync, api10, api08} from 'raml-1-parser';
import {IParsedTypeCollection, loadTypeCollection} from 'raml-typesystem';
import * as path from 'path';
import {forEachExt} from './utils';


export class Api {
    apiPath: string;
    projectRoot: string;
    apis: any;
    schemas: IParsedTypeCollection;

    load(apiPath: string) {
        this.apiPath = apiPath;
        this.apis = loadApiSync(this.apiPath).toJSON();
        this.schemas = this.mapSchema(this.apis.schemas);
    }

    mapSchema(schemas: Array<any>): IParsedTypeCollection {
        let types: any = {};
        schemas.forEach((item: any = {}) => {
            Object.keys(item).forEach((sub: string) => {
                let subItem: any = item[sub];
                types[sub] = require(path.join(path.dirname(this.apiPath), subItem.schemaPath));
            })
        });
        return loadTypeCollection({types})
    }

    mapResources(resources: Array<any>, parent: string) {

    }
}