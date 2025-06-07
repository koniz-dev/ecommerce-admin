import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import prismadb from '@/lib/prismadb';
import { Fragment } from 'react';

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const store = await prismadb.store.findFirst({
    where: {
      userId,
    },
  });

  if (store) {
    redirect(`/${store.id}`);
  }

  return <Fragment>{children}</Fragment>;
}
