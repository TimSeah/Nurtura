describe('UC 3: Making A New Thread', () => {

  /* ==== Test Created with Cypress Studio ==== */
  it('Making a thread, viewing and deleting it', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:5173/forum');
    cy.get('[placeholder="Username"]').type('KH');
    cy.get('[placeholder="Password"]').type('1234');
    cy.get('.login-button').click();
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[href="/forum"] > .nav-label').click();
    cy.get('.mb-6 > :nth-child(1) > .flex > :nth-child(2)').click();
    cy.get('#title').clear('G');
    cy.get('#title').type('Grandma can\'t move her hips right');
    cy.get('#content').type('Idk, it just don\'t feel right. Makes me not wanna hit shawty and instead HIT the bitch');
    cy.get('.space-y-4 > .flex > .bg-teal-700').click();
    cy.wait(3000);
    /* ==== End Cypress Studio ==== */
    cy.contains('Grandma can\'t move her hips right').click();
    cy.wait(4000);
    cy.contains("Back to Forum").click();
    cy.wait(7000);
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[title="Delete Thread"]').first().click();
    /* ==== End Cypress Studio ==== */
  });
})