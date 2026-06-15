import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="bg-gray-900 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Murakami<span className="text-orange-500">.</span>
            </span>
            <p className="text-sm leading-6 text-gray-400 max-w-xs">
              Experience the authentic taste of Japan. Fresh ingredients, traditional recipes,
              modern convenience.
            </p>

            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="sr-only">Facebook</span>
                <i className="fa-brands fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="sr-only">Instagram</span>
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="sr-only">Twitter</span>
                <i className="fa-brands fa-twitter text-xl"></i>
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Menu</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/menu"
                      className="text-sm leading-6 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Sushi Sets
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/menu"
                      className="text-sm leading-6 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Poke Bowls
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/menu"
                      className="text-sm leading-6 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Rolls
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/menu"
                      className="text-sm leading-6 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Drinks & Desserts
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/about"
                      className="text-sm leading-6 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/location"
                      className="text-sm leading-6 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Locations
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm leading-6 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Stay Updated</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Subscribe for exclusive offers and new menu items.
                </p>
                <form className="mt-6 sm:flex sm:max-w-md" onSubmit={handleSubscribe}>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    required
                    className="w-full min-w-0 appearance-none rounded-md border-0 bg-white/5 px-3 py-1.5 text-base text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:w-64 sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                  />
                  <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Murakami Clone. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
