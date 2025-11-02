// import React from 'react';
// import { Link } from 'react-router-dom';

// const Footer = () => {
//   return (
//     <footer className="bg-gray-900 text-white mt-10 p-6 text-center">
//       <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 md:gap-0 text-sm">
//         <p className="text-center md:text-left">
//           &copy; {new Date().getFullYear()} JobBoard Inc. All rights reserved.
//         </p>
//         <div className="flex flex-wrap justify-center md:justify-end gap-4">
//           <Link to="/about" className="hover:text-gray-400">About</Link>
//           <Link to="/contact" className="hover:text-gray-400">Contact</Link>
//           <Link to="/faq" className="hover:text-gray-400">FAQ</Link>
//           <Link to="/terms" className="hover:text-gray-400">Terms</Link>
//           <Link to="/privacy" className="hover:text-gray-400">Privacy</Link>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedinIn, FaGithub } from 'react-icons/fa';
import { HiBriefcase } from 'react-icons/hi2'; // For Naukri (generic briefcase icon)

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 px-4 md:px-10">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
        <p className="text-center text-sm md:text-left">
          &copy; {new Date().getFullYear()} JobBoard Inc. All rights reserved.
        </p>

        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/about" className="hover:text-gray-400 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
          <Link to="/faq" className="hover:text-gray-400 transition-colors">FAQ</Link>
          <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
        </nav>

        <div className="flex gap-4">
          <a
            href="https://www.linkedin.com/in/sundar-lingam-8407a5221/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-gray-400 text-xl"
          >
            <FaLinkedinIn />
          </a>
          <a
            href="https://drive.google.com/file/d/1jg21IsdVDaFc35FNfJ3vfdz0rgRbLXiS/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Naukri"
            className="hover:text-gray-400 text-xl"
          >
            <HiBriefcase />
          </a>
          <a
            href="https://github.com/Sudharsen27"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-gray-400 text-xl"
          >
            <FaGithub />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
