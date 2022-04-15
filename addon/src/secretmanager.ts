import { SecretsManager } from "aws-sdk";


export interface RafayDataRequest{

    /**
     * rafay api key
     */
    readonly key: string;

    /**
     * rafay api secret
     */
    readonly secret:string;

    /**
     * password
     */
    readonly password:string;

    /**
     * email address assigned for thie key
     */
    readonly email:string

}


export interface RafayDataResponse{

    /**
     * rafay api key
     */
    readonly key: string;

    /**
     * rafay api secret
     */
    readonly secret:string;

    /**
     * rafay password 
     */
    readonly password:string;

    /**
     * rafay email assigned with this key
     */
    readonly email:string
      
}



export class RafaySecretsManager{
     
     readonly region: string;

     constructor(region:string){
         this.region = region;
     }


    /**
     * 
     * @param secretName 
     * @returns 
     */
    async isSecretExists(secretName: string):Promise<boolean> {

        const client = new SecretsManager({ region: this.region });
        var params = {
            Filters: [
              {
                Key: "name",
                Values: [secretName]
              }
            ]
        }


        let response = await client.listSecrets(params).promise()
        if (response) {
            if (response.SecretList){
                if (response.SecretList.length > 0){
                    return true
                }   
            }
        
        }
        return false;

    }

    /**
     * 
     * @param secretName 
     * @returns 
     */
    async getSecret(secretName: string): Promise<RafayDataResponse>{

        const client = new SecretsManager({ region: this.region });
        let secretObject: any;

        try{
            let response = await client.getSecretValue({ SecretId: secretName }).promise();
            if (response) {
                if (response.SecretString) {
                    secretObject = JSON.parse(response.SecretString);
                } else if (response.SecretBinary) {
                    secretObject = JSON.parse(response.SecretBinary.toString());
                }
            }

            return secretObject
        }catch (error){
            console.error(error);
            throw error;
        }

    }

    /**
     * 
     * @param secretName 
     * @param region 
     * @param secretRequest 
     */
    async createSecret(secretName: string, region: string, secretRequest: RafayDataRequest): Promise<void>{

        const client = new SecretsManager({ region: region });
        var params = {
            Name: secretName,
            SecretString: JSON.stringify(secretRequest),
            Tags: [
                {
                    Key: "rafay",
                    Value: 'api keys'
                  },
            ]
        } as SecretsManager.Types.CreateSecretRequest

        try {
            await client.createSecret(params).promise()
       }catch (error) {
           console.error(error);
           throw error;
       }


    }


    

}






