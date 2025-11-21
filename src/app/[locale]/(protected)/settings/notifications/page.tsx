import { redirect } from 'next/navigation';
import { Routes } from '@/routes';

export default function NotificationsPage() {
  // Notificaciones deshabilitadas en MVP: redirigimos a perfil
  redirect(Routes.SettingsProfile);
}
