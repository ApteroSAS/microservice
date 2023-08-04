export function readQueryVariable(name, defaultValue) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  return value !== null ? value : defaultValue;
}


export function getRegionFromLocale() {
  const locale = navigator.language;
  let region = 'NA'; // default region

  if (locale) {
    const localeRegion = locale.split('_')[1];

    if (localeRegion) {
      switch (localeRegion) {
        case 'US':
        case 'CA':
        case 'MX':
          region = 'NA';
          break;
        case 'GB':
        case 'FR':
        case 'DE':
          region = 'EU';
          break;
        case 'CN':
        case 'JP':
        case 'KR':
          region = 'AS';
          break;
      }
    }
  }

  return region;
}
