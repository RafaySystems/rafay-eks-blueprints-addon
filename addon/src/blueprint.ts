const axios = require('axios');
import * as utils from './util';


export interface BlueprintSnapshotList {

    rafayListMeta: RafayListMeta;
    items: any[];


}

export interface RafayListMeta {
    count: number;
    offset: number;
    limit: number;
}


export class RafayBlueprint{

    readonly endpoint: string
    readonly headers: any;

    constructor(key:string,endpoint: string){
        this.endpoint = endpoint;
        this.headers = {
            'Content-Type': 'application/json;charset=UTF-8',
            'X-RAFAY-API-KEYID': key
        }

    }

    async IsGlobalBlueprint(blueprintName: string,projectId: string): Promise<boolean> {
        let url = "https://console." + this.endpoint + "/v2/config/project/"+projectId+"/blueprint?globalScope=true";
        try{
            const {data} = await axios.get(url, {withCredentials: true, headers:this.headers})
            if (data.items){
                let blueprint = data.items.find((blueprint:any)=>{
                        return blueprint.metadata.name==blueprintName
                    })
                if(blueprint){
                    return true
                }
            }
            
            return false
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    throw "IsGlobalBlueprint failed with error "+error.response.data+", aborting"
                }else{
                    throw "IsGlobalBlueprint with error "+error.message+", aborting"
                }
            
            }else{
                console.log(error)
                throw error
            }
        }
    }

    async IsPublished(blueprintName: string,projectId: string): Promise<boolean> {

        let url = "https://console." + this.endpoint + "/v2/config/project/"+projectId+"/blueprint";
        try{
            const {data} = await axios.get(url, {withCredentials: true, headers:this.headers})
            if (data.items){
                let blueprint = data.items.find((blueprint:any)=> blueprint.metadata.name==blueprintName)

                if(blueprint && blueprint.metadata.labels && blueprint.metadata.labels["rafay.dev/published"]==="true"){
                    return true
                }
            }
            return false
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    
                    throw "IsPublished failed with error "+error.response.data+", aborting"
                }else{
                    throw "IsPublished with error "+error.message+", aborting"
                }
            
            }else{
                console.log(error)
                throw error
            }
        }
    }

    async IsBluePrintVersionPublished(blueprintName: string,projectId: string,version: string): Promise<boolean>{
        let blueprintSnapshots = await this.GetBlueprintSnapshots(blueprintName,projectId,0,50);
        if (blueprintSnapshots.items.length > 0) {
            let blueprintSnapshot = blueprintSnapshots.items.find((blueprintSnaphot)=>blueprintSnaphot.metadata.displayName===version)
            if (blueprintSnapshot){
                return true
            }
        }

        return false

    }

    async GetBlueprintSnapshots(blueprintName: string,projectId: string,offset?: 0, limit?: 50): Promise<BlueprintSnapshotList> {

        let url = "https://console." + this.endpoint + "/v2/config/project/"+projectId+"/blueprint/"+blueprintName+"/snapshot?options.limit="+limit+"&options.offset="+offset;
        try{
            const {data} = await axios.get(url, {headers:this.headers})
            if (data.items){
               return {
                 rafayListMeta: {
                     count: data.metadata.count,
                     offset: data.metadata.offset,
                     limit: data.metadata.limit
                 },
                 items: data.items
               } as BlueprintSnapshotList
            }else{
                return {
                    rafayListMeta: {
                        count: 0,
                        offset: 0,
                        limit: 0
                    },
                    items: []
                  } as BlueprintSnapshotList
            }
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    console.log(error.response)
                    throw "IsPublished Version failed with error "+error.response.data+", aborting"
                }else{
                    throw "IsPublished Version with error "+error.message+", aborting"
                }
            
            }else{
                console.log(error)
                throw error
            }
        }
       
    }


}