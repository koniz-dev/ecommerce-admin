import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import Navbar from '@/components/navbar';
import prismadb from '@/lib/prismadb';
import { Fragment } from 'react';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  });

  if (!store) {
    redirect('/');
  }

  return (
    <Fragment>
      <Navbar />
      {children}
    </Fragment>
  );
}
