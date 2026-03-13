import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch (e) {}
  };

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (e) {}
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      loadNotifications();
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      loadNotifications();
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'provider_approved': return '✅';
      case 'provider_rejected': return '❌';
      case 'provider_verified': return '🏆';
      case 'new_message': return '💬';
      case 'new_review': return '⭐';
      case 'new_booking': return '📅';
      case 'booking_confirmed': return '✅';
      case 'booking_rejected': return '❌';
      case 'new_proposal': return '📩';
      case 'proposal_accepted': return '🎉';
      case 'proposal_rejected': return '😔';
      default: return '🔔';
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000 / 60;
    if (diff < 60) return `${Math.floor(diff)}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return d.toLocaleDateString('es-CL');
  };

  return (
    <div className="relative">
      <button onClick={() => { setIsOpen(!isOpen); if (!isOpen) loadNotifications(); }} className="relative p-2 hover:bg-gray-100 rounded-full">
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#00e7ff] text-[#33404f] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 max-h-96 overflow-hidden">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-bold">Notificaciones</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-sm text-[#00e7ff] hover:underline">
                  Marcar todas leídas
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-72">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Sin notificaciones</p>
              ) : (
                notifications.map(n => (
                  <div key={n.notification_id} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-red-50' : ''}`} onClick={() => markAsRead(n.notification_id)}>
                    <div className="flex gap-3">
                      <span className="text-xl">{getIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{n.title}</p>
                        <p className="text-xs text-gray-500 truncate">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-[#00e7ff] rounded-full mt-2" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
