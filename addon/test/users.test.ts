import * as blueprints from '../src';
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const rsid="test-rsid"
const csrfToken ="test-csrf"
const USERS_URL = "https://console.rafay.dev/auth/v1/users/"

const config = {
    organizationName: "test-org",
    email: "test@test.com",
    firstName: "fName",
    lastName: "lName",
    secretName: "test-secret",
    
 } as blueprints.RafayConfig

 const addon = new blueprints.RafayClusterAddOn(config)

 const users = {
     users: [
         {
             account:{
                 id: "a1",
                 username: "test@test.com"
             }
         },
         {
            account:{
                id: "a2",
                username: "abc2@abc.com"
            }
         }
     ]
 }

 const nonexistingusers = {
    users: [
        {
            account:{
                id: "a1",
                username: "abc1@abc.com"
            }
        },
        {
           account:{
               id: "a2",
               username: "abc2@abc.com"
           }
        }
    ]
}



describe("Users", ()=>{

    let mock:MockAdapter;

    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    describe("Get Users", ()=>{
        it("Get Users And User Exists", async () => {
            mock.onGet(`${USERS_URL}`).reply(200, users);
            let userIdResponse = await addon.getUserId(csrfToken,rsid)
            expect(userIdResponse.userId).toEqual("a1")
            
        });
        it("Get Users And User Do Not Exist", async () => {
            mock.onGet(`${USERS_URL}`).reply(200, nonexistingusers);
            try{
            let userIdResponse = await addon.getUserId(csrfToken,rsid)
            }catch(error){
                expect(error).toEqual("User can not be found, aborting")
            }  
        });
        it("Get Users Empty Response", async () => {
            mock.onGet(`${USERS_URL}`).reply(200, {});
            try{
                let userIdResponse = await addon.getUserId(csrfToken,rsid)
            }catch(error){
                expect(error).toEqual("User can not be found, aborting")
            }  
        })
        it("Get Users Network Error", async () => {
            mock.onGet(`${USERS_URL}`).networkErrorOnce();
            try{
                let userIdResponse = await addon.getUserId(csrfToken,rsid)
            }catch(error){
                expect(error).toEqual("Get User Id with error Network Error, aborting")
            }  
        })

    });

});