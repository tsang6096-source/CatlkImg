import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function SEO() {
  const { t, i18n } = useTranslation();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('app.name'),
    description: t('seo.description'),
    url: 'https://yourwebsite.com',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Image Compression',
      'Format Conversion',
      'Batch Processing',
      'Local Processing',
      'Privacy Protection',
    ],
    inLanguage: [i18n.language],
  };

  return (
    <Helmet>
      <html lang={i18n.language} />
      <title>{t('seo.title')}</title>
      <meta name="description" content={t('seo.description')} />
      <meta name="keywords" content={t('seo.keywords')} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={t('seo.title')} />
      <meta property="og:description" content={t('seo.description')} />
      <meta property="og:url" content="https://yourwebsite.com" />
      <meta property="og:locale" content={i18n.language === 'zh' ? 'zh_CN' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t('seo.title')} />
      <meta name="twitter:description" content={t('seo.description')} />
      
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      
      {/* Alternate Languages */}
      <link rel="alternate" hrefLang="en" href="https://yourwebsite.com/?lang=en" />
      <link rel="alternate" hrefLang="zh" href="https://yourwebsite.com/?lang=zh" />
      <link rel="alternate" hrefLang="x-default" href="https://yourwebsite.com/" />
    </Helmet>
  );
}
