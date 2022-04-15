import * as cdk from '@aws-cdk/core';
import { ClusterAddOn, ClusterInfo } from '@aws-quickstart/eks-blueprints';
import { Construct } from '@aws-cdk/core';
import * as utils from './util';
import * as secretsMgr from './secretmanager';
import * as rafaycluster from './cluster';
const axios = require('axios');
const cookie = require('cookie');
const { createHash } = require('crypto');
import * as yaml from './yaml-utils';
//import { loadAll , load} from "js-yaml";




export interface RafayConfig {

    /**
     * Organization Name
     */
     readonly organizationName?: string;

    /**
     * Email address
     */
    readonly email?: string;

    /**
     * First Name
     */
     readonly firstName?: string;

    /**
     * Last Name
     */
    readonly lastName?: string;

    /**
     * The name of the AWS Secrets Manager Secret to create.
     * key - api key
     * secret - api secret
     * password - random generated password
     */
     readonly secretName: string;


    /**
     * cluster name
     */
    readonly clusterName: string;

    /**
     * location
     */
    readonly location?: string;

    /**
     * Blueprint name
     */
     readonly blueprintName?: string;

     /**
      * Blueprint version
      */
     readonly blueprintVersion?: string;

    /**
     * Rafay Project to import cluster
     */
     readonly project?: string;

     /**
      * password for rafay registration. if not provided generate random password and will be written to secret store.
      */
     readonly password?: string;

     /**
      * password secret
      */
    readonly passwordSecret?: string;
}

export interface RafayLoginResponse {

    /**
     * Success Login response 
     */
    readonly loginResonponse: any;

    /**
     * rsid used for the api calls
     */
    readonly rsid: string;

    /**
     * CSRF token for the form
     */
    readonly csrfToken: string;

}

export interface RafayUserIdResponse {

    /**
     * The user id of the user
     */
    readonly userId: string;
}

export interface RafayKeysResponse {

    /**
     * key 
     */
    readonly key: string;

    /**
     * 
     */
    readonly secret: string

}

export interface RafaySecrectRequest{
    /**
     * key 
     */
     readonly key: string;

    /**
     * 
     */
     readonly secret: string;

     /**
      * 
      */
     readonly password: string;

     /**
      * 
      */
     readonly userName: string;
}






/**
 * Rafay Cluater Addon
 */
export class RafayClusterAddOn implements ClusterAddOn {

    readonly rafayConfig: RafayConfig;
    debugMode: boolean;
    readonly password: string;
    readonly endpoint:string;
    readonly secretName:string;
    headers = {
        'Content-Type': 'application/json;charset=UTF-8'
    }

