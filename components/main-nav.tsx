'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const basePath = `/${params.storeId}`;
  const routes = [
    { href: basePath, label: 'Overview' },
    { href: `${basePath}/billboards`, label: 'Billboards' },
    { href: `${basePath}/categories`, label: 'Categories' },
    { href: `${basePath}/sizes`, label: 'Sizes' },
    { href: `${basePath}/colors`, label: 'Colors' },
    { href: `${basePath}/products`, label: 'Products' },
    { href: `${basePath}/orders`, label: 'Orders' },
    { href: `${basePath}/settings`, label: 'Settings' },
  ];

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {routes.map((route) => {
        let active: boolean;

        if (route.href === basePath) {
          // Only active on the exact root path, not on nested routes
          active = pathname === basePath;
        } else {
          // Active when exactly matching, or any child route under it
          active =
            pathname === route.href || pathname.startsWith(`${route.href}/`);
        }

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              active ? 'text-black dark:text-white' : 'text-muted-foreground',
            )}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
