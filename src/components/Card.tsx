const Card = () => {
  return (
    <div className="w-full md:w-1/3 bg-white border border-gray-400 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <a href="#">
        <img className="rounded-t-xl" src="public/images/sample1.jpeg" />
        <div className="p-5">
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            제목
          </h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            내용
          </p>
        </div>
      </a>
    </div>
  );
};
export default Card;
