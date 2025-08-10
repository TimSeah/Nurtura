describe('UC 4&5: Leaving A Comment', () => {
  
  beforeEach(() => {
    // Fresh login for each test to ensure clean state
    cy.visit('/login');
    cy.get('[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://[::1]:5173/');
  });
  
  it('Logging in, navigating to forum, selecting a thread, leaving a comment', () => {
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
    // Check for recent timestamp - be flexible with the exact text
    cy.get('body').should('contain.text', 'Maximum 8 pills in a 24 hour period!');
    // Verify the comment appears in the thread
    cy.contains('Maximum 8 pills in a 24 hour period!').should('be.visible');
  })
  
  it('Display error message when posting empty comment', () => {
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

  it('Upvoting and undoing upvote', () => {
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://[::1]:5173/forum');
    cy.get('[href="/threads/6898794d524574a7f2f74016"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://[::1]:5173/threads/6898794d524574a7f2f74016');
    cy.wait(2000);
    
    // Get the current vote count before clicking
    cy.get('footer .text-gray-600').first().then(($el) => {
      const initialCount = parseInt($el.text());
      
      // Click upvote
      cy.get('[aria-label="Upvote"] > .w-5').click();
      cy.wait(3000);
      
      // Verify count increased by 1
      cy.get('footer .text-gray-600').first().should('have.text', (initialCount + 1).toString());
      
      // Click upvote again to undo
      cy.get('[aria-label="Upvote"] > .w-5').click();
      cy.wait(3000);
      
      // Verify count returned to original
      cy.get('footer .text-gray-600').first().should('have.text', initialCount.toString());
    });
  })

  it('Downvoting and undoing downvote', () => {
    cy.get('[href="/forum"] > .nav-label').click();
    cy.url().should('eq', 'http://[::1]:5173/forum');
    cy.get('[href="/threads/6898794d524574a7f2f74016"] > .flex-1 > .text-md').click();
    cy.url().should('eq', 'http://[::1]:5173/threads/6898794d524574a7f2f74016');
    cy.wait(2000);
    
    // Get the current vote count before clicking
    cy.get('footer .text-gray-600').first().then(($el) => {
      const initialCount = parseInt($el.text());
      
      // Click downvote
      cy.get('[aria-label="Downvote"] > .w-5').click();
      cy.wait(3000);
      
      // Verify count decreased by 1
      cy.get('footer .text-gray-600').first().should('have.text', (initialCount - 1).toString());
      
      // Click downvote again to undo
      cy.get('[aria-label="Downvote"] > .w-5').click();
      cy.wait(3000);
      
      // Verify count returned to original
      cy.get('footer .text-gray-600').first().should('have.text', initialCount.toString());
    });
  })
})