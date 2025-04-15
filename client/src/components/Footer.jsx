const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 text-center mt-auto w-full ">
      <p className="text-sm">© {new Date().getFullYear()} ResearchX grant management. All Rights Reserved.</p>
      <div className="mt-4 flex justify-center space-x-6">
        <a href="#" className="hover:text-white transition duration-300">Facebook</a>
        <a href="#" className="hover:text-white transition duration-300">Twitter</a>
        <a href="#" className="hover:text-white transition duration-300">LinkedIn</a>
      </div>
    </footer>
  );
};

export default Footer;