    constructor(rafayConfig: RafayConfig, endpoint?:string,debugMode?: false) {
        this.rafayConfig = rafayConfig;

        this.endpoint = endpoint ?? "rafay.dev";
        this.debugMode = debugMode ?? false;
        this.validate();
        let officatedOrgName = this.rafayConfig.organizationName?.replace(/[&\/\\#, ()$~%'":*?<>{}]/g, '_')
        this.secretName = this.rafayConfig.secretName ?? officatedOrgName+"-"+this.rafayConfig.clusterName;
        if (this.rafayConfig.password) {
            this.password = this.rafayConfig.password
        }else{
            this.password = this.generateRandomPassword()
        }
    }


    validate(){
        if (this.rafayConfig.secretName){
            if (this.rafayConfig.clusterName === undefined){
                throw "Please provide cluster name"
            }
            // do nothing
        }else{
            if (this.rafayConfig.clusterName===undefined){
                throw "Please provide cluster name"
            }
            if (this.rafayConfig.organizationName === undefined){
                throw "Please provide organization name"
            }
        }
    }

    async getPasswordSecret(clusterInfo: ClusterInfo): Promise<string> {
        let secretsMgnr = new secretsMgr.RafaySecretsManager(clusterInfo.cluster.stack.region)
        let secretName = this.rafayConfig.passwordSecret ?? ""
        let secret: any;
        secret = await secretsMgnr.getSecret(secretName)
        if (secret.password){
            return secret.password
        }else{
            throw "Password secret should have field password, aborting"
        }
        
    }



    
    /**
     * 
     * @param clusterInfo 
     */
    async deploy(clusterInfo: ClusterInfo):  Promise<Construct> {
        let secretsMgnr = new secretsMgr.RafaySecretsManager(clusterInfo.cluster.stack.region)
        let isSecretExists = await secretsMgnr.isSecretExists(this.secretName)
        let secret:secretsMgr.RafayDataRequest;
        if (isSecretExists) {
           secret = await secretsMgnr.getSecret(this.secretName)
        }else{
            let password = this.password;
            if (this.rafayConfig.passwordSecret) {
                password = await this.getPasswordSecret(clusterInfo)
            }
            
            let signup = await this.signUP(password)
            let loginResponse = await this.login(password)
            let userId = await this.getUserId(loginResponse.csrfToken,loginResponse.rsid)
            let userKeys = await this.getUserKeys(userId.userId,loginResponse.rsid,loginResponse.csrfToken)
            secret = {
                key: userKeys.key,
                secret: userKeys.secret,
                password: password,
                email: this.rafayConfig.email
            } as secretsMgr.RafayDataRequest
            
            await secretsMgnr.createSecret(this.secretName,clusterInfo.cluster.stack.region,secret)

        }
        let clusterMgr = new rafaycluster.RafayClusterManager(secret.key,this.endpoint)
        let clusterRequest =  {
           clusterName: this.clusterName(),
           location: this.rafayConfig.location ?? "aws/"+clusterInfo.cluster.stack.region,
           blueprint: this.rafayConfig.blueprintName,
           blueprintVersion: this.rafayConfig.blueprintVersion,
           project: this.rafayConfig.project ?? "defaultproject"

        } as rafaycluster.ImportClusterRequest
        let importClusterResponse = await clusterMgr.import(clusterRequest)
        const manifests: Record<string, any>[] = yaml.loadAll(importClusterResponse.response);
        //const manifest = importClusterResponse.response.split("---").map(e => load(e));
        //const cluster = clusterInfo.cluster
        
        //const statement = new KubernetesManifest(cluster.stack, "rafay-bootstrap", {
        //    cluster,
        //    manifest,
        //    overwrite: true
        //});
        const coreChart = clusterInfo.cluster.addManifest("rafay-bootstrap",...manifests);
        return coreChart;
    }

    clusterName(){
        let clusterName = this.rafayConfig.clusterName;
        if (clusterName.length > 30) {
            clusterName = clusterName.substring(0,21)+"-"+createHash('sha1').update(clusterName).digest('hex').substring(0,8);
        }
        return clusterName.toLowerCase();
    }


    /**
     * Generates random password of length 10.
     * @returns 
     */
    generateRandomPassword(): string {
        return Math.random().toString(36).slice(-10);
    }


    /**
     * Rafay Signup
     */
    async signUP(password:string): Promise<any>{
        let url = "https://ops." + this.endpoint + "/auth/v1/signup/QVdTLVFTLVJBRkFZLVNJR05VUC1BUEktT1JJR0lOLUxBTUJEQS1VU0EtU1VOTllWQUxFLUNBLVZFUlNJT04tMDAwMQ/";
        if (this.rafayConfig.email === undefined){
           throw "Required field email is missing in config, aborting"
        }
        if (this.rafayConfig.organizationName === undefined){
            throw "Required field Oragnization Name is missing in config, aborting"
        }
        if (this.rafayConfig.firstName === undefined){
            throw "Required field First Name is missing in config, aborting"
        }
        if (this.rafayConfig.lastName === undefined){
            throw "Required field Last Name is missing in config, aborting"
        }
        let registrationData = {
            "username": this.rafayConfig.email,
            "organization_name": this.rafayConfig.organizationName,
            "first_name": this.rafayConfig.firstName,
            "last_name": this.rafayConfig.lastName,
            "password": password,
            "repeatPassword": password
        }

        try{
            const { data } = await axios.post(url, registrationData, {headers:this.headers})
            return data
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    if (utils.isDuplicateOrganization(error.response.data)){
                        console.warn("Organization already registered")
                    }else{
                        const rafayError:utils.ErrorDetails = utils.extractError(error.response.data)
                        throw "Organization Registrion failed with "+rafayError.error_code+" details:"+rafayError.detail+", aborting"
                    }
               }else{
                    throw "Organization Registrion failed with "+error.message+ ", aborting"
               }
            }else{
                console.log(error)
                throw error
            }
            
        }
    }

    


