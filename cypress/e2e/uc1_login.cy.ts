/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    // Clear cookies and visit login page before each test
    cy.clearCookies();
    
    // Ensure test user exists before attempting login
    // This will create the user if it doesn't exist, or silently continue if it does
    cy.ensureTestUser('Cypress', 'Testing1234!');
    
    cy.visit('/login');
    // Wait for page to fully load
    cy.get('input[placeholder="Username"]').should('be.visible');
  });

  it('logs in successfully with correct credentials', () => {
    // Fill in login form with updated selectors
    cy.get('input[placeholder="Username"]').clear().type('Cypress');
    cy.get('input[name="password"]').clear().type('Testing1234!');

    // Click submit button
    cy.get('button[type="submit"]').click();

    // Wait for and verify successful redirect to dashboard
    cy.url().should('eq', 'http://localhost:4173/', { timeout: 10000 });
    
    // Verify we're actually logged in by checking for authenticated content
    // Look for navigation elements that appear when logged in
    cy.get('nav').should('be.visible');
    cy.get('.nav-item').should('exist');
  });

  it('shows error for invalid credentials', () => {
    // Set up alert handler before triggering the action
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.get('input[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('wrongpass');

    cy.get('button[type="submit"]').click();

    // The alert should be called with the error message
    cy.get('@windowAlert').should('have.been.calledWith', 'Invalid credentials');
  });

  it('prevents submission with empty fields', () => {
    // Try to submit without filling anything
    cy.get('button[type="submit"]').click();
    
    // Should stay on login page due to HTML5 validation
    cy.url().should('include', '/login');
  });

  it('shows loading state during login attempt', () => {
    cy.get('input[placeholder="Username"]').type('Cypress');
    cy.get('input[name="password"]').type('Testing1234!');

    // Check that button shows loading state when clicked
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('contain', 'Logging in...');
  });
});