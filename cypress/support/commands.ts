/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom login command that handles authentication properly
Cypress.Commands.add('login', (username, password) => {
  // Clear cookies before login attempt
  cy.clearCookies();
  
  // Visit login page
  cy.visit('/login');
  
  // Perform login
  cy.get('input[placeholder="Username"]').clear().type(username);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for successful login (redirect to dashboard)
  cy.url().should('eq', 'http://localhost:5173/', { timeout: 10000 });
});

// Ensure test user exists
Cypress.Commands.add('ensureTestUser', (username, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/register`,
    body: { username, password },
    failOnStatusCode: false // Don't fail if user already exists
  }).then((response) => {
    // User creation successful or user already exists - both are OK
    expect([201, 400]).to.include(response.status);
  });
});

declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): Chainable<Element>
    ensureTestUser(username: string, password: string): Chainable<Element>
  }
}