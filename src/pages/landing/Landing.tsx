import React from "react";
import AnimatedBackground from "./components/AnimatedBackground";
import { useNavigate } from "react-router-dom";
import { Activity, Calendar, Users } from "lucide-react";
import "./Landing.css";

const App: React.FC = () => {
  const navigate = useNavigate();
  const handleSignInClick = () => {
    navigate("/login");
  };

  const handleSignUpClick = () => {
    navigate("/register");
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <header className="relative flex items-center justify-center h-screen overflow-hidden">
        {/* Background image/overlay (optional, can be replaced with a solid color or pattern) */}
        {/* <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"></div> */}
        <AnimatedBackground />
        {/* Darker overlay */}
        <div className="relative z-10 text-center p-8 max-w-4xl mx-auto">
          <h1 className="landing-header-h1">
            Compassionate Care, Right at Your Fingertips.
          </h1>
          <p className="landing-header-p">
            Connecting families with trusted and dedicated caregivers for every
            need.
          </p>
          <button
            onClick={handleSignInClick}
            className="px-10 py-4 bg-[#5fe8d8] text-[#1e293b] font-bold rounded-full text-lg shadow-xl hover:bg-[#0c9891] hover:text-[#fafafa] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#5fe8d8] focus:ring-opacity-50 animate-bounce-in"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-[#eaeaea]">
        {" "}
        {/* Light gray background for this section */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#1e293b] mb-16">
            Why Nurtura?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mt-10">
            {/* Feature 1 */}
            <div className="p-6 lg:p-8 bg-[#fafafa] rounded-lg shadow-lg transform transition duration-500 hover:scale-105 mx-auto max-w-sm">
              <div className="text-5xl text-[#0c9891] mb-4 flex justify-center">
                <Activity className="h-16 w-16" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1e293b] mb-4 text-center">
                Monitor Care Recipients' Health
              </h3>
              <p className="text-[#555555] text-center">
                All in one page to monitor your care recipients' data. Write
                journals to ease your health tracking journey.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-6 lg:p-8 bg-[#fafafa] rounded-lg shadow-lg transform transition duration-500 hover:scale-105 mx-auto max-w-sm">
              <div className="text-5xl text-[#0c9891] mb-4 flex justify-center">
                <Calendar className="h-16 w-16" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1e293b] mb-4 text-center">
                Manage and Schedule Tasks
              </h3>
              <p className="text-[#555555] text-center">
                Note your to-do lists on our calendar. We can help to remind you
                of your care giving duties.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-6 lg:p-8 bg-[#fafafa] rounded-lg shadow-lg transform transition duration-500 hover:scale-105 mx-auto max-w-sm">
              <div className="text-5xl text-[#0c9891] mb-4 flex justify-center">
                <Users className="h-16 w-16" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1e293b] mb-4 text-center">
                Caregiver Forum
              </h3>
              <p className="text-[#555555] text-center">
                Reach out for help anytime you need. In Nurtura, we connect the
                caregiver community together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="landing-ready">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-[#fafafa]">
            Ready to Find the Perfect Care?
          </h2>
          <p className="text-xl mb-8 text-[#fafafa]">
            Join our community and experience peace of mind.
          </p>
          <button
            onClick={handleSignUpClick}
            className="px-10 py-4 bg-[#fafafa] text-[#059669] font-bold rounded-full text-lg shadow-xl hover:bg-[#ffbcb5] hover:text-[#1e293b] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#5fe8d8] focus:ring-opacity-50"
          >
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#1e293b] text-[#fafafa] landing-footer">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Nurtura. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a
              href="#"
              className="hover:text-[#0c9891] transition duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-[#0c9891] transition duration-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-[#0c9891] transition duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
