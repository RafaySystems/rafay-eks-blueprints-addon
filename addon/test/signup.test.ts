import * as blueprints from '../src';
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const SIGNUP_URL = "https://ops.rafay.dev/auth/v1/signup/QVdTLVFTLVJBRkFZLVNJR05VUC1BUEktT1JJR0lOLUxBTUJEQS1VU0EtU1VOTllWQUxFLUNBLVZFUlNJT04tMDAwMQ/"


describe("Sign Up", ()=>{
    let mock:MockAdapter;

    beforeAll(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    describe("Sign Up New Account", ()=>{
        it("SignUp Successful",async ()=>{
            const signupResponse = {

            }
            const config = {
               organizationName: "test-org",
               email: "test@test.com",
               firstName: "fName",
               lastName: "lName",
               secretName: "test-secret",
               
            } as blueprints.RafayConfig
            mock.onPost(`${SIGNUP_URL}`).reply(200, signupResponse);
            const addon = new blueprints.RafayClusterAddOn(config)
            const signup = await addon.signUP("testpassword")
            expect(mock.history.post[0].url).toEqual(`${SIGNUP_URL}`);


        })
    });

    describe("Sign Up Existing org", ()=>{
        it("SignUp Passthrough",async ()=>{
            const signupResponse = {
               details:[
                   {
                       error_code:"CONFIG035",
                       detail: "Organization by this name already exists.Please change Organization name and retry."
                   }
               ]
            }
            const config = {
                organizationName: "test-org",
                email: "test@test.com",
                firstName: "fName",
                lastName: "lName",
                secretName: "test-secret",
                
             } as blueprints.RafayConfig
            mock.onPost(`${SIGNUP_URL}`).reply(400, signupResponse);
            const addon = new blueprints.RafayClusterAddOn(config)
            const signup = await addon.signUP("testpassword")
            
            expect(mock.history.post[0].url).toEqual(`${SIGNUP_URL}`);
        })
    });


    describe("Sign Up Server Error", ()=>{
        it("SignUp Failure",async ()=>{
            const signupResponse = {
               details:[
                   {
                       error_code:"GEN001",
                       detail: "General Error."
                   }
               ]
            }
            const config = {
                organizationName: "test-org",
                email: "test@test.com",
                firstName: "fName",
                lastName: "lName",
                secretName: "test-secret",
                
             } as blueprints.RafayConfig
            mock.onPost(`${SIGNUP_URL}`).networkErrorOnce();
            const addon = new blueprints.RafayClusterAddOn(config)
            try{
               const signup = await addon.signUP("testpassword")
            }catch(error){

                expect(error).toBe("Organization Registrion failed with Network Error, aborting")

            }
            
            expect(mock.history.post[0].url).toEqual(`${SIGNUP_URL}`);
        })
    });




});

