/// <reference types="cypress" />

describe('Registration Page', () => {
    beforeEach(() => {
        cy.visit('/register');
    });
    it('registers successfully with valid username and password', () => {

    const randomUsername = `user${Date.now()}`;
    let alertCalled = false;
    // Fill in registration form
    cy.get('input[placeholder="Username"]').type(randomUsername);
    cy.get('input[placeholder="Password"]').type("Testpass123");

    // Click submit
    cy.get('button[type="submit"]').click();

    // Check success message 
    cy.on("window:alert", (text) => {
      expect(text).to.include("Registration successful");
      alertCalled = true;
    });

    // redirect to login page if alert was called
    cy.url().should("include", "/login").then(() => {
      expect(alertCalled).to.be.true;
    });
  });

// invalid username tests



    it("rejects usernames with spaces", () => {
        cy.visit("http://localhost:5173/register");
        cy.get('input[placeholder="Username"]').type("john doe");
        cy.get('input[placeholder="Password"]').type("Validpass123");
        cy.get('button[type="submit"]').click();
        cy.get(".error-message").should(
        "contain",
        "Username can only contain letters, numbers, and underscores"
        );
    });

    it("rejects usernames with special characters", () => {
        cy.visit("http://localhost:5173/register");
        cy.get('input[placeholder="Username"]').type("user@name!");
        cy.get('input[placeholder="Password"]').type("Validpass123");
        cy.get('button[type="submit"]').click();
        cy.get(".error-message").should(
        "contain",
        "Username can only contain letters, numbers, and underscores"
        );
    });
    it("rejects usernames with inappropriate words", () => {
        cy.visit("http://localhost:5173/register");
        cy.get('input[placeholder="Username"]').type("hinigger123");
        cy.get('input[placeholder="Password"]').type("Validpass123");
        cy.get('button[type="submit"]').click();
        cy.get(".error-message").should(
            "contain",
            "Username is inappropriate."
        );
    });
    it("rejects usernames with profanity", () => {
        const testCases = [
        "fuckuser",
        "12thbitchlord",
        "fuck_me",
        ];

        testCases.forEach((offensiveUsername) => {
        cy.visit("http://localhost:5173/register");
        cy.get('input[placeholder="Username"]').type(offensiveUsername);
        cy.get('input[placeholder="Password"]').type("Validpass123");
        cy.get('button[type="submit"]').click();
        cy.get(".error-message").should("contain", "Username is inappropriate");
        });
    });

    it("prevents submission if username is empty", () => {
        cy.visit("http://localhost:5173/register");
        cy.get('input[placeholder="Password"]').type("Validpass123");
        cy.get('button[type="submit"]').click();

        // The browser will stop form submission, so we can assert URL stays
        cy.url().should("include", "/register");
    });

    it('shows error for existing username', () => {
        cy.get('input[placeholder="Username"]').type('Bob'); // assuming 'Bob' already exists
        cy.get('input[placeholder="Password"]').type('Testpass123');
        // Click submit
        cy.get('button[type="submit"]').click();
        // Check error message
        cy.get('.error-message').should('contain', 'Registration failed');
    });

// invalid password tests

    it("prevents submission if password is empty", () => {
        cy.visit("http://localhost:5173/register");

        // Only fill in username
        cy.get('input[placeholder="Username"]').type("testuser");

        // Click register
        cy.get('button[type="submit"]').click();

        // Form won't submit due to `required` field
        cy.url().should("include", "/register");
    });

    it('shows error for weak password', () => {
        // Fill in registration form with weak password
        cy.get('input[placeholder="Username"]').type('NewUser');
        cy.get('input[placeholder="Password"]').type('123'); // too short password

        // Click submit
        cy.get('button[type="submit"]').click();

        // Check error message
        cy.get('.error-message').should('contain', 'Password must be at least 8 characters long');
    });
    it('shows error for password without numbers', () => {
        // Fill in registration form with invalid password
        cy.get('input[placeholder="Username"]').type('NewUser');
        cy.get('input[placeholder="Password"]').type('password'); // no number

        // Click submit
        cy.get('button[type="submit"]').click();

        // Check error message
        cy.get('.error-message').should('contain', 'Password must contain at least one letter and one number');
    }); 
    it('shows error for password without letters', () => {
        // Fill in registration form with invalid password
        cy.get('input[placeholder="Username"]').type('NewUser');
        cy.get('input[placeholder="Password"]').type('12345678'); // no letter

        // Click submit
        cy.get('button[type="submit"]').click();

        // Check error message
        cy.get('.error-message').should('contain', 'Password must contain at least one letter and one number');
    });
});