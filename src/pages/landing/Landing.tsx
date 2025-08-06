import React from "react";

// Main App component for the landing page
const App: React.FC = () => {
  // Function to handle sign-in button click
  const handleSignInClick = () => {
    // In a real application, you would navigate to the sign-in page here.
    // For this example, we'll just log a message.
    console.log("Navigating to sign-in page...");
    // Example: window.location.href = '/signin';
    // Or if using a router: navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#555555]">
      {/* Hero Section */}
      <header className="relative flex items-center justify-center h-screen overflow-hidden">
        {/* Background image/overlay (optional, can be replaced with a solid color or pattern) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{
            backgroundImage:
              "url('https://placehold.co/1920x1080/E0F2F7/000000?text=Caring+Hands')",
          }}
        ></div>
        <div className="absolute inset-0 bg-[#1e293b] opacity-70"></div>{" "}
        {/* Darker overlay */}
        <div className="relative z-10 text-center p-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#fafafa] leading-tight mb-6 animate-fade-in-down">
            Compassionate Care, Right at Your Fingertips.
          </h1>
          <p className="text-xl md:text-2xl text-[#ffbcb5] mb-10 animate-fade-in-up">
            {" "}
            {/* Using light coral for accent text */}
            Connecting families with trusted and dedicated caregivers for every
            need.
          </p>
          <button
            onClick={handleSignInClick}
            className="px-10 py-4 bg-[#5fe8d8] text-[#1e293b] font-bold rounded-full text-lg shadow-xl hover:bg-[#0c9891] hover:text-[#fafafa] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#5fe8d8] focus:ring-opacity-50 animate-bounce-in"
          >
            Get Started - Sign In
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-[#eaeaea]">
        {" "}
        {/* Light gray background for this section */}
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#1e293b] mb-12">
            Why Choose CareConnect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 bg-[#fafafa] rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
              <div className="text-5xl text-[#0c9891] mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.354a4 4 0 110 5.292M12 20.005v-2.326a4 4 0 00-3.374-3.948 4 4 0 01-1.315-3.834c.057-.314.07-.63.07-.948 0-1.782-1.043-3.342-2.5-4.032m12 7.362v-2.326a4 4 0 013.374-3.948 4 4 0 001.315-3.834c-.057-.314-.07-.63-.07-.948 0-1.782 1.043-3.342 2.5-4.032M12 18.005v-2.326a4 4 0 00-3.374-3.948 4 4 0 01-1.315-3.834c.057-.314.07-.63.07-.948 0-1.782-1.043-3.342-2.5-4.032m12 7.362v-2.326a4 4 0 013.374-3.948 4 4 0 001.315-3.834c-.057-.314-.07-.63-.07-.948 0-1.782 1.043-3.342 2.5-4.032M12 18.005v-2.326a4 4 0 00-3.374-3.948 4 4 0 01-1.315-3.834c.057-.314.07-.63.07-.948 0-1.782-1.043-3.342-2.5-4.032m12 7.362v-2.326a4 4 0 013.374-3.948 4 4 0 001.315-3.834c-.057-.314-.07-.63-.07-.948 0-1.782 1.043-3.342 2.5-4.032"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e293b] mb-4">
                Verified Professionals
              </h3>
              <p className="text-[#555555]">
                All caregivers undergo rigorous background checks and interviews
                to ensure your peace of mind.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-8 bg-[#fafafa] rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
              <div className="text-5xl text-[#0c9891] mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e293b] mb-4">
                Flexible Scheduling
              </h3>
              <p className="text-[#555555]">
                Book care by the hour, day, or week. We adapt to your family's
                unique schedule and needs.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-8 bg-[#fafafa] rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
              <div className="text-5xl text-[#0c9891] mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M17 20v-2c0-.185-.015-.368-.043-.548C16.903 16.732 15.922 16 14.75 16H9.25c-1.172 0-2.153.732-2.207 1.852-.028.18-.043.363-.043.548V20M9 4.75a2.25 2.25 0 100 4.5 2.25 2.0 0 000-4.5zM15 4.75a2.25 2.25 0 100 4.5 2.25 2.0 0 000-4.5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#1e293b] mb-4">
                Personalized Matching
              </h3>
              <p className="text-[#555555]">
                Our smart matching system connects you with caregivers who best
                fit your family's specific requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-[#0c9891] text-[#fafafa] text-center">
        {" "}
        {/* Primary accent color */}
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Find the Perfect Care?
          </h2>
          <p className="text-xl mb-8">
            Join our community and experience peace of mind.
          </p>
          <button
            onClick={handleSignInClick}
            className="px-10 py-4 bg-[#5fe8d8] text-[#1e293b] font-bold rounded-full text-lg shadow-xl hover:bg-[#ffbcb5] hover:text-[#1e293b] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#5fe8d8] focus:ring-opacity-50"
          >
            Sign In Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#1e293b] text-[#fafafa] text-center">
        {" "}
        {/* Dark blue/gray */}
        <div className="container mx-auto px-4">
          <p>&copy; 2025 CareConnect. All rights reserved.</p>
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

      {/* Tailwind CSS CDN for quick setup */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Custom styles for animations */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          .animate-fade-in-down {
            animation: fadeInDown 1s ease-out forwards;
          }
          .animate-fade-in-up {
            animation: fadeInUp 1s ease-out forwards;
            animation-delay: 0.3s;
          }
          .animate-bounce-in {
            animation: bounceIn 1s ease-out forwards;
            animation-delay: 0.6s;
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;
