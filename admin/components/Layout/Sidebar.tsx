'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Calendar, 
  Scissors, 
  BarChart3, 
  Settings,
  LogOut,
  Building2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: Users,
    children: [
      { name: 'All Users', href: '/dashboard/users' },
      { name: 'Owners', href: '/dashboard/users/owners' },
      { name: 'Customers', href: '/dashboard/users/customers' },
      { name: 'Employees', href: '/dashboard/users/employees' },
    ]
  },
  {
    name: 'Stores',
    href: '/dashboard/stores',
    icon: Store,
  },
  {
    name: 'Bookings',
    href: '/dashboard/bookings',
    icon: Calendar,
  },
  {
    name: 'Services',
    href: '/dashboard/services',
    icon: Scissors,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-black">Make My Look</h1>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => onClose()}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>

                  {/* Sub-navigation */}
                  {item.children && isActive && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`block px-3 py-1 text-xs rounded-md transition-colors ${
                              isChildActive
                                ? 'bg-gray-100 text-black'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                            onClick={() => onClose()}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;