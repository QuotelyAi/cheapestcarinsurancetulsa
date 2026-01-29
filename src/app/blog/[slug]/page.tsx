import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPostBySlug, getAllPostSlugs, getMedia, getCategories, getRelatedPosts } from '@/lib/wordpress';
import RelatedPosts from '@/components/RelatedPosts';
import WPContent from '@/components/WPContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const plainTitle = post.title.replace(/<[^>]*>/g, '');
  const plainExcerpt = post.excerpt.replace(/<[^>]*>/g, '').trim();

  return {
    title: plainTitle,
    description: plainExcerpt || `Read ${plainTitle} on Cheapest Car Insurance Tulsa`,
    alternates: {
      canonical: `https://cheapestcarinsurancetulsa.com/blog/${slug}`,
    },
    openGraph: {
      title: plainTitle,
      description: plainExcerpt,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      url: `https://cheapestcarinsurancetulsa.com/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [featuredMedia, categories, relatedPosts] = await Promise.all([
    post.featured_media ? getMedia(post.featured_media) : null,
    getCategories(),
    getRelatedPosts(post, 3),
  ]);

  const postCategories = categories.filter((cat) => post.categories.includes(cat.id));

  return (
    <article className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 truncate max-w-xs" dangerouslySetInnerHTML={{ __html: post.title }} />
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {postCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {postCategories.map((category) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
          <div className="flex items-center text-gray-500 space-x-4">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        {/* Featured Image */}
        {featuredMedia && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
            <Image
              src={featuredMedia.source_url}
              alt={featuredMedia.alt_text || post.title.replace(/<[^>]*>/g, '')}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <WPContent
          html={post.content}
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-lg"
        />

        {/* Related Posts */}
        <RelatedPosts posts={relatedPosts} />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              &larr; Back to Blog
            </Link>
            <Link
              href="/quote"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Your Free Quote
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
