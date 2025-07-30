describe('UC 4&5: Leaving A Comment', () => {
  it('Leaving a comment', () => {
    cy.visit('/');
    cy.get('[placeholder="Username"]').type('Jason');
    cy.get('[placeholder="Password"]').type('Password1234');
    cy.get('.login-button').click();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://localhost:5173/forum');
    cy.get('[href="/threads/688888357f2e429ff442314a"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://localhost:5173/threads/688888357f2e429ff442314a');
    cy.get('[aria-label="Upvote"] > .w-5').click();
    cy.get('.ml-6 > span').click();
    cy.get('#content').click();
    cy.get('#content').type('Let me give him a hand :)');
    cy.get('.text-white').click();
    cy.get('.text-gray-700').should('contain', 'Jason');
    cy.get('.text-gray-500').should('contain','less than a minute ago');
    cy.get('.text-gray-500').should('contain','Let me give him a hand :)');
  })
})