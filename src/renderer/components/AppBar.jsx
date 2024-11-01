import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/Logo 2.png';
import { useAuth } from '../services/Auth';
import StatusIndicator from '../components/StatusIndicator';

const navigation = [
  { name: 'Página Inicial', href: '/', current: true },
  { name: 'Cadastrar Clientes', href: '/clientRegistration', current: false },
  { name: 'Calendário', href: '/calendar', current: false },
  { name: 'Usuários', href: '/profile', current: false },
  { name: 'Configurações', href: '/settings', current: false },

  // icon: <CalendarIcon className="h-6 w-6" />,
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MenuAppBar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    navigation.forEach((item) => {
      item.current = item.href === location.pathname;
    });
  }, [location]);

  return (
    <div>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-24 px-4 pt-4">
          <div className="text-white text-2xl font-bold">Menu</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-10 w-10" />
          </button>
        </div>
        <nav className="mt-5">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={classNames(
                item.current
                  ? 'bg-primary-dark text-white'
                  : 'text-gray-300 hover:bg-primary-light hover:text-white',
                'group flex items-center px-2 py-6 font-medium text-xl',
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <p
            className="text-gray-300 hover:bg-primary-light hover:text-white group flex items-center px-2 py-6 font-medium text-xl"
            onClick={() => logout()}
          >
            Sair
          </p>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Disclosure as="nav" className="bg-primary fixed w-full z-10">
          <div className="mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-28 items-center justify-between">
              <div>
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-primary-light hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Abrir Menu</span>
                  <Bars3Icon className="block h-10 w-10" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/">
                    <img
                      alt="logo do escritorio"
                      src={logoImg}
                      className="h-16 w-auto"
                    />
                  </Link>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-primary-light text-xl focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-primary-dark">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Usuário</span>
                      <div className="h-12 w-12 rounded-full bg-secondary-light justify-center flex pt-1">
                        <UserIcon className="h-10 w-10" />
                        <StatusIndicator />
                      </div>
                    </MenuButton>
                  </div>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-base text-gray-700',
                          )}
                        >
                          Seu Perfil
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-base text-gray-700',
                          )}
                        >
                          Configurações
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          onClick={() => logout()}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-base text-gray-700',
                          )}
                        >
                          Sair
                        </Link>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>
        </Disclosure>
      </div>
    </div>
  );
}
