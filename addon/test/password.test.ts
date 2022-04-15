import * as blueprints from '../src';

describe("password", () => {
    describe("when password is not configured", () => {
        it("Random generated password",() => {
            const config = {

            } as blueprints.RafayConfig

            const addon = new blueprints.RafayClusterAddOn(config)
            expect(addon.password.length).toBe(10)

        });
    });
    describe("when password is configured", () => {
        it("Use a password",() => {
            let password = "testPassword"
            const config = {
                password: password
            } as blueprints.RafayConfig
            const addon = new blueprints.RafayClusterAddOn(config)
            expect(addon.password).toBe(password)
        });
    });
})