import * as yaml from 'js-yaml';


export function loadAll(content: string): any {
    return yaml.loadAll(content);
}