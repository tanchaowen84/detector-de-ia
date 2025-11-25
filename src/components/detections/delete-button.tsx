"use client";

import { Button } from '@/components/ui/button';
import { deleteDetectionAction } from '@/actions/delete-detection';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface DeleteButtonProps {
  id: string;
  label: string;
  className?: string;
}

export function DeleteButton({ id, label, className }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        if (!confirm('Delete this record?')) return;
        startTransition(async () => {
          try {
            const res = await deleteDetectionAction({ id });
            if (!res?.data?.success) {
              toast.error(res?.data?.error ?? 'Failed to delete');
            } else {
              toast.success('Deleted');
            }
          } catch (error) {
            console.error('delete detection client error', error);
            toast.error('Failed to delete');
          }
        });
      }}
    >
      {label}
    </Button>
  );
}
