import * as blueprints from '../src';
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const rsid="test-rsid"
const csrfToken ="test-csrf"
const userId = "user-1"
const USER_KEYS_URL = "https://console.rafay.dev/auth/v1/users/"+userId+"/apikey/";

const config = {
    organizationName: "test-org",
    email: "test@test.com",
    firstName: "fName",
    lastName: "lName",
    secretName: "test-secret",
    
 } as blueprints.RafayConfig

 const addon = new blueprints.RafayClusterAddOn(config)


 const keys = {
     key: "key-1",
     secret: "secret-1"
 }

 const error = {
     details:[
         {
             error_code: "GEN01",
             details: "genric error occured"
         }
     ]
 }



 describe("Keys", ()=>{

    let mock:MockAdapter;

    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    describe("Get Keys", ()=>{
        it("Get User Keys Success", async () => {
            mock.onPost(`${USER_KEYS_URL}`).reply(200, keys);
            let userIdResponse = await addon.getUserKeys(userId,csrfToken,rsid)
            expect(userIdResponse.key).toEqual("key-1")
            expect(userIdResponse.secret).toEqual("secret-1")
            
        });

        it("Get User Keys Failure", async () => {
            mock.onPost(`${USER_KEYS_URL}`).reply(400, error);
            try{
            let userIdResponse = await addon.getUserKeys(userId,csrfToken,rsid)
            }catch(error){
                expect(error).toEqual("Get User Keys failed with error GEN01,deatils:undefined, aborting")
            }
            
        });

        it("Get User Keys Network failure", async () => {
            mock.onPost(`${USER_KEYS_URL}`).networkErrorOnce();
            try{
            let userIdResponse = await addon.getUserKeys(userId,csrfToken,rsid)
            }catch(error){
                expect(error).toEqual("Get User Keys with error Network Error, aborting")
            }
            
        });



    })

 })


