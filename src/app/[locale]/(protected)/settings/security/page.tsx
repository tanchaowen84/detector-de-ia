import { redirect } from 'next/navigation';
import { Routes } from '@/routes';

export default function SecurityPage() {
  // Seguridad deshabilitada en MVP: redirigimos a perfil
  redirect(Routes.SettingsProfile);
}
