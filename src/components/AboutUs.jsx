
const AboutUs = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">About Us</h1>
      <p className="text-lg text-gray-700 mb-4">
        Welcome to <span className="font-semibold">StayEase</span>, your ultimate hostel management solution. Our platform is designed to simplify and streamline hostel operations, making life easier for both students and administrators.
      </p>
      <h2 className="text-2xl font-semibold mt-6">Our Mission</h2>
      <p className="text-lg text-gray-700 mb-4">
        Our mission is to provide a seamless and efficient hostel management system that enhances the living experience for students and ensures hassle-free administration for hostel managers.
      </p>
      <h2 className="text-2xl font-semibold mt-6">Why Choose Us?</h2>
      <ul className="list-disc list-inside text-lg text-gray-700 mb-4">
        <li>Efficient room allocation and management</li>
        <li>Automated payment and fee tracking</li>
        <li>Secure and transparent communication</li>
        <li>User-friendly interface for easy navigation</li>
        <li>24/7 support for hostel administrators and students</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-6">Our Vision</h2>
      <p className="text-lg text-gray-700 mb-4">
        We envision a future where hostel management is completely digital, reducing paperwork and enhancing efficiency. With StayEase, managing hostels has never been easier!
      </p>
    </div>
  );
};

export default AboutUs;
