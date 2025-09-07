// i18n.ts  (PROJECT ROOT)
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uz', 'en', 'ru'],
  defaultLocale: 'uz',
  // localePrefix: 'always' // kerak bo‘lsa qo‘shasiz
});

export type Locale = (typeof routing.locales)[number];

export default routing;