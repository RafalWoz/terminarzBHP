export const siteUrl = "https://terminybhp.pl";

const fileExtensionPattern = /\.[A-Za-z0-9]{2,8}$/;

export function hasFileExtension(pathname: string) {
  return fileExtensionPattern.test(pathname);
}

export function canonicalPath(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalizedPath === "/" || normalizedPath.endsWith("/") || hasFileExtension(normalizedPath)) {
    return normalizedPath;
  }

  return `${normalizedPath}/`;
}

export function canonicalUrl(pathname = "/") {
  return `${siteUrl}${canonicalPath(pathname)}`;
}

export function canonicalInternalHref(href: string) {
  if (href.startsWith("#")) return href;

  const hashIndex = href.indexOf("#");
  const hrefWithoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const queryIndex = hrefWithoutHash.indexOf("?");
  const pathname = queryIndex >= 0 ? hrefWithoutHash.slice(0, queryIndex) : hrefWithoutHash;
  const query = queryIndex >= 0 ? hrefWithoutHash.slice(queryIndex) : "";

  return `${canonicalPath(pathname)}${query}${hash}`;
}
