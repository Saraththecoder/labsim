'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FlaskConical, BookOpen, BarChart3 } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show bottom dock in desktop view (hidden on md and above)
  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      name: 'Labs',
      href: '/physics',
      icon: FlaskConical,
      isActive: pathname.startsWith('/physics') || pathname === '/lab' || pathname === '/ar',
    },
    {
      name: 'Theory',
      href: '/learn',
      icon: BookOpen,
      isActive: pathname.includes('/learn'),
    },
    {
      name: 'Reports',
      href: '/report',
      icon: BarChart3,
      isActive: pathname.includes('/report') || pathname.includes('/observations') || pathname.includes('/quiz'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-xl border-t border-[#E2E8DF] px-4 py-2 safe-area-pb shadow-[0_-4px_25px_rgba(23,35,27,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
                active
                  ? 'text-[#17231B]'
                  : 'text-[#647067] hover:text-[#17231B]'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  active ? 'bg-[#B8D96B]/35 shadow-[0_0_12px_rgba(184,217,107,0.35)]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#17231B]' : 'text-[#647067]'}`} />
              </div>
              <span className={`text-[10px] ${active ? 'font-bold text-[#17231B]' : 'font-medium text-[#647067]'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
