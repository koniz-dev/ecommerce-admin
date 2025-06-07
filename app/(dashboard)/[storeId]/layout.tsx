import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import Navbar from '@/components/navbar';
import prismadb from '@/lib/prismadb';
import { Fragment } from 'react';

export default async function DashboardLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ storeId: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

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
