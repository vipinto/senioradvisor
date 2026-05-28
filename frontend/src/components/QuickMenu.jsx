import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import api from '@/lib/api';

const QuickMenu = () => {
  const [items, setItems] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    api.get('/quick-menu').then(res => {
      setItems(res.data || []);
    }).catch(() => {});
  }, []);

  if (!items.length) return null;

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-start"
      data-testid="quick-menu"
    >
      {/* Icons block (contained, rounded right side) */}
      <div className="bg-[#33404f] rounded-r-2xl shadow-xl overflow-hidden flex flex-col">
        {items.map((item) => {
          const LucideIcon = LucideIcons[item.icon] || LucideIcons.Link;
          const isExternal = /^https?:\/\//i.test(item.url);

          const iconContent = (
            <div
              className="w-12 h-12 flex items-center justify-center bg-[#00e7ff] hover:bg-[#00d4e8] transition-colors"
              onMouseEnter={() => setHoveredId(item.item_id)}
              onMouseLeave={() => setHoveredId(prev => (prev === item.item_id ? null : prev))}
              data-testid={`quick-menu-item-${item.item_id}`}
            >
              {item.custom_icon_url ? (
                <img src={item.custom_icon_url} alt={item.name} className="w-6 h-6 object-contain" />
              ) : (
                <LucideIcon className="w-6 h-6 text-[#33404f]" strokeWidth={2.2} />
              )}
            </div>
          );

          return isExternal ? (
            <a key={item.item_id} href={item.url} target="_blank" rel="noopener noreferrer" className="block">
              {iconContent}
            </a>
          ) : (
            <Link key={item.item_id} to={item.url} className="block">
              {iconContent}
            </Link>
          );
        })}
      </div>

      {/* Labels column (positioned outside, slide in on hover) */}
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
  );
};

export default QuickMenu;
