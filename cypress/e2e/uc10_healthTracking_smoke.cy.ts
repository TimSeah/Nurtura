/// <reference types="cypress" />

describe('UC 10: Health Tracking - Smoke Tests', () => {
  beforeEach(() => {
    // Login and navigate to health tracking
    cy.visit('http://localhost:5173/login');
    cy.get('input[placeholder="Username"]').type('Bob');
    cy.get('input[placeholder="Password"]').type('1234');
    cy.get('button[type="submit"]').click();
    cy.contains('Health Tracking').click();
  });

  it('should load health tracking page and basic components', () => {
    // Verify page loaded
    cy.url().should('include', '/health');
    cy.contains('Health Tracking').should('be.visible');
    
    // Check main components exist
    cy.get('[data-testid="care-recipient-selector"]').should('exist');
    cy.get('[data-testid="medications-card"]').should('exist');
    
    // Verify navigation works
    cy.contains('Add Care Recipient').should('be.visible');
  });

  it('should allow basic vital reading workflow', () => {
    // Skip if no care recipients exist
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="care-recipient-card"]').length > 0) {
        // Select a recipient
        cy.get('[data-testid="care-recipient-card"]').first().click();
        
        // Add a vital reading
        cy.get('[data-testid="readings-card"]').within(() => {
          cy.contains('Add Reading').click();
        });
        
        // Set up alert spy before form submission
        cy.window().then((win) => {
          cy.stub(win, 'alert').as('windowAlert');
        });
        
        cy.get('[data-testid="vital-type-select"]').select('heart_rate');
        cy.get('[data-testid="vital-value-input"]').type('75');
        cy.get('[data-testid="vital-datetime-input"]').type('2025-08-05T14:00');
        cy.contains('button', 'Save Reading').click();
        
        // Verify success alert was called
        cy.get('@windowAlert').should('have.been.calledWith', 'Vital signs recorded successfully!');
        
        // Verify form closed (indicating success)
        cy.get('[data-testid="vital-type-select"]', { timeout: 5000 }).should('not.exist');
      }
    });
  });

  it('should handle care recipient management', () => {
    // Try to add a care recipient
    cy.contains('Add Care Recipient').click();
    cy.contains('Add New Care Recipient').should('be.visible');
    
    // Fill basic info and cancel (to avoid data pollution)
    cy.get('input[placeholder*="name" i], input[name*="name" i]').first().type('Test User');
    cy.contains('button', 'Cancel').click();
    
    // Verify modal closed
    cy.contains('Add New Care Recipient').should('not.exist');
  });
});
