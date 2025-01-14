const { loginModule, emailModule, menuModule } = require('../../../module/manager.module.js');

describe('테이블오더 메뉴 관리', () => {
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

    it('TableOrder Menu Create', () => {
        /* 테이블오더 메뉴관리 */
        cy.get('[name="gnb-menu"]').contains('메뉴관리').click();
        cy.wait(1 * 1000);
        cy.get('[href="/menu/table-order/main"] > .btn').click();

        // menuPrices를 사용하여 메뉴와 설명을 처리
        const menuArray = `${Cypress.env('menuPrices')}`
            .trim()
            .split('\n')
            .map(line => {
                const [menu, , description] = line.split(',').map(item => item.trim()); // 메뉴 이름과 설명 추출
                return { menu, description };
            });

        // 역순으로 정렬
        const reversedMenuArray = menuArray.reverse();
        reversedMenuArray.forEach(({ menu, description }) => {
            const checkMenuVisibility = (currentPage = 1) => {
                cy.wait(1 * 1000);
                cy.get('#vueTableOrderContainer').then($container => {
                    const isMenuVisible =
                        $container.find('span').filter((i, el) => el.textContent.trim() === menu).length > 0;

                    if (!isMenuVisible) {
                        cy.get('.pagination')
                            .contains(currentPage + 1)
                            .click();
                        cy.wait(1 * 1000);
                        checkMenuVisibility(currentPage + 1);
                    } else {
                        cy.get('span')
                            .filter((i, el) => el.textContent.trim() === menu)
                            .parents('tr')
                            .within(() => {
                                cy.get('span')
                                    .filter(
                                        (i, el) => el.textContent.trim() === menu && el.classList.contains('clickable'),
                                    )
                                    .click();
                            });
                        cy.wait(1 * 1000);
                        /* 미사용 / HOT / NEW / SALE / BEST */
                        const selectors = ['#MNBG_000', '#MNBG_101', '#MNBG_102', '#MNBG_103', '#MNBG_104'];
                        const randomIndex = Math.floor(Math.random() * selectors.length);
                        cy.get(selectors[randomIndex]).click();
                        cy.wait(1 * 1000);
                        cy.get('.multisteps-form__textarea').type(description); // 메뉴 설명 입력
                        cy.wait(1 * 1000);
                        cy.get('#MN_001').click(); // 앱 노출 여부
                        cy.wait(1 * 1000);
                        cy.get('.ms-auto').click(); // 변경하기
                        cy.wait(1 * 1000);
                        cy.get('#global_modal_confirm').click(); // 확인
                        cy.wait(1 * 1000);
                        cy.go('back');
                    }
                });
            };
            checkMenuVisibility(); // 메뉴 항목의 가시성을 확인
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
            EmailTitle: `[${Cypress.env('EmailTitle')} - ${describeTitle}]`,
            TestRange:
                '테이블오더 메뉴 관리' + `\n${allTests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
            currentTest: FailedTests,
        });
    });
});
