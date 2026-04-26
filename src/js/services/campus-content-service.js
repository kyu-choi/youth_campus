window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.services = window.CheongchunCampus.services || {};

function mergeSupabaseContent(contentRow, linkRows) {
  const { staticLandingContent } = window.CheongchunCampus.config;

  return {
    hero: {
      title: contentRow.hero_title ?? staticLandingContent.hero.title,
      subtitle: contentRow.hero_subtitle ?? staticLandingContent.hero.subtitle,
    },
    instagram: {
      label: contentRow.instagram_label ?? staticLandingContent.instagram.label,
      badge: contentRow.instagram_badge ?? staticLandingContent.instagram.badge,
      url: contentRow.instagram_url ?? staticLandingContent.instagram.url,
    },
    quickLinks:
      Array.isArray(linkRows) && linkRows.length > 0
        ? linkRows.map((linkRow) => ({
            id: linkRow.id ?? linkRow.label,
            label: linkRow.label,
            url: linkRow.url,
            featured: Boolean(
              linkRow.featured ?? linkRow.id === "application"
            ),
          }))
        : staticLandingContent.quickLinks,
    contact: {
      prefix: contentRow.contact_prefix ?? staticLandingContent.contact.prefix,
      linkLabel:
        contentRow.contact_link_label ??
        staticLandingContent.contact.linkLabel,
      url: contentRow.contact_url ?? staticLandingContent.contact.url,
      suffix: contentRow.contact_suffix ?? staticLandingContent.contact.suffix,
    },
  };
}

window.CheongchunCampus.services.getLandingContent =
  async function getLandingContent() {
    const { staticLandingContent, supabaseConfig } =
      window.CheongchunCampus.config;
    const client = window.CheongchunCampus.services.getSupabaseClient();

    if (!client) {
      return staticLandingContent;
    }

    try {
      const [contentResponse, linksResponse] = await Promise.all([
        client
          .from(supabaseConfig.landingContentTable)
          .select("*")
          .eq("is_active", true)
          .limit(1)
          .maybeSingle(),
        client
          .from(supabaseConfig.landingLinksTable)
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (contentResponse.error) {
        throw contentResponse.error;
      }

      if (linksResponse.error) {
        throw linksResponse.error;
      }

      if (!contentResponse.data) {
        return staticLandingContent;
      }

      return mergeSupabaseContent(contentResponse.data, linksResponse.data);
    } catch (error) {
      console.warn(
        "Supabase content load failed. Falling back to static data.",
        error
      );
      return staticLandingContent;
    }
  };
