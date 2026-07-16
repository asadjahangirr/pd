import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import BestSellers from "../components/BestSellers.jsx";
import WhyChooseUs from "../components/WhyChooseUs.jsx";
import HealthTip from "../components/HealthTip.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <BestSellers />
        <WhyChooseUs />
        <HealthTip />
      </main>
      <Footer />
    </div>
  );
}
