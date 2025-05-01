const Footer = () => {
  return (
    <footer className="m-4 bg-white rounded-lg shadow-sm dark:bg-gray-900">
      <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8"></div>
      <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
        © 2025{' '}
        <a href="/" className="hover:underline">
          wondang
        </a>
        . friendlog
      </span>
    </footer>
  );
};

export default Footer;
