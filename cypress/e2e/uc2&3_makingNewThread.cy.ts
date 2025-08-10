describe('UC 2&3: Making A New Thread', () => {

  /* ==== Test Created with Cypress Studio ==== */
  it('Making a thread, viewing and deleting it', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/login');
    cy.get('[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');
    cy.get('button[type="submit"]').click();
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[href="/forum"] > .nav-label').click();
    cy.get('.mb-6 > :nth-child(1) > .flex > :nth-child(2)').click();
    cy.get('#title').clear();
    cy.get('#title').type('What is the maximum dosage for panadol?');
    cy.get('#content').type('I\'m caring for my Father who is 62yo, what is the max dosage of Panadol I can give to him in 24 hours?');
    cy.get('.space-y-4 > .flex > .bg-teal-700').click();
    cy.wait(3000);
    /* ==== End Cypress Studio ==== */
    cy.contains('What is the maximum dosage for panadol?').click();
    cy.wait(4000);
    cy.contains("Back to Forum").click();
    cy.wait(7000);
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[title="Delete Thread"]').first().click();
    /* ==== End Cypress Studio ==== */
  });
})