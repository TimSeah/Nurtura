describe('UC 4&5: Leaving A Comment', () => {
  
  it('Logging in, navigating to forum, selecting a thread, leaving a comment', () => {
    cy.visit('/');
    cy.get('[placeholder="Username"]').type('Ryan');
    cy.get('[placeholder="Password"]').type('Password1234');
    cy.wait(2000);
    cy.get('.login-button').click();
    cy.wait(2000);
    cy.url().should('eq', 'http://localhost:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.wait(2000);
    cy.url().should('eq', 'http://localhost:5173/forum');
    cy.wait(2000);
    cy.get('[href="/threads/688888357f2e429ff442314a"] > .flex-1 > .text-md').click();
    cy.wait(2000);
    cy.url().should('eq', 'http://localhost:5173/threads/688888357f2e429ff442314a');
    cy.wait(2000);
    cy.get('.ml-6 > span').click();
    cy.get('#content').click();
    cy.get('#content').type('Let me give him a hand :)');
    cy.wait(2000);
    cy.get('button[type="submit"]').contains('Post comment').click();
    cy.wait(2000);
    cy.get('.text-gray-700').should('contain', 'Ryan');
    cy.get('.text-gray-500').should('contain','less than a minute ago');
    cy.get('.text-gray-500').should('contain','Let me give him a hand :)');
  })
  
  it('Display error message when posting empty comment', () => {
    cy.visit('/');
    cy.get('[placeholder="Username"]').type('Ryan');
    cy.get('[placeholder="Password"]').type('Password1234');
    cy.get('.login-button').click();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://localhost:5173/forum');
    cy.get('[href="/threads/688888357f2e429ff442314a"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://localhost:5173/threads/688888357f2e429ff442314a');
    cy.get('.ml-6 > span').click();
    cy.get('#content').click();
    cy.get('button[type="submit"]').contains('Post comment').click();
    cy.get('[role="alert"]').should('be.visible').and('have.text', 'Content is required.')
    cy.wait(2000);
  })

  it('Upvoting a thread', () => {
    cy.visit('/');
    cy.get('[placeholder="Username"]').type('Ryan');
    cy.get('[placeholder="Password"]').type('Password1234');
    cy.get('.login-button').click();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://localhost:5173/forum');
    cy.get('[href="/threads/688888357f2e429ff442314a"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://localhost:5173/threads/688888357f2e429ff442314a');
    cy.wait(2000);
    cy.get('[aria-label="Upvote"] > .w-5').click();
    cy.wait(5000);
    cy.get('footer .text-gray-600').first().should('have.text', '23');
  })

  it('Undo upvote', () => {
    cy.visit('/');
    cy.get('[placeholder="Username"]').type('Ryan');
    cy.get('[placeholder="Password"]').type('Password1234');
    cy.get('.login-button').click();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://localhost:5173/forum');
    cy.get('[href="/threads/688888357f2e429ff442314a"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://localhost:5173/threads/688888357f2e429ff442314a');
    cy.wait(2000);
    cy.get('[aria-label="Upvote"] > .w-5').click();
    cy.wait(5000);
    cy.get('footer .text-gray-600').first().should('have.text', '22');
  })

  it('Downvoting a thread', () => {
    cy.visit('/');
    cy.get('[placeholder="Username"]').type('Ryan');
    cy.get('[placeholder="Password"]').type('Password1234');
    cy.get('.login-button').click();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://localhost:5173/forum');
    cy.get('[href="/threads/688888357f2e429ff442314a"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://localhost:5173/threads/688888357f2e429ff442314a');
    cy.wait(2000);
    cy.get('[aria-label="Downvote"] > .w-5').click();
    cy.wait(5000);
    cy.get('footer .text-gray-600').first().should('have.text', '21');
  })

  it('Undo downvote', () => {
    cy.visit('/');
    cy.get('[placeholder="Username"]').type('Ryan');
    cy.get('[placeholder="Password"]').type('Password1234');
    cy.get('.login-button').click();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://localhost:5173/forum');
    cy.get('[href="/threads/688888357f2e429ff442314a"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://localhost:5173/threads/688888357f2e429ff442314a');
    cy.wait(2000);
    cy.get('[aria-label="Downvote"] > .w-5').click();
    cy.wait(5000);
    cy.get('footer .text-gray-600').first().should('have.text', '22');
  })
})