const Pricing = () => {
  return (
    <section className="py-12 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Find the best plan that suits your needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* Basic Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Basic
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              For individuals
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
              $9<span className="text-lg">/mo</span>
            </p>

            <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
              <li>✅ 10GB Storage</li>
              <li>✅ Basic Support</li>
              <li>✅ Single User</li>
            </ul>

            <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
              Get Started
            </button>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="bg-blue-500 text-white rounded-lg shadow-lg p-6 border border-blue-700 transform scale-105">
            <h3 className="text-xl font-semibold">Pro</h3>
            <p className="mt-1">For small teams</p>
            <p className="text-3xl font-bold mt-4">
              $29<span className="text-lg">/mo</span>
            </p>

            <ul className="mt-4 space-y-2">
              <li>✅ 100GB Storage</li>
              <li>✅ Priority Support</li>
              <li>✅ Up to 5 Users</li>
            </ul>

            <button className="mt-6 w-full bg-white text-blue-600 hover:bg-gray-200 py-2 px-4 rounded-lg transition">
              Get Started
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Enterprise
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              For businesses
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
              $99<span className="text-lg">/mo</span>
            </p>

            <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
              <li>✅ 1TB Storage</li>
              <li>✅ 24/7 Support</li>
              <li>✅ Unlimited Users</li>
            </ul>

            <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
