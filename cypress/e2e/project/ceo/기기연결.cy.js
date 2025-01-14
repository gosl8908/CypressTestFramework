const { loginModule, emailModule, apiModule, createModule, setModule } = require('../../module/manager.module.js');

describe('매장 세팅', () => {
    let Screenshots = [];
    let TestFails = [];
    let FailureObj = { Failure: false };
    let FailedTests = [];
    beforeEach(() => {
        cy.setDateToEnv();
        cy.getAll();
        cy.err(TestFails, FailedTests, FailureObj);
        loginModule.login({
            Site: `${Cypress.env('Ceo')}`,
            Id: `${Cypress.env('monkistore')[0]}`,
            Password: `${Cypress.env('TestPwd2')}`,
        });
    });

    it('Store Setting', () => {
        const tableNo = ['1037'];
        // createModule.devicesCreate('교촌치킨(KIS/Prod)', '38241198', tableNo);
        createModule.devicesDelete('교촌치킨(KIS/Prod)', '38241198', tableNo);
    });

    afterEach('Status Check', function () {
        emailModule.screenshot2(FailureObj, Screenshots, this.currentTest);
    });
    after('Send Email', function () {
        const { title: describeTitle, tests: allTests } = this.test.parent;

        emailModule.email({
            TestFails,
            describeTitle,
            EmailTitle: `[${Cypress.env('EmailTitle')} - ${describeTitle}]`,
            TestRange: '매장 세팅' + `\n${allTests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
            currentTest: FailedTests,
        });
    });
});
