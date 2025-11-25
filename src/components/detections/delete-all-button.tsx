"use client";

import { deleteAllDetectionsAction } from '@/actions/delete-detection';
import { Button } from '@/components/ui/button';
import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteAllButtonProps {
  label: string;
}

export function DeleteAllButton({ label }: DeleteAllButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        type="button"
        disabled={isPending}
        size="sm"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all history</DialogTitle>
            <DialogDescription>
              This will delete all detection records for your account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
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
                  } finally {
                    setOpen(false);
                  }
                });
              }}
            >
              Delete all
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
