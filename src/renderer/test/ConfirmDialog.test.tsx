import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../components/ConfirmDialog';

describe('ConfirmDialog', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when not open', () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Test" message="Test message" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when open', () => {
    render(
      <ConfirmDialog open={true} title="Delete Item" message="Are you sure?" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders default button labels', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Test" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders custom button labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        message="Test"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm clicked', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Test" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel clicked', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Test" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when backdrop clicked', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Test" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    const backdrop = document.querySelector('.fixed.inset-0');
    const innerDiv = backdrop?.querySelector('.bg-black\\/40');
    if (innerDiv) fireEvent.click(innerDiv);
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders danger variant with red styling', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Test" danger={true} onConfirm={onConfirm} onCancel={onCancel} />,
    );
    const dangerButton = screen.getByText('Confirm');
    expect(dangerButton.className).toContain('btn-danger');
  });

  it('renders normal variant without danger styling', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Test" danger={false} onConfirm={onConfirm} onCancel={onCancel} />,
    );
    const primaryButton = screen.getByText('Confirm');
    expect(primaryButton.className).toContain('btn-primary');
  });

  it('renders warning icon for non-danger', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Test" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    const amberIcon = document.querySelector('.bg-amber-100');
    expect(amberIcon).toBeInTheDocument();
  });

  it('renders danger icon for danger', () => {
    render(
      <ConfirmDialog open={true} title="Test" message="Test" danger={true} onConfirm={onConfirm} onCancel={onCancel} />,
    );
    const redIcon = document.querySelector('.bg-red-100');
    expect(redIcon).toBeInTheDocument();
  });
});
