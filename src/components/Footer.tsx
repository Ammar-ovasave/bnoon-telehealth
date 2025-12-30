"use client";

import { FC } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

const Footer: FC = () => {
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bnoon-navy dark:bg-gray-950 text-white border-t border-bnoon-navy dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Image
              src="/images/bnoon-logo.svg"
              alt="Bnoon - بنون"
              width={120}
              height={50}
              className="h-10 w-auto brightness-0 invert dark:brightness-100 dark:invert-0"
            />
            <p className="text-sm text-white/80 dark:text-gray-400 leading-relaxed">
              {locale === "ar"
                ? "مركز الإخصاب وصحة المرأة. جزء من شبكة جلوبال فيرتيليتي."
                : "The Fertility & Women's Health Center. Part of Global Fertility Network."}
            </p>
            <p className="text-xs text-bnoon-teal font-medium">
              {locale === "ar"
                ? "أكبر شبكة مستقلة لخدمات الإخصاب في المملكة العربية السعودية"
                : "The largest stand-alone fertility services network in KSA"}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white dark:text-gray-100">
              {locale === "ar" ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-2 text-sm text-white/70 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-bnoon-teal transition-colors">
                  {locale === "ar" ? "الرئيسية" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/manage-appointments" className="hover:text-bnoon-teal transition-colors">
                  {locale === "ar" ? "مواعيدي" : "My Appointments"}
                </Link>
              </li>
              <li>
                <a href="https://bnoon.sa" target="_blank" rel="noopener noreferrer" className="hover:text-bnoon-teal transition-colors">
                  {locale === "ar" ? "زيارة الموقع الرئيسي" : "Visit Main Website"}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white dark:text-gray-100">
              {locale === "ar" ? "تواصل معنا" : "Contact Us"}
            </h3>
            <ul className="space-y-2 text-sm text-white/70 dark:text-gray-400">
              <li>
                <a href="tel:+966114448080" className="hover:text-bnoon-teal transition-colors" dir="ltr">
                  +966 11 444 8080
                </a>
              </li>
              <li>
                <a href="mailto:info@bnoon.sa" className="hover:text-bnoon-teal transition-colors">
                  info@bnoon.sa
                </a>
              </li>
              <li className="text-white/50 dark:text-gray-500">
                {locale === "ar" ? "الرياض - جدة - المملكة العربية السعودية" : "Riyadh - Jeddah - Saudi Arabia"}
              </li>
            </ul>
            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/bnoon.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-bnoon-teal dark:hover:bg-bnoon-teal transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/bnoon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-bnoon-teal dark:hover:bg-bnoon-teal transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50 dark:text-gray-500">
            © {currentYear} Bnoon. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <p className="text-xs text-white/50 dark:text-gray-500">
            {locale === "ar"
              ? "جزء من شبكة جلوبال فيرتيليتي (GFN)"
              : "Part of Global Fertility Network (GFN)"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

