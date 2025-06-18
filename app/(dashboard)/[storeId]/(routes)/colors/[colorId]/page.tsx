import prismadb from '@/lib/prismadb';

import { ColorForm } from './components/color-form';

interface PageProps {
  params: Promise<{ colorId: string }>;
}


const ColorPage = async (props: PageProps) => {
  const { colorId } = await props.params;
  const color = colorId !== 'new'
    ? await prismadb.color.findUnique({ where: { id: colorId } })
    : null;

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorForm initialData={color} />
      </div>
    </div>
  );
};

export default ColorPage;
