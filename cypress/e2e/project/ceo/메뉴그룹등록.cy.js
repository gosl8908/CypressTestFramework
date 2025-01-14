const { loginModule, emailModule, creatModule } = require('../../module/manager.module.js');

describe('메뉴그룹 등록', () => {
    let Screenshots = []; // 스크린샷을 저장할 배열
    let TestFails = []; // 실패 원인을 저장할 변수
    let FailureObj = { Failure: false };
    let FailedTests = []; // 실패한 테스트 정보를 저장할 배열
    beforeEach(() => {
        cy.setDateToEnv();
        cy.getAll();
        cy.err(TestFails, FailedTests, FailureObj);
        loginModule.login({
            Site: `${Cypress.env('StgCeo')}`,
            Type: '단골맛집 가맹점주',
            Id: `${Cypress.env('monkitest')[4]}`,
            Password: `${Cypress.env('TestPwd2')}`,
        });
    });

    it('menu group create', () => {
        /* 메뉴관리 */
        cy.get(':nth-child(3) > .container-fluid > .d-flex > [href="/menu/product-div"] > .btn').click();
        cy.wait(1 * 1000);
        cy.get('[href="/menu/menu-group"] > .btn').click();

        `${Cypress.env('categories')}`
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean)
            .forEach(category => {
                cy.get('#btnAddMenuGroup').click();
                cy.wait(1000);
                cy.get('#category_nm').type(category);
                cy.get('.modal-footer > .btn-primary').click();
                cy.get('#vueMenuGroupMain').contains(category);
            });
        if (`${Cypress.env('categories')}` === '주류') {
            cy.contains('span', '주류')
                .parents('tr')
                .within(() => {
                    cy.get('button').contains('수정').click();
                });
            cy.wait(1000);
            cy.get('#use_kiosk_yn_true').click();
            cy.wait(1000);
            cy.get('#use_tableorder_yn_true').click();
            cy.wait(1000);
            cy.get('.modal-footer > .btn-primary').click();
            cy.wait(1000);
        }
    });

    afterEach('Status Check', function () {
        emailModule.screenshot2(FailureObj, Screenshots, this.currentTest);
    });
    after('Send Email', function () {
        const { title: describeTitle, tests: allTests } = this.test.parent; // describe의 제목과 모든 테스트를 한 번에 가져오기

        emailModule.email({
            TestFails,
            describeTitle,
            EmailTitle: `[${Cypress.env('EmailTitle')} - ${describeTitle}]`,
            TestRange:
                '메뉴 그룹 등록' + `\n${allTests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
            currentTest: FailedTests,
        });
    });
});
