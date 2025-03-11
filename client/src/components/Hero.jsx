const Hero = () => {
  return (
    <div className="relative">
      <img
        src="/banner.jpg" 
        alt="PM Modi"
        className="w-full h-[500px] object-cover"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex justify-center items-center">
        <h2 className="text-white text-3xl font-bold"></h2>
      </div>
    </div>
  );
};

export default Hero;