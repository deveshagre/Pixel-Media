import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { resolvePriceBounds } from '../hooks/useMarketplace';
import { ProjectProposalModal } from '../components/marketplace/ProjectProposalModal';
import { ProjectRequest } from '../types';

describe('Pixel Media — Proposal and Marketplace Workflows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('resolvePriceBounds', () => {
    it('correctly maps price tiers to numerical bounds', () => {
      expect(resolvePriceBounds(undefined, undefined, 'under_250')).toEqual({
        min: undefined,
        max: 250,
      });

      expect(resolvePriceBounds(undefined, undefined, '250_500')).toEqual({
        min: 250,
        max: 500,
      });

      expect(resolvePriceBounds(undefined, undefined, '500_1000')).toEqual({
        min: 500,
        max: 1000,
      });

      expect(resolvePriceBounds(undefined, undefined, '1000_plus')).toEqual({
        min: 1000,
        max: undefined,
      });

      expect(resolvePriceBounds(100, 300, 'all')).toEqual({
        min: 100,
        max: 300,
      });
    });
  });

  describe('ProjectProposalModal', () => {
    const mockRequest: ProjectRequest = {
      id: 'req-test-123',
      clientId: 'client-1',
      editorId: 'demo-editor-01',
      title: 'Commercial Color Grade & Assembly',
      description: 'Need a fast 60s cut for luxury watch commercial.',
      budgetMin: 400,
      budgetMax: 800,
      requestQuote: false,
      referenceLinks: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('renders proposal modal with form fields and default milestones', () => {
      const handleClose = vi.fn();
      const handleSubmit = vi.fn();

      render(
        <ProjectProposalModal
          isOpen={true}
          onClose={handleClose}
          request={mockRequest}
          onSubmitProposal={handleSubmit}
        />
      );

      expect(screen.getByText(/CREATOR PROPOSAL & FORMAL QUOTE/i)).toBeInTheDocument();
      expect(screen.getByText(/Respond to: Commercial Color Grade & Assembly/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Total Quoted Price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Estimated Completion Date/i)).toBeInTheDocument();
      expect(screen.getByText(/Structured Milestone Agreements/i)).toBeInTheDocument();
    });

    it('validates required fields before submitting proposal', async () => {
      const handleClose = vi.fn();
      const handleSubmit = vi.fn();

      render(
        <ProjectProposalModal
          isOpen={true}
          onClose={handleClose}
          request={mockRequest}
          onSubmitProposal={handleSubmit}
        />
      );

      // Attempt submit without filling date or scope
      const submitBtn = screen.getByRole('button', { name: /Submit Proposal to Client/i });
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText(/Please specify an estimated completion or delivery date/i)).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('successfully collects structured quote, milestones, and dispatches proposal', async () => {
      const handleClose = vi.fn();
      const handleSubmit = vi.fn().mockResolvedValue({ id: 'prop-1' });

      render(
        <ProjectProposalModal
          isOpen={true}
          onClose={handleClose}
          request={mockRequest}
          onSubmitProposal={handleSubmit}
        />
      );

      // Fill in price
      const priceInput = screen.getByLabelText(/Total Quoted Price/i);
      fireEvent.change(priceInput, { target: { value: '650' } });

      // Fill in delivery date
      const dateInput = screen.getByLabelText(/Estimated Completion Date/i);
      fireEvent.change(dateInput, { target: { value: '2026-11-15' } });

      // Fill in scope summary
      const scopeInput = screen.getByPlaceholderText(/Detail your workflow, narrative pacing/i);
      fireEvent.change(scopeInput, {
        target: {
          value: 'Complete assembly cut with sound design, color grade in DaVinci Resolve, and master export.',
        },
      });

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Submit Proposal to Client/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          'req-test-123',
          expect.objectContaining({
            quotedPrice: 650,
            estimatedDelivery: '2026-11-15',
            scopeSummary: expect.stringContaining('Complete assembly cut'),
            milestones: expect.arrayContaining([
              expect.objectContaining({
                title: expect.stringContaining('Milestone 1'),
              }),
            ]),
          })
        );
      });

      // Shows success message
      await waitFor(() => {
        expect(screen.getByText(/Proposal Sent Successfully/i)).toBeInTheDocument();
      });
    });
  });
});
