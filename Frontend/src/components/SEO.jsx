import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description = "WatchVerse - The ultimate destination for premium indie films, music, and blockbuster recommendations.", 
  image = "https://watchverse.com/default-og.jpg", 
  type = "website" 
}) {
  const siteTitle = title ? `${title} | WatchVerse` : "WatchVerse";

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      
      {/* OpenGraph tags for Facebook, LinkedIn, Discord, etc. */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="WatchVerse" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
