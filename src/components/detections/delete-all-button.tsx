"use client";

import { deleteAllDetectionsAction } from '@/actions/delete-detection';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface DeleteAllButtonProps {
  label: string;
}

export function DeleteAllButton({ label }: DeleteAllButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isPending}
      size="sm"
      onClick={() => {
        if (!confirm(label)) return;
        startTransition(async () => {
          try {
            const res = await deleteAllDetectionsAction();
            if (!res?.data?.success) {
              toast.error(res?.data?.error ?? 'Failed to delete history');
            } else {
              toast.success('History deleted');
            }
          } catch (error) {
            console.error('delete all client error', error);
            toast.error('Failed to delete history');
          }
        });
      }}
    >
      {label}
    </Button>
  );
}
