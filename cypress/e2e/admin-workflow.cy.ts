describe('Admin Dashboard Workflow', () => {
  beforeEach(() => {
    // Visit the sign-in page
    cy.visit('/sign-in')
  })

  it('should complete full admin login and dashboard workflow', () => {
    // Test login
    cy.get('input[name="email"]').type('admin@test.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Should redirect to dashboard
    cy.url().should('include', '/')
    cy.contains('Logs').should('be.visible')

    // Test logs table functionality
    cy.contains('Phishing Logs').should('be.visible')
    cy.contains('Ransomware Logs').should('be.visible')
    cy.contains('DoS Logs').should('be.visible')
    cy.contains('Code Safety Logs').should('be.visible')

    // Test filtering (if data exists)
    cy.get('input[placeholder*="Search"]').first().type('test')
    
    // Test logout
    cy.get('[data-testid="account-button"]').click()
    cy.contains('Logout').click()
    
    // Should redirect to sign-in
    cy.url().should('include', '/sign-in')
  })

  it('should handle login with invalid credentials', () => {
    cy.get('input[name="email"]').type('invalid@test.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    // Should show error
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Invalid credentials')
    })
  })

  it('should navigate between different sections', () => {
    // Login first
    cy.get('input[name="email"]').type('admin@test.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Test navigation to different pages
    cy.contains('Logs').click()
    cy.url().should('include', '/logs')

    cy.contains('Reclamations').click()
    cy.url().should('include', '/reclamations')

    cy.contains('User').click()
    cy.url().should('include', '/user')
  })
})



