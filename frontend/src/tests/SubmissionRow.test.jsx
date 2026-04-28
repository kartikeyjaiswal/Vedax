import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SubmissionRow } from '../pages/AdminDashboard'

describe('SubmissionRow Component', () => {
  const mockSub = {
    $id: '123',
    taskTitle: 'Plant a tree',
    userName: 'John Doe',
    status: 'pending',
    $createdAt: new Date().toISOString()
  }

  it('renders pending submission with approval/rejection buttons', () => {
    render(<SubmissionRow sub={mockSub} onApprove={vi.fn()} onReject={vi.fn()} />)
    
    expect(screen.getByText('Plant a tree')).toBeInTheDocument()
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
    
    // 2 buttons for pending
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('calls onApprove when approve button is clicked', async () => {
    const handleApprove = vi.fn().mockResolvedValue()
    const handleReject = vi.fn()
    
    render(<SubmissionRow sub={mockSub} onApprove={handleApprove} onReject={handleReject} />)
    
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0]) // First button is approve inside the flex
    
    await waitFor(() => {
      expect(handleApprove).toHaveBeenCalled()
    })
    expect(handleReject).not.toHaveBeenCalled()
  })

  it('hides buttons if submission is already approved', () => {
    const approvedSub = { ...mockSub, status: 'approved' }
    render(<SubmissionRow sub={approvedSub} onApprove={vi.fn()} onReject={vi.fn()} />)
    
    expect(screen.getByText('approved')).toBeInTheDocument()
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0) // No actions for already finalized
  })
})
