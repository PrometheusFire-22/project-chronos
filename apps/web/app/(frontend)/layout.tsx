import React from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getPayload({ config });

  // Fetch global data for header and footer
  // Handle case where globals don't exist yet (before migrations run)
  let header = null;
  let footer = null;

  try {
    header = await payload.findGlobal({
      slug: 'header',
      depth: 1,
    });
  } catch (error) {
    console.warn('Header global not found - migrations may not have run yet');
  }

  try {
    footer = await payload.findGlobal({
      slug: 'footer',
      depth: 1,
    });
  } catch (error) {
    console.warn('Footer global not found - migrations may not have run yet');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">Project Chronos</div>

            {header?.navItems && (
              <ul className="flex gap-6">
                {header.navItems.map((item: any, index: number) => {
                  const href = item.externalLink || `/page/${item.link?.slug}` || '#';
                  return (
                    <li key={index}>
                      <a
                        href={href}
                        className="text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}

            {header?.ctaButton?.show && (
              <a
                href={header.ctaButton.link || '#'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {header.ctaButton.label}
              </a>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {footer?.columns?.map((column: any, index: number) => (
              <div key={index}>
                <h3 className="font-bold text-lg mb-4">{column.heading}</h3>
                <ul className="space-y-2">
                  {column.links?.map((link: any, linkIndex: number) => {
                    const href = link.externalLink || `/page/${link.link?.slug}` || '#';
                    return (
                      <li key={linkIndex}>
                        <a
                          href={href}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {footer?.socialLinks && footer.socialLinks.length > 0 && (
            <div className="flex gap-4 mb-8">
              {footer.socialLinks.map((social: any, index: number) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          )}

          <div className="border-t border-gray-800 pt-8 flex flex-wrap justify-between items-center">
            <p className="text-gray-400 text-sm">{footer?.copyright}</p>

            {footer?.legalLinks && footer.legalLinks.length > 0 && (
              <div className="flex gap-6">
                {footer.legalLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={`/page/${link.link?.slug}` || '#'}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
