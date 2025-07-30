/// <reference types="cypress" />

describe('Login Page', () => {
  it('logs in successfully with correct credentials', () => {
    cy.visit('/');

    // Fill in login form
    cy.get('input[placeholder="Username"]').type('Bob');
    cy.get('input[placeholder="Password"]').type('1234');

    // Click submit
    cy.get('button[type="submit"]').click();

    // Check redirection or success message
    cy.url().should('eq', 'http://localhost:5173/'); // redirected to homepage
  });

  it('shows error for invalid credentials', () => {
    cy.visit('/login');

    cy.get('input[placeholder="Username"]').type('Bob');
    cy.get('input[placeholder="Password"]').type('wrongpass');

    cy.get('button[type="submit"]').click();

    // Since it uses alert(), Cypress can catch it like this
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Invalid credentials');
    });
  });
});