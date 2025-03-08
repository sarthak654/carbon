import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <header className="w-full text-center py-10">
        <h1 className="text-5xl font-bold text-gray-900">Welcome to Carbon Credit</h1>
        <p className="mt-4 text-lg text-gray-600">Join us in our journey towards a sustainable future.</p>
      </header>

      <section className="w-full text-center py-10 px-4">
        <p className="text-xl text-gray-800 mb-6">Track and manage your carbon credits with ease. Start now by submitting your information!</p>
        <Link
          to="/submit" // Link to the form/submit page
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-semibold hover:bg-blue-700"
        >
          Get Started
        </Link>
      </section>

      <footer className="w-full bg-gray-800 text-white py-4 text-center mt-12">
        <p>Powered by Carbon Credit Initiative</p>
      </footer>
    </div>
  );
};

export default LandingPage;
