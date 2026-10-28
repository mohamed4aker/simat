import { GTM_ID } from '@/lib/analytics';

const snippet = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

/**
 * كود Google Tag Manager — جوه الـ head زي تعليمات جوجل بالظبط.
 * ملف gtm.js نفسه بيتحمّل async فمش بيبطّأ فتح الصفحة.
 */
export function GoogleTagManager() {
  return <script id="gtm" dangerouslySetInnerHTML={{ __html: snippet }} />;
}

/** للمتصفحات اللي الجافاسكريبت فيها مقفولة — لازم أول حاجة جوه body. */
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
