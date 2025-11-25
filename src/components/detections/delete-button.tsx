"use client";

import { Button } from '@/components/ui/button';
import { deleteDetectionAction } from '@/actions/delete-detection';
import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteButtonProps {
  id: string;
  label: string;
  className?: string;
}

export function DeleteButton({ id, label, className }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={className}
        disabled={isPending}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete record</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Do you want to delete this detection?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
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
                  } finally {
                    setOpen(false);
                  }
                });
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
