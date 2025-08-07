/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    // Visit login page before each test
    cy.visit('/login');
  });

  it('logs in successfully with correct credentials', () => {
    // Fill in login form with new placeholder text
    cy.get('input[placeholder="Username"]').type('Bob');
    cy.get('input[name="password"]').type('1234'); // Use name attribute since placeholder is "••••••••"

    // Click submit button
    cy.get('button[type="submit"]').click();

    // Check redirection to dashboard after successful login
    cy.url().should('eq', 'http://localhost:5173/');
  });

  it('shows error for invalid credentials', () => {
    // Set up alert handler before triggering the action
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
    });

    cy.get('input[placeholder="Username"]').type('Bob');
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
    cy.get('input[placeholder="Username"]').type('Bob');
    cy.get('input[name="password"]').type('1234');

    // Check that button shows loading state when clicked
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('contain', 'Logging in...');
  });
});