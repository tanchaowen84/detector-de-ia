"use client";

import { setRetentionAction } from '@/actions/set-retention';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface RetentionFormProps {
  initialRetention: number;
  label: string;
  option30: string;
  option90: string;
  option0: string;
  saveLabel: string;
}

export function RetentionForm({
  initialRetention,
  label,
  option30,
  option90,
  option0,
  saveLabel,
}: RetentionFormProps) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const value = (formData.get('retention') ?? '30') as '0' | '30' | '90';
        startTransition(async () => {
          const res = await setRetentionAction({ retentionDays: value });
          if (!res?.data?.success) {
            toast.error(res?.data?.error ?? 'Failed to save');
          } else {
            toast.success(saveLabel);
          }
        });
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <label className="text-sm text-slate-600" htmlFor="retention-select">
        {label}
      </label>
      <select
        id="retention-select"
        name="retention"
        defaultValue={String(initialRetention)}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
        disabled={isPending}
      >
        <option value="0">{option0}</option>
        <option value="30">{option30}</option>
        <option value="90">{option90}</option>
      </select>
      <Button variant="outline" type="submit" size="sm" disabled={isPending}>
        {saveLabel}
      </Button>
    </form>
  );
}
