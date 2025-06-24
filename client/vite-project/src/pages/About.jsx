function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-6 py-10 text-gray-800">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-6 text-blue-700">About CleanTogether</h2>
        
        <p className="text-lg md:text-xl leading-relaxed text-gray-700 bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-md">
          <span className="block mb-2">
            <strong>CleanTogether</strong> is an environmental initiative focused on reducing marine pollution in Mumbai.
          </span>
          We organize beach cleanups, engage volunteers, and promote sustainable actions through community-driven programs and education.
        </p>

        <video
            src="src/assets/vdo.mp4"
            controls
         className="mt-10 rounded-xl shadow-lg mx-auto w-full max-w-2xl"
        />
      </div>
    </div>
  );
}

export default About;
