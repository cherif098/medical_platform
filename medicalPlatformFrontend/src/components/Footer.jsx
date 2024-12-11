import React from "react";
import { assets } from "../assets/assets";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FooterLink = ({ children, onClick }) => (
  <li
    onClick={onClick}
    className="hover:text-primary cursor-pointer transition-colors duration-200 flex items-center space-x-2 text-gray-600 hover:translate-x-1 transform"
  >
    {children}
  </li>
);

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: "Accueil", path: "/" },
    { label: "Nos Médecins", path: "/doctors" },
    { label: "À Propos", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const legalLinks = [
    { label: "Conditions d'utilisation", path: "/terms" },
    { label: "Politique de confidentialité", path: "/privacy" },
    { label: "Mentions légales", path: "/legal" },
  ];

  return (
    <footer className="bg-gray-50">
      {/* Newsletter Section */}
      <div className="bg-primary/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Restez informé
              </h3>
              <p className="text-gray-600">
                Inscrivez-vous à notre newsletter pour recevoir nos dernières
                actualités
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="px-6 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[300px]"
                />
                <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg transition-colors duration-200 whitespace-nowrap">
                  S'inscrire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info Section */}
          <div className="lg:col-span-1">
            <img
              src={assets.logo}
              alt="Company Logo"
              className="w-40 h-auto mb-6 transition-opacity duration-200 hover:opacity-90"
            />
            <p className="text-gray-600 leading-relaxed mb-6">
              Située au cœur de Montreal, notre clinique médicale est dédiée à
              votre santé et à votre bien-être.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-primary/10 p-2 rounded-full hover:bg-primary/20 transition-colors duration-200"
              >
                <Facebook className="w-5 h-5 text-primary" />
              </a>
              <a
                href="#"
                className="bg-primary/10 p-2 rounded-full hover:bg-primary/20 transition-colors duration-200"
              >
                <Twitter className="w-5 h-5 text-primary" />
              </a>
              <a
                href="#"
                className="bg-primary/10 p-2 rounded-full hover:bg-primary/20 transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5 text-primary" />
              </a>
              <a
                href="#"
                className="bg-primary/10 p-2 rounded-full hover:bg-primary/20 transition-colors duration-200"
              >
                <Instagram className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Liens Rapides
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <FooterLink key={index} onClick={() => navigate(link.path)}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Legal Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Informations Légales
            </h3>
            <ul className="space-y-4">
              {legalLinks.map((link, index) => (
                <FooterLink key={index} onClick={() => navigate(link.path)}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-600">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span>123 Rue Saint-Denis, Montréal, QC</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <span>111-222-3333</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <span>contact@J-KOC.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <span>Lun - Ven: 8h - 18h</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} KOC. Tous droits réservés.
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button
                onClick={() => navigate("/accessibility")}
                className="hover:text-primary transition-colors"
              >
                Accessibilité
              </button>
              <span>•</span>
              <button
                onClick={() => navigate("/sitemap")}
                className="hover:text-primary transition-colors"
              >
                Plan du site
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
