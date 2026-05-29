import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Menu, X } from 'lucide-react';
import api from '@/lib/api';

const QuickMenu = () => {
  const [items, setItems] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef(null);

  useEffect(() => {
    api.get('/quick-menu').then(res => {
      setItems(res.data || []);
    }).catch(() => {});
  }, []);

  // Close mobile FAB on click outside
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClickOutside = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileOpen]);

  if (!items.length) return null;

  const renderIconLink = (item, opts = {}) => {
    const LucideIcon = LucideIcons[item.icon] || LucideIcons.Link;
    const isExternal = /^https?:\/\//i.test(item.url);
    const { className = '', onClick } = opts;
    const content = (
      <div className={className} data-testid={`quick-menu-item-${item.item_id}`}>
        {item.custom_icon_url ? (
          <img src={item.custom_icon_url} alt={item.name} className="w-6 h-6 object-contain" />
        ) : (
          <LucideIcon className="w-6 h-6 text-[#33404f]" strokeWidth={2.2} />
        )}
      </div>
    );
    return isExternal ? (
      <a key={item.item_id} href={item.url} target="_blank" rel="noopener noreferrer" onClick={onClick} className="block">
        {content}
      </a>
    ) : (
      <Link key={item.item_id} to={item.url} onClick={onClick} className="block">
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* DESKTOP: vertical column always visible */}
      <div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-start"
        data-testid="quick-menu"
      >
        <div className="bg-[#33404f] rounded-r-2xl shadow-xl overflow-hidden flex flex-col">
          {items.map((item) => (
            <div
              key={item.item_id}
              onMouseEnter={() => setHoveredId(item.item_id)}
              onMouseLeave={() => setHoveredId(prev => (prev === item.item_id ? null : prev))}
            >
              {renderIconLink(item, {
                className: 'w-12 h-12 flex items-center justify-center bg-[#00e7ff] hover:bg-[#00d4e8] transition-colors',
              })}
            </div>
          ))}
        </div>

        {/* Labels column for desktop hover */}
        <div className="relative pointer-events-none">
          {items.map((item, idx) => {
            const isHover = hoveredId === item.item_id;
            return (
              <div
                key={item.item_id}
                className={`absolute left-0 bg-[#33404f] text-white text-sm font-semibold whitespace-nowrap px-4 py-2 rounded-r-lg shadow-lg transition-all duration-200 ${isHover ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                style={{ top: `${idx * 48 + 8}px` }}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE: Floating Action Button bottom-left */}
      <div
        ref={mobileRef}
        className="fixed left-4 bottom-4 z-40 md:hidden flex flex-col-reverse items-start gap-3"
        data-testid="quick-menu-mobile"
      >
        {/* Main toggle FAB */}
        <button
          type="button"
          onClick={() => setMobileOpen(o => !o)}
          className="w-14 h-14 rounded-full bg-[#00e7ff] hover:bg-[#00d4e8] text-[#33404f] shadow-xl flex items-center justify-center transition-all active:scale-95"
          aria-expanded={mobileOpen}
          aria-label="Menú rápido"
          data-testid="quick-menu-fab"
        >
          {mobileOpen ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Menu className="w-6 h-6" strokeWidth={2.5} />}
        </button>

        {/* Items appear above the FAB when open (staggered) */}
        {items.map((item, idx) => (
          <div
            key={item.item_id}
            className={`flex items-center gap-3 transition-all duration-300 ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            style={{ transitionDelay: mobileOpen ? `${idx * 40}ms` : '0ms' }}
          >
            {renderIconLink(item, {
              className: 'w-12 h-12 rounded-full bg-[#00e7ff] shadow-lg flex items-center justify-center active:scale-95 transition-transform',
              onClick: () => setMobileOpen(false),
            })}
            <span className="bg-[#33404f] text-white text-sm font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg shadow-md">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default QuickMenu;
