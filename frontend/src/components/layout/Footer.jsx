import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="footer-section">
            <h5 className="text-xl font-semibold mb-4">About GasBooking</h5>
            <p className="text-blue-200 text-base">
              GasBooking is your trusted platform for booking gas cylinders with ease
              and reliability.
            </p>
          </div>

          {/* Links Section */}
          <div className="footer-section">
            <h5 className="text-xl font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-blue-200 text-base hover:text-blue-100 hover:underline transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-blue-200 text-base hover:text-blue-100 hover:underline transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-blue-200 text-base hover:text-blue-100 hover:underline transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-blue-200 text-base hover:text-blue-100 hover:underline transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div className="footer-section">
            <h5 className="text-xl font-semibold mb-4">Follow Us</h5>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                className="text-blue-200 hover:text-blue-100 hover:scale-110 transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter size={22} />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="text-blue-200 hover:text-blue-100 hover:scale-110 transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook size={22} />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="text-blue-200 hover:text-blue-100 hover:scale-110 transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram size={22} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-blue-600 pt-4 text-center">
          <p className="text-blue-200 text-base">
            © {new Date().getFullYear()} GasBooking. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;