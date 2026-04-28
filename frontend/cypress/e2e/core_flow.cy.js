describe('Core Flow Automation', () => {
  const postfix = Date.now()
  const testUser = {
    name: 'E2E Tester',
    email: `tester${postfix}@vedax.test`,
    password: 'Password@123'
  }
  
  // NOTE: This flow will use the LIVE Local backend configured in Vite (proxying to localhost:3001)

  it('1. Registers a new user', () => {
    cy.visit('/register')
    cy.get('input[placeholder="John Doe"]').type(testUser.name)
    cy.get('input[type="email"]').type(testUser.email)
    cy.get('input[type="password"]').type(testUser.password)
    
    // Select student role
    cy.get('select').select('student')
    
    cy.get('button[type="submit"]').click()
    
    // Verify successful routing to dashboard or college selection
    cy.url({ timeout: 10000 }).should('match', /\/(dashboard|colleges)/)
  })

  // We can mock some calls if needed or proceed dynamically.

  it('2. Completes a Task Submission Mock Flow', () => {
    // If testing the layout independently of the backend data length
    cy.intercept('GET', '/api/tasks*', {
      statusCode: 200,
      body: {
        tasks: [
          { $id: 'mock-1', title: 'Plant a tree (Mock)', points: 50, category: 'Nature', difficulty: 'easy', type: 'global' }
        ],
        total: 1
      }
    }).as('getTasks')

    cy.visit('/tasks')
    cy.wait('@getTasks')
    
    cy.contains('Plant a tree (Mock)').should('be.visible')
  })

  it('3. Admin Flow Mock verification', () => {
    // Intercept to force-load admin dashboard elements securely for isolated UI-testing
    cy.intercept('GET', '/api/auth/me', {
       statusCode: 200,
       body: { role: 'admin', collegeId: 'coll-1', name: 'Mock Admin' }
    }).as('adminMe')

    cy.visit('/admin')
    cy.wait('@adminMe')
    cy.contains('Admin Dashboard').should('be.visible')
    cy.contains('Pending Reviews').should('exist')
  })
})
