const Card = ({ posts }) => {
  return (
    <a
      href="#"
      className="flex flex-col items-center w-full bg-white border border-gray-200 rounded-lg shadow-sm h-150 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 md:w-150 md:h-150"
    >
      <img className="w-125 h-70" src="public/images/sample1.jpeg" alt="" />
      <div className="flex flex-col justify-between p-4 leading-normal">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Noteworthy technology acquisitions 2021
        </h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          Here are the biggest enterprise technology acquisitions of 2021 so
          far, in reverse chronological order.
        </p>
      </div>
    </a>
  );
};
export default Card;
