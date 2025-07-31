/// <reference types="cypress" />

describe('UC 6: Input Events To Calendar', () => {
  it('logs in, navigates to calendar, and adds an event', () => {
    // Step 1: Visit login page
    cy.visit('http://localhost:5173/login');

    // Step 2: Fill login form
    cy.get('input[placeholder="Username"]').type('Bob'); // replace with valid test user
    cy.get('input[placeholder="Password"]').type('1234'); // replace with valid password
    cy.get('button[type="submit"]').click();

    // Step 3: Should redirect to dashboard
    cy.url().should('eq', 'http://localhost:5173/');

    // Step 4: Click "Calendar" from navbar
    cy.contains('Calendar').click();

    // Step 5: Should be on calendar page
    cy.url().should('include', '/calendar');
    cy.contains('My Calendar');

    // Step 6: Click on a visible day cell
    cy.get('.calendar-day')
      .not('.empty')
      .first()
      .click();

    // Step 7: Fill in event form in modal
    cy.get('[data-testid="title-input"]').type('Test Event');
    cy.get('[data-testid="time-input"]').type('14:00');
    cy.get('[data-testid="remark-input"]').type('Bring documents');

    // Step 8: Click Save
    cy.contains('button', 'Save').click();

    // Step 9: Verify event is visible
    cy.contains('Test Event').should('exist');
  });
});
