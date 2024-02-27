import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import React from "react";

function FooterComp() {
  return (
    <Footer className="border border-t-8 border-teal-600">
      <div>
        <div>
          <div className="mt-4">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white"
            >
              <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white px-2 py-1 rounded-lg">
                {`Tausif's`}
              </span>
              Blog
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <Footer.Title title="About" />
            <Footer.LinkGroup>
              <Footer.Link href="#">Mern Project</Footer.Link>
            </Footer.LinkGroup>
          </div>
        </div>
      </div>
    </Footer>
  );
}

export default FooterComp;
