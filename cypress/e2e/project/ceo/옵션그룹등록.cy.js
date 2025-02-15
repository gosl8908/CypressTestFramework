const { loginModule, emailModule } = require('../../module/manager.module.js');

describe('옵션그룹 등록', () => {
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

    it('option group create', () => {
        /* 옵션 등록 */
        cy.get('[name="gnb-menu"]').contains('메뉴관리').click();
        cy.get('[href="/menu/option"] > .btn').click();

        function registerOptionGroup(optionGroup) {
            const { size, options } = optionGroup;

            cy.contains('옵션그룹 등록').click();
            cy.get('[id="OP_002"]').click(); // 다중
            cy.get('[id="requireYn_false"]').click(); // 선택
            cy.get('[name="optionGroupNm"]').type(size); // 그룹명
            for (let i = 0; i < options.length - 1; i++) {
                cy.get('div.col-3 > .btn').click();
            }

            options.forEach((option, index) => {
                cy.get('[name="optionNm"]').eq(index).type(option.name); // 옵션명
                cy.get('[name="optionPrice"]').eq(index).clear().type(option.price); // 가격
            });

            cy.get('.ms-auto').click();
            cy.wait(1000); // 1 second wait
            cy.get('.modal.show > .modal-dialog > .modal-content').contains('등록하시겠습니까?');
            cy.get('#global_modal_confirm').contains('확인').click();
        }

        const optionsArray = `${Cypress.env('optionPrices')}`
            .trim()
            .split('\n')
            .map(line => {
                const [name, price] = line.split(',').map(item => item.trim());
                return { name, price };
            });

        const optionGroups = [
            {
                size: '사이드메뉴',
                options: optionsArray,
            },
        ];

        optionGroups.forEach(group => {
            registerOptionGroup(group);
        });
    });

    afterEach('Status Check', function () {
        emailModule.screenshot2(FailureObj, Screenshots, this.currentTest);
    });
    after('Send Email', function () {
        const { title: describeTitle, tests: allTests } = this.test.parent; // describe의 제목과 모든 테스트를 한 번에 가져오기

        emailModule.email({
            TestFails,
            describeTitle,
            EmailTitle: `[${Cypress.env('EmailTitle')} ${describeTitle}]`,
            TestRange:
                '옵션 그룹 등록' + `\n${allTests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
            currentTest: FailedTests,
        });
    });
});
