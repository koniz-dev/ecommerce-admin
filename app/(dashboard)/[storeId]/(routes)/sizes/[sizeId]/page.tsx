import prismadb from '@/lib/prismadb';

import { SizeForm } from './components/size-form';

interface PageProps {
  params: Promise<{ sizeId: string }>;
}

const SizePage = async (props: PageProps) => {
  const { sizeId } = await props.params;
  const size = sizeId !== 'new'
    ? await prismadb.size.findUnique({ where: { id: sizeId } })
    : null;

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeForm initialData={size} />
      </div>
    </div>
  );
};

export default SizePage;
