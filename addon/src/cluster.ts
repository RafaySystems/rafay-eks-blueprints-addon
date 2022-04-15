const axios = require('axios');
import * as utils from './util';
import * as blueprint from './blueprint';
import * as project from './project';

const ClusterTypeImport = "imported";



export interface ImportClusterRequest{

    readonly clusterName: string;

    readonly location: string;

    readonly blueprint: string;

    readonly blueprintVersion: string;

    readonly project: string;
}

export interface ImportClusterResponse{

    response: any;

}

export interface ClusterConfigMetro{
    name: string;
}

export interface ClusterConfig{
    name: string;
    cluster_blueprint?: string;
    cluster_blueprint_version?: string;
    metro: ClusterConfigMetro;
    cluster_type: string;
}

export class RafayClusterManager{

    readonly endpoint: string;
    readonly headers: any;
    readonly blueprint: blueprint.RafayBlueprint;
    readonly project: project.RafayProject;

    constructor(key: string, endpoint: string){
        this.endpoint = endpoint;
        this.headers = {
            'Content-Type': 'application/json',
            'X-RAFAY-API-KEYID': key
        }
        this.blueprint = new blueprint.RafayBlueprint(key,endpoint)
        this.project = new project.RafayProject(key,endpoint)
    }

    async validate(clusterData: ImportClusterRequest,projectId: string): Promise<void>{
          if(clusterData.blueprint==undefined && clusterData.blueprintVersion){
             throw "Bluepring version is defined with out brluprint name, aborting"
          }
          if(clusterData.blueprint){
             let isGlobalBlueprint = await this.blueprint.IsGlobalBlueprint(clusterData.blueprint,projectId)
             if (isGlobalBlueprint === false){
                let blueprintPublished = await this.blueprint.IsPublished(clusterData.blueprint,projectId)
                if (blueprintPublished === false){
                    throw "Blueprint by name "+clusterData.blueprint+" is not published, aborting"
                }
             }
          }

          if(clusterData.blueprintVersion){
              let isVersionPublished = await this.blueprint.IsBluePrintVersionPublished(clusterData.blueprint,projectId,clusterData.blueprintVersion)
              if (isVersionPublished === false){
                throw "Blueprintversion by name "+clusterData.blueprintVersion+" for "+clusterData.blueprint+" is not published, aborting"
              }
          }
    }

    async getManifest(clusterData: ImportClusterRequest,projectId: string):Promise<ImportClusterResponse>{
        let url = "https://console." + this.endpoint + "/v2/scheduler/project/"+projectId+"/cluster/"+clusterData.clusterName+"/download";
        try{
            const {data} = await axios.get(url, {headers:this.headers})
            return {"response": Buffer.from(data.data,'base64').toString('ascii')} as  ImportClusterResponse
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                   throw "Import cluster failed with error "+JSON.stringify(error.response.data)+", aborting"
                }else{
                    throw "Import cluster failed with error "+error.message+", aborting"
                }
            }else{
                console.log(error)
                throw error
            }
        }

    }

    async import(clusterData: ImportClusterRequest): Promise<ImportClusterResponse> {
        let projectId = await this.project.getProjectId(clusterData.project);
        await this.validate(clusterData,projectId)
        let url = "https://console." + this.endpoint + "/edge/v1/projects/"+projectId+"/edges/";
        let clusterConfig: ClusterConfig = {
            name: clusterData.clusterName,
            metro: {name:clusterData.location} as ClusterConfigMetro,
            cluster_type: ClusterTypeImport
        }
        if (clusterData.blueprint){        
            clusterConfig.cluster_blueprint = clusterData.blueprint
            if (clusterData.blueprintVersion){
                clusterConfig.cluster_blueprint_version = clusterData.blueprintVersion
            }
        }


        try{
            const {data} = await axios.post(url, clusterConfig, {withCredentials: true, headers:this.headers})
            const response = await this.getManifest(clusterData,projectId)
            return response
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    if (error.response.data.includes("Cluster name is already taken")){
                      try{
                          const response = await this.getManifest(clusterData,projectId)
                          return response
                      }catch(error1:any){
                          throw error1
                      }
                    }else{
                       throw "Import cluster failed with error "+error.response.data+", aborting"
                    }
                }else{
                    throw "Import cluster failed with error "+error.message+", aborting"
                }
            
            }else{
                console.log(error)
                throw error
            }
        }
    }
}