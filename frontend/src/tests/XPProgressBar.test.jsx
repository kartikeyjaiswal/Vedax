import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { XPProgressBar } from '../pages/Dashboard'
import * as utils from '../lib/utils'

describe('XPProgressBar Component', () => {
  it('renders zero points and level accurately', () => {
    // we use real getLevelInfo logic since it's pure
    render(<XPProgressBar points={0} />)
    
    // Check level indicator exists
    const levelName = screen.getByText(/Seed/i) // default level 1
    expect(levelName).toBeInTheDocument()
    
    // Check points text
    const pointsText = screen.getByText('0')
    expect(pointsText).toBeInTheDocument()
  })
  
  it('updates progress accurately for 250 points', () => {
    render(<XPProgressBar points={250} />)
    expect(screen.getByText('250')).toBeInTheDocument()
    // It should render Level info from the getLevelInfo utility
    expect(screen.getByText(/Level 2/i)).toBeInTheDocument()
  })
})
