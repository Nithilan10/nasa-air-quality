"use client";

import Link from 'next/link';
import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Bell, Info, Shield, AlertTriangle } from 'lucide-react';
import { LocationContext } from '../contexts/LocationContext';

export default function NavBar() {
  const { userCity } = useContext(LocationContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState<Array<{ id: number; message: string; type: string }>>([
    { id: 1, message: 'Air quality deteriorating in your area - consider staying indoors', type: 'warning' },
    { id: 2, message: 'High pollen count expected tomorrow - asthma patients take note', type: 'info' },
  ]);

  const bellRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: -1000, left: -1000 });

  const updateDropdownPosition = () => {
    const bell = bellRef.current;
    const dd = dropdownRef.current;
    if (!bell || !dd) return;
    const rect = bell.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    const left = rect.left + window.scrollX - (320 - rect.width) + rect.width;
    setDropdownPos({ top, left });
  };

  useEffect(() => {
    if (!showNotifications) return;
    updateDropdownPosition();
    const onResize = () => updateDropdownPosition();
    const onScroll = () => updateDropdownPosition();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowNotifications(false); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [showNotifications]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!showNotifications) return;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && bellRef.current && !bellRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showNotifications]);

  const dismissNotification = (id: number) => setActiveNotifications(prev => prev.filter(n => n.id !== id));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success': return <Shield className="w-5 h-5 text-green-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'success': return 'border-green-500/30 bg-green-500/10';
      case 'info': return 'border-blue-500/30 bg-blue-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        {/* Left: Title (smaller, full-gradient) */}
        <div className="flex items-center min-w-[140px] mr-4">
          <Link href="/" className="text-lg md:text-xl font-semibold bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent">
            TEMPO Air Quality Monitor
          </Link>
        </div>

        {/* Center: Nav links */}
        <nav className="flex-1 hidden md:flex items-center justify-center space-x-8">
          <Link href="/" className="text-sm text-white/70 hover:text-white">Dashboard</Link>
          <Link href="/maps" className="text-sm text-white/70 hover:text-white">Maps</Link>
          <Link href="/health" className="text-sm text-white/70 hover:text-white">Health</Link>
          <Link href="/carbon" className="text-sm text-white/70 hover:text-white">Carbon</Link>
        </nav>        {/* Right: Location + Notifications */}
  <div className="flex items-center space-x-5 ml-auto min-w-[240px] justify-end">
          <div className="hidden md:flex items-center space-x-2 text-sm text-white/80">
            <MapPin className="w-5 h-5" />
            <span className="truncate max-w-[14rem]">{userCity}</span>
          </div>

          <div className="relative">
            <button
              ref={(el) => { bellRef.current = el; return undefined; }}
              onClick={() => { if (!showNotifications) updateDropdownPosition(); setShowNotifications(!showNotifications); }}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="w-6 h-6 text-white/90" />
              {activeNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeNotifications.length}</span>
              )}
            </button>

            {showNotifications && bellRef.current && createPortal(
              <div
                ref={(el) => { dropdownRef.current = el; }}
                style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: 320, zIndex: 99999 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20"
              >
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Air Quality Alerts</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {activeNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    activeNotifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-100 last:border-b-0 ${getNotificationStyle(notification.type)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); dismissNotification(notification.id); }} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {activeNotifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200">
                    <button onClick={(e) => { e.stopPropagation(); setActiveNotifications([]); }} className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">Clear All</button>
                  </div>
                )}
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
