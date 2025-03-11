const LatestNews = () => {
  return (
    <div className="bg-teal-700 text-white py-2 px-4 flex">
      <span className="bg-gray-800 px-3 py-1 text-sm">Latest News</span>
      <marquee className="ml-4 text-sm">
        Funding Application deadline extended till March 2025. Read more...
      </marquee>
    </div>
  );
};

export default LatestNews;
