describe('UC 4&5: Leaving A Comment', () => {
  
  it('Logging in, navigating to forum, selecting a thread, leaving a comment', () => {
    cy.visit('/login');
    cy.get('[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');
    cy.wait(2000);
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    cy.url().should('eq', 'http://[::1]:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.wait(2000);
    cy.url().should('eq', 'http://[::1]:5173/forum');
    cy.wait(2000);
    cy.get('[href="/threads/6898794d524574a7f2f74016"] > .flex-1 > .text-md').click();
    cy.wait(2000);
    cy.url().should('eq', 'http://[::1]:5173/threads/6898794d524574a7f2f74016');
    cy.wait(2000);
    cy.get('.ml-6 > span').click();
    cy.get('#content').click();
    cy.get('#content').type('Maximum 8 pills in a 24 hour period!');
    cy.wait(2000);
    cy.get('button[type="submit"]').contains('Post comment').click();
    cy.wait(2000);
    cy.get('.text-gray-700').should('contain', 'Cypress');
    cy.get('.text-gray-500').should('contain','less than a minute ago');
    cy.get('.text-gray-500').should('contain','Maximum 8 pills in a 24 hour period!');
  })
  
  it('Display error message when posting empty comment', () => {
    cy.visit('/login');
    cy.get('[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://[::1]:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://[::1]:5173/forum');
    cy.get('[href="/threads/6898794d524574a7f2f74016"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://[::1]:5173/threads/6898794d524574a7f2f74016');
    cy.get('.ml-6 > span').click();
    cy.get('#content').click();
    cy.get('button[type="submit"]').contains('Post comment').click();
    cy.get('.text-sm.text-red-800').should('be.visible').and('contain.text', 'Please write a comment before posting.');
    cy.wait(2000);
  })

  it('Upvoting a thread', () => {
    cy.visit('/login');
    cy.get('[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://[::1]:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://[::1]:5173/forum');
    cy.get('[href="/threads/6898794d524574a7f2f74016"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://[::1]:5173/threads/6898794d524574a7f2f74016');
    cy.wait(2000);
    cy.get('[aria-label="Upvote"] > .w-5').click();
    cy.wait(5000);
    cy.get('footer .text-gray-600').first().should('have.text', '1');
  })

  it('Undo upvote', () => {
    cy.visit('/login');
    cy.get('[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://[::1]:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://[::1]:5173/forum');
    
    // Find the first available thread instead of hardcoding a specific ID
    cy.get('a[href^="/threads/"]').first().click();
    
    cy.wait(2000);
    cy.get('[aria-label="Upvote"] > .w-5').click();
    cy.wait(5000);
    cy.get('footer .text-gray-600').first().should('have.text', '0');
  })

  it('Downvoting a thread', () => {
    cy.visit('/login');
    cy.get('[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://[::1]:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://[::1]:5173/forum');
    cy.get('[href="/threads/6898794d524574a7f2f74016"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://[::1]:5173/threads/6898794d524574a7f2f74016');
    cy.wait(2000);
    cy.get('[aria-label="Downvote"] > .w-5').click();
    cy.wait(5000);
    cy.get('footer .text-gray-600').first().should('have.text', '-1');
  })

  it('Undo downvote', () => {
    cy.visit('/login');
    cy.get('[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://[::1]:5173/');
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://[::1]:5173/forum');
    cy.get('[href="/threads/6898794d524574a7f2f74016"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://[::1]:5173/threads/6898794d524574a7f2f74016');
    cy.wait(2000);
    cy.get('[aria-label="Downvote"] > .w-5').click();
    cy.wait(5000);
    cy.get('footer .text-gray-600').first().should('have.text', '0');
  })
})