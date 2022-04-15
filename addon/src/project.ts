const axios = require('axios');
import * as utils from './util';

export class RafayProject{

    readonly endpoint: string
    readonly headers: any;

    constructor(key:string,endpoint: string){
        this.endpoint = endpoint;
        this.headers = {
            'Content-Type': 'application/json;charset=UTF-8',
            'X-RAFAY-API-KEYID': key
        }
    }

    async getProjectId(projectName: string): Promise<string> {
        let url = "https://console." + this.endpoint + "/auth/v1/projects/?name="+projectName;
       
        try{
        const {data} =  await axios.get(url, {withCredentials: true,headers:this.headers})
        if (data.results){
            let project = data.results.find((project:any) => project.name == projectName)
            if (project) {
                return project.id
            }else{
                throw "Project can not be found, aborting"
            }
        }else{
            throw "Project results are empty, aborting"
        }
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    const rafayError:utils.ErrorDetails = utils.extractError(error.response.data)
                    throw "Get Project Id failed with error "+rafayError.error_code+",deatils:"+rafayError.detail+", aborting"
                }else{
                    throw "Get Project Id with error "+error.message+", aborting"
                }
            
            }else{
                console.log(error)
                throw error
            }
        }

    }
}