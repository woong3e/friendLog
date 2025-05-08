const Footer = () => {
  return (
    <footer className="flex flex-col justify-end m-1 h-14 mx-1 md:h-14 bg-white rounded-lg shadow-sm dark:bg-gray-900">
      <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
        <a href="https://github.com/woong3e/friendLog" className="">
          friendlog
        </a>
        <a href="https://github.com/woong3e" className="ml-1">
          @woong3e
        </a>
      </span>
    </footer>
  );
};

export default Footer;
