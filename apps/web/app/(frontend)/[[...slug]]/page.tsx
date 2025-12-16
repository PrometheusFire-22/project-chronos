import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { RenderBlocks } from './RenderBlocks';

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

// Generate static params for all pages at build time
// TODO: Re-enable after initial deployment and migrations run
// export async function generateStaticParams() {
//   const payload = await getPayload({ config });

//   const pages = await payload.find({
//     collection: 'pages',
//     limit: 100,
//     depth: 0,
//   });

//   return pages.docs.map((page) => ({
//     slug: page.slug === 'home' ? [] : page.slug.split('/'),
//   }));
// }

// Generate metadata for SEO
// TODO: Re-enable after initial deployment and migrations run
// export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
//   const resolvedParams = await params;
//   const slug = resolvedParams.slug?.join('/') || 'home';

//   const payload = await getPayload({ config });

//   const result = await payload.find({
//     collection: 'pages',
//     where: {
//       or: [
//         { slug: { equals: slug } },
//         { isHome: { equals: slug === 'home' } },
//       ],
//     },
//     limit: 1,
//     depth: 0,
//   });

//   const page = result.docs[0];

//   if (!page) {
//     return {
//       title: 'Page Not Found',
//     };
//   }

//   return {
//     title: page.title,
//     description: page.description || undefined,
//   };
// }

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join('/') || 'home';

  const payload = await getPayload({ config });

  // Fetch page by slug
  // TODO: Add isHome query back after migrations run
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
    depth: 2, // Fetch related media and relationships
  });

  const page = result.docs[0];

  if (!page) {
    notFound();
  }

  return (
    <div className="page">
      <RenderBlocks blocks={page.layout || []} />
    </div>
  );
}