    /**
     * 
     * @returns 
     */
    async login(password:string):Promise<RafayLoginResponse>{
        let url = "https://console." + this.endpoint + "/auth/v1/login/";
        let loginData = {
            "username": this.rafayConfig.email,
            "password": password,
        }

        try{
            const response = await axios.post(url, loginData, {withCredentials: true, headers:this.headers})
            const cookies = response.headers['set-cookie']
            const rsidCookie = cookies.find((cookie:any) => cookie.startsWith('rsid='))
            const csrfCookie = cookies.find((cookie:any) => cookie.startsWith('csrftoken='))
            const parsedRsidCookie = cookie.parse(rsidCookie)
            const parsedCsrfCookie = cookie.parse(csrfCookie)
            return {loginResonponse:response.data, csrfToken: parsedCsrfCookie.csrftoken, rsid: parsedRsidCookie.rsid} as RafayLoginResponse
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    const rafayError:utils.ErrorDetails = utils.extractError(error.response.data)
                    throw "Login failed with error "+rafayError.error_code+",deatils:"+rafayError.detail+", aborting"
                }else{
                    throw "Login failed with error "+error.message+", aborting"
                }
            
            }else{
                console.log(error)
                throw error
            }
            
        }
    }

    /**
     * Get the User Id for the user registered with signup
     * @param csrf 
     * @param rsid 
     * @returns 
     */
    async getUserId(csrf:string, rsid:string):Promise<RafayUserIdResponse>{
        let url = "https://console." + this.endpoint + "/auth/v1/users/";
        const headers = {
            ...this.headers,
            'cookie': 'rsid=' + rsid+ ';csrftoken=' + csrf,
            'x-csrftoken': csrf
        }

        try{
            const {data} =  await axios.get(url, {withCredentials: true,headers:headers})
            if (data.users){
                const user = data.users.find((user:any) => user.account.username == this.rafayConfig.email)
                if (user) {
                const userId = user.account.id
                return {userId:userId} as RafayUserIdResponse
                }else{
                    throw "User can not be found, aborting"
                }
           }else{
                 throw "User can not be found, aborting"
           }
        }catch(error:any){

            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    const rafayError:utils.ErrorDetails = utils.extractError(error.response.data)
                    throw "Get User Id failed with error "+rafayError.error_code+",deatils:"+rafayError.detail+", aborting"
                }else{
                    throw "Get User Id with error "+error.message+", aborting"
                }
            
            }else{
                console.log(error)
                throw error
            }
        }
    }



    /**
     * 
     * @param user_id 
     * @param rsid 
     * @param csrfToken 
     * @returns 
     */
    async getUserKeys(user_id:string,rsid:string, csrfToken: string):Promise<RafayKeysResponse>{
        let url = "https://console." + this.endpoint + "/auth/v1/users/"+ user_id + "/apikey/";
        const headers = {
            ...this.headers,
            'cookie': 'rsid=' + rsid + ';csrftoken=' + csrfToken,
            'x-csrftoken': csrfToken,
            'referer': "https://console." + this.endpoint

        }
        const keysData = {
            "name": "dynamic"
        }

        try{
            const {data} =  await axios.post(url, keysData, {headers:headers})
            if (data.key){
                return {key: data.key, secret: data.secret} as RafayKeysResponse
            }else{
                throw "Keys retrival failed, aborting"
            }
        }catch(error:any){
            if (axios.isAxiosError(error)) {
                if (error.response?.data){
                    const rafayError:utils.ErrorDetails = utils.extractError(error.response.data)
                    throw "Get User Keys failed with error "+rafayError.error_code+",deatils:"+rafayError.detail+", aborting"
                }else{
                    throw "Get User Keys with error "+error.message+", aborting"
                }
            
            }else{
                console.log(error)
                throw error
            }
        }
    }




    





}