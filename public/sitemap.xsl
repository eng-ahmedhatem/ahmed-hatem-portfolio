<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" />

  <xsl:template match="/">
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>خريطة موقع أحمد حاتم</title>
        <style>
          *{box-sizing:border-box}body{margin:0;background:#07101c;color:#f1f6fc;font-family:Arial,sans-serif;line-height:1.7}main{inline-size:min(1180px,calc(100% - 32px));margin-inline:auto;padding-block:64px}.eyebrow{display:flex;align-items:center;gap:10px;color:#31b4ff;font-size:14px;font-weight:700;letter-spacing:.04em}.eyebrow:before{content:"";inline-size:30px;block-size:2px;background:#31b4ff}h1{margin:10px 0 8px;font-size:clamp(34px,5vw,68px);line-height:1.1}p{margin:0;color:#a9b7c8}.summary{display:flex;justify-content:space-between;align-items:end;gap:24px;padding-block-end:30px;border-block-end:1px solid #20334a}.count{flex:none;color:#31b4ff;font-size:16px;font-weight:700}.table{margin-block-start:28px;border:1px solid #20334a;border-radius:18px;overflow:hidden;background:#0b1624}table{inline-size:100%;border-collapse:collapse;text-align:start}th{padding:14px 18px;background:#0f1d2d;color:#8da0b6;font-size:13px;text-align:start}td{padding:17px 18px;border-block-start:1px solid #1b2a3d;vertical-align:middle}.url{direction:ltr;text-align:left}.url a{color:#f1f6fc;text-decoration:none;overflow-wrap:anywhere}.url a:hover{color:#31b4ff}.badge{display:inline-flex;min-inline-size:42px;justify-content:center;padding:3px 9px;border:1px solid #285374;border-radius:999px;color:#71caff;font-size:12px;font-weight:700}.kind{color:#b8c5d4}.meta{color:#8191a5;font-size:13px;white-space:nowrap}.note{margin-block-start:18px;font-size:13px;color:#718399}@media(max-width:720px){main{inline-size:min(100% - 20px,1180px);padding-block:36px}.summary{align-items:start;flex-direction:column}.table{border-radius:14px}thead{display:none}tr{display:block;padding:15px 16px;border-block-start:1px solid #1b2a3d}tr:first-child{border-block-start:0}td{display:flex;padding:5px 0;border:0;gap:10px}.url{display:block}.meta{white-space:normal}.hide-mobile{display:none}}
        </style>
      </head>
      <body>
        <main>
          <header class="summary">
            <div>
              <div class="eyebrow">ملف XML معتمد لمحركات البحث</div>
              <h1>خريطة الموقع</h1>
              <p>جميع الصفحات العربية والإنجليزية المنشورة والقابلة للأرشفة.</p>
            </div>
            <div class="count"><xsl:value-of select="count(s:urlset/s:url)" /> رابط</div>
          </header>
          <div class="table">
            <table>
              <thead><tr><th>اللغة</th><th>الرابط</th><th>آخر تحديث</th><th>التكرار</th></tr></thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td><span class="badge"><xsl:choose><xsl:when test="starts-with(substring-after(s:loc, 'eng-ahmedhatem.com'), '/en')">EN</xsl:when><xsl:otherwise>AR</xsl:otherwise></xsl:choose></span></td>
                    <td class="url"><a class="decoded-url" href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
                    <td class="meta hide-mobile"><xsl:choose><xsl:when test="s:lastmod"><xsl:value-of select="substring(s:lastmod,1,10)" /></xsl:when><xsl:otherwise>—</xsl:otherwise></xsl:choose></td>
                    <td class="meta hide-mobile"><xsl:value-of select="s:changefreq" /></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
          <p class="note">هذه الطبقة المرئية للعرض فقط؛ محركات البحث تقرأ بيانات XML الأصلية كاملة.</p>
        </main>
        <script><![CDATA[
          document.querySelectorAll('.decoded-url').forEach(function (link) {
            try { link.textContent = decodeURI(link.textContent); } catch (error) { void error; }
          });
        ]]></script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
