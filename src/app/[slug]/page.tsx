import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPageBySlug, getAllPageSlugs, getMedia } from '@/lib/wordpress';
import WPContent from '@/components/WPContent';

interface Props {
  params: Promise<{ slug: string }>;
}

// Reserved routes that shouldn't be handled by this catch-all
const RESERVED_ROUTES = ['blog', 'quote', 'api'];

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs
    .filter((slug) => !RESERVED_ROUTES.includes(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (RESERVED_ROUTES.includes(slug)) {
    return {};
  }

  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  const plainTitle = page.title.replace(/<[^>]*>/g, '');
  const plainExcerpt = page.excerpt.replace(/<[^>]*>/g, '').trim();

  return {
    title: plainTitle,
    description: plainExcerpt || `${plainTitle} - Cheapest Car Insurance Tulsa`,
    alternates: {
      canonical: `https://cheapestcarinsurancetulsa.com/${slug}`,
    },
    openGraph: {
      title: plainTitle,
      description: plainExcerpt,
      type: 'website',
      url: `https://cheapestcarinsurancetulsa.com/${slug}`,
    },
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;

  if (RESERVED_ROUTES.includes(slug)) {
    notFound();
  }

  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const featuredMedia = page.featured_media ? await getMedia(page.featured_media) : null;

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">Home</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 truncate max-w-xs" dangerouslySetInnerHTML={{ __html: page.title }} />
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: page.title }}
          />
        </header>

        {/* Featured Image */}
        {featuredMedia && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
            <Image
              src={featuredMedia.source_url}
              alt={featuredMedia.alt_text || page.title.replace(/<[^>]*>/g, '')}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <WPContent
          html={page.content}
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-lg"
        />

        {/* CTA Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Get a free quote and see how much you can save on your car insurance today.
          </p>
          <Link
            href="/quote"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Your Free Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
