import * as blueprints from '../src';
import axios from "axios";
import MockAdapter from "axios-mock-adapter";



const LOGIN_URL = "https://console.rafay.dev/auth/v1/login/"

describe("Login", ()=>{
    let mock:MockAdapter;

    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    describe("Login to new Account", ()=>{
        it("Login Successful",async ()=>{
            const rsid="test-rsid"
            const csrfToken ="test-csrf"
            const loginResponse = {

            }

            const headers ={
                "set-cookie":[
                    "rsid="+rsid+"; expires=Wed, 12-Jan-2022 21:01:53 GMT; HttpOnly; Max-Age=43200; Path=/; Secure",
                    "csrftoken="+csrfToken+"; expires=Wed, 11-Jan-2023 09:01:53 GMT; Max-Age=31449600; Path=/"
                ]
            }

            const config = {
                organizationName: "test-org",
                email: "test@test.com",
                firstName: "fName",
                lastName: "lName",
                secretName: "test-secret",
                
             } as blueprints.RafayConfig

             mock.onPost(`${LOGIN_URL}`).reply(200, loginResponse,headers);
             const addon = new blueprints.RafayClusterAddOn(config)
             const login:blueprints.RafayLoginResponse = await addon.login("testpassword")
             expect(mock.history.post[0].url).toEqual(`${LOGIN_URL}`);
             expect(login.csrfToken).toEqual(csrfToken)
             expect(login.rsid).toEqual(rsid)

        });
    });

    describe("Login Wrong Password", ()=>{
        it("Login Error",async ()=>{
            const rsid="test-rsid"
            const csrfToken ="test-csrf"
            const loginResponse = {
                 details: [
                     {
                         error_code: "AUTH01",
                         detail: "User do not exist"
                     }
                 ]
            }

            const headers ={
                "set-cookie":[
                    "rsid="+rsid+"; expires=Wed, 12-Jan-2022 21:01:53 GMT; HttpOnly; Max-Age=43200; Path=/; Secure",
                    "csrftoken="+csrfToken+"; expires=Wed, 11-Jan-2023 09:01:53 GMT; Max-Age=31449600; Path=/"
                ]
            }

            const config = {
                organizationName: "test-org",
                email: "test@test.com",
                firstName: "fName",
                lastName: "lName",
                secretName: "test-secret",
                
             } as blueprints.RafayConfig

             mock.onPost(`${LOGIN_URL}`).reply(400, loginResponse,headers);
             const addon = new blueprints.RafayClusterAddOn(config)
             try{
             const login:blueprints.RafayLoginResponse = await addon.login("testpassword")
             }catch(error){
                expect(error).toEqual("Login failed with error AUTH01,deatils:User do not exist, aborting")
             }
             expect(mock.history.post[0].url).toEqual(`${LOGIN_URL}`);


        });
    });

    describe("Login Network Error", ()=>{
        it("Login Failed",async ()=>{
            const rsid="test-rsid"
            const csrfToken ="test-csrf"
            const loginResponse = {
                 details: [
                     {
                         error_code: "AUTH01",
                         detail: "User do not exist"
                     }
                 ]
            }

            const headers ={
                "set-cookie":[
                    "rsid="+rsid+"; expires=Wed, 12-Jan-2022 21:01:53 GMT; HttpOnly; Max-Age=43200; Path=/; Secure",
                    "csrftoken="+csrfToken+"; expires=Wed, 11-Jan-2023 09:01:53 GMT; Max-Age=31449600; Path=/"
                ]
            }

            const config = {
                organizationName: "test-org",
                email: "test@test.com",
                firstName: "fName",
                lastName: "lName",
                secretName: "test-secret",
                clusterName: "test-cluster"
                
             } as blueprints.RafayConfig

             mock.onPost(`${LOGIN_URL}`).networkErrorOnce();
             const addon = new blueprints.RafayClusterAddOn(config)
             try{
             const login:blueprints.RafayLoginResponse = await addon.login("testpassword")
             }catch(error){
                expect(error).toEqual("Login failed with error Network Error, aborting")
             }
             expect(mock.history.post[0].url).toEqual(`${LOGIN_URL}`);

        });
    });

})
