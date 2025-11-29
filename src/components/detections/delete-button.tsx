"use client";

import { Button } from '@/components/ui/button';
import { deleteDetectionAction } from '@/actions/delete-detection';
import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Dashboard.history.deleteDialog');

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
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    const res = await deleteDetectionAction({ id });
                    if (!res?.data?.success) {
                      toast.error(res?.data?.error ?? t('error'));
                    } else {
                      toast.success(t('success'));
                    }
                  } catch (error) {
                    console.error('delete detection client error', error);
                    toast.error(t('error'));
                  } finally {
                    setOpen(false);
                  }
                });
              }}
            >
              {t('confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
