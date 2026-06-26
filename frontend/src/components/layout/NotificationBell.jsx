import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import notificationService from '@/services/notificationService';
import { formatDateTime } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import useAuth from '@/hooks/useAuth';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = () => {
    Promise.all([
      notificationService.getMyNotifications(),
      notificationService.getUnreadCount(),
    ])
      .then(([notifs, count]) => {
        setNotifications(notifs.slice(0, 10));
        setUnreadCount(count);
      })
      .catch((err) => {
        console.log('Erreur notifications:', err);
      });
  };

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  useEffect(() => {
    const interval = setInterval(() => {
      notificationService.getUnreadCount().then(setUnreadCount).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (id) => {
    notificationService
      .markAsRead(id)
      .then(() => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lue: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      })
      .catch(() => toast.error('Erreur'));
  };

  const handleMarkAllAsRead = () => {
    setLoading(true);
    notificationService
      .markAllAsRead()
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
        setUnreadCount(0);
        toast.success('Toutes les notifications marquées comme lues');
      })
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  };

  // ✅ CLIQUER SUR UNE NOTIFICATION → REDIRECTION
  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id);
    setOpen(false);

    if (notif.lienAction) {
      // Petit délai pour que la marque "lue" ait le temps de se faire
      setTimeout(() => {
        navigate(notif.lienAction);
      }, 200);
    }
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'RESERVATION':
        return <Calendar className="h-5 w-5 text-[#E07A5F]" />;
      case 'EVENEMENT':
        return <Calendar className="h-5 w-5 text-[#5BBFA0]" />;
      case 'ANNONCE':
        return <Bell className="h-5 w-5 text-[#9B8EC4]" />;
      default:
        return <Bell className="h-5 w-5 text-stone-400" />;
    }
  };

  const getTimeLabel = (dateEnvoi) => {
    const date = new Date(dateEnvoi);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return formatDateTime(dateEnvoi, 'dd/MM/yyyy');
  };

  return (
    <div className="relative">
      {/* 🔔 Bell Icon */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'relative rounded-xl p-2 transition-colors',
          open ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-100'
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 📬 Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-12 z-50 w-96 rounded-2xl border border-stone-200 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <div>
                <h3 className="font-semibold text-stone-800">Notifications</h3>
                <p className="text-xs text-stone-500">
                  {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Aucune nouvelle notification'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#E07A5F] hover:underline disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tout lire
                </button>
              )}
            </div>

            {/* Liste des notifications */}
            <div className="max-h-[28rem] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-stone-300 mb-3" />
                  <p className="text-sm text-stone-500">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'group flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors',
                        !n.lue
                          ? 'bg-[#FEF0EB]/60 hover:bg-[#FEF0EB]'
                          : 'hover:bg-stone-50'
                      )}
                      onClick={() => handleNotificationClick(n)}
                    >
                      {/* Icône */}
                      <div className={cn(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                        !n.lue ? 'bg-white shadow-sm' : 'bg-stone-100'
                      )}>
                        {getIconByType(n.type)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            !n.lue ? 'text-stone-900' : 'text-stone-600'
                          )}>
                            {n.titre}
                          </p>
                          {!n.lue && (
                            <span className="h-2 w-2 rounded-full bg-[#E07A5F] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-stone-400 mt-1.5">{getTimeLabel(n.dateEnvoi)}</p>
                      </div>

                      {/* Action au survol */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-[#E07A5F] transition-opacity"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-stone-200 px-5 py-3 bg-stone-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}