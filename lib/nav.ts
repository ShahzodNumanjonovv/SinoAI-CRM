import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['uz', 'en', 'ru'] as const;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales});