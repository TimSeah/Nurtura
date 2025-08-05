/// <reference types="cypress" />

describe('UC 9: Monitoring Care Recipients\' Health', () => {
  it('logs in, navigates to health monitoring, and manages care recipient data', () => {
    // Step 1: Visit login page
    cy.visit('http://localhost:5173/login');

    // Step 2: Fill login form
    cy.get('input[placeholder="Username"]').type('Bob'); // replace with valid test user
    cy.get('input[placeholder="Password"]').type('1234'); // replace with valid password
    cy.get('button[type="submit"]').click();

    // Step 3: Should redirect to dashboard
    cy.url().should('eq', 'http://localhost:5173/');

    // Step 4: Click "Health Tracking" from navbar
    cy.contains('Health Tracking').click();

    // Step 5: Should be on health monitoring page
    cy.url().should('include', '/health');
    cy.contains('Health Tracking');

    // Step 6: Verify main components are displayed
    cy.get('[data-testid="care-recipient-selector"]').should('be.visible');
    cy.get('[data-testid="medications-card"]').should('be.visible');

    // Step 7: Add a new care recipient if none exist
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="care-recipient-card"]').length === 0) {
        // Click Add Care Recipient button
        cy.contains('Add Care Recipient').click();
        
        // Fill out care recipient form
        cy.get('input[placeholder*="Name"], input').first().type('John Doe');
        cy.get('input[type="date"]').first().type('1980-05-15');
        cy.get('input[placeholder*="Relationship"], input').eq(2).type('Son');
        
        // Submit the form
        cy.contains('button', 'Add Care Recipient').click();
        
        // Wait for success and modal to close
        cy.get('.modal', { timeout: 10000 }).should('not.exist');
      }
    });

    // Step 8: Select a care recipient (if multiple exist)
    cy.get('[data-testid="care-recipient-card"]', { timeout: 10000 }).first().click();

    // Step 9: Add a new vital reading
    cy.get('[data-testid="readings-card"]').within(() => {
      cy.contains('Add Reading').click();
    });

    // Step 10: Fill in vital signs form
    cy.get('[data-testid="vital-type-select"]').select('heart_rate');
    cy.get('[data-testid="vital-value-input"]').type('72');
    cy.get('[data-testid="vital-datetime-input"]').type('2025-08-05T14:30');
    cy.get('[data-testid="vital-notes-input"]').type('Normal resting heart rate');

    // Step 11: Save the vital reading
    cy.contains('button', 'Save Reading').click();

    // Step 12: Verify form closes (indicating success)
    cy.get('[data-testid="vital-type-select"]', { timeout: 5000 }).should('not.exist');

    // Step 13: Add a journal entry (Alternate Flow A1)
    cy.get('[data-testid="journal-entries-card"]').then(($journalCard) => {
      if ($journalCard.find('button').length > 0) {
        cy.wrap($journalCard).within(() => {
          cy.get('button').first().click();
        });
        
        // Fill journal entry form
        cy.get('input[placeholder*="title"], textarea').first().type('Daily Health Update');
        cy.get('textarea').last().type('Patient shows good vital signs today. Heart rate is normal.');
        
        // Save journal entry
        cy.contains('button', 'Save').click();
        
        // Verify entry was added
        cy.contains('Daily Health Update', { timeout: 10000 }).should('be.visible');
      }
    });

    // Step 14: Verify data persistence - reload page and check data
    cy.reload();
    cy.contains('John Doe').should('be.visible');
    cy.contains('Daily Health Update').should('be.visible');
  });

  it('handles error scenarios and validation', () => {
    // Visit login page and login
    cy.visit('http://localhost:5173/login');
    cy.get('input[placeholder="Username"]').type('Bob');
    cy.get('input[placeholder="Password"]').type('1234');
    cy.get('button[type="submit"]').click();

    // Navigate to health tracking
    cy.contains('Health Tracking').click();

    // Test empty form validation (Error Flow simulation)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="care-recipient-card"]').length > 0) {
        cy.get('[data-testid="care-recipient-card"]').first().click();
        
        // Try to submit empty vital reading form
        cy.get('[data-testid="readings-card"]').within(() => {
          cy.contains('Add Reading').click();
        });
        
        // Submit without filling required fields
        cy.contains('button', 'Save Reading').click();
        
        // Check for validation (browser validation or custom messages)
        cy.get('input:invalid').should('exist');
      }
    });
  });

  it('handles missing recipient selection gracefully', () => {
    // Visit login page and login
    cy.visit('http://localhost:5173/login');
    cy.get('input[placeholder="Username"]').type('Bob');
    cy.get('input[placeholder="Password"]').type('1234');
    cy.get('button[type="submit"]').click();

    // Navigate to health tracking
    cy.contains('Health Tracking').click();

    // Verify appropriate messaging when no recipient is selected (Error Flow E1 simulation)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="care-recipient-card"]').length === 0) {
        // Should show appropriate messaging or prompts
        cy.contains('Add Care Recipient').should('be.visible');
      }
    });
  });
});
