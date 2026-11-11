import { Button, Card } from "flowbite-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#ADEBFF] dark:from-[#00171F] dark:to-[#003459]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="lg:w-1/2 space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold text-[#003459] dark:text-[#FFFFFF] leading-tight">
              Secure Your Inbox with Advanced Email Spoofing Detection
            </h1>
            <p className="text-xl text-[#003459]/80 dark:text-[#ADEBFF]">
              Protect yourself from sophisticated email threats using our
              cutting-edge AI-powered detection system
            </p>
            <div className="flex gap-8">
              <Button className="bg-[#003459] hover:bg-[#003459]/90 text-[#FFFFFF] dark:bg-[#ADEBFF] dark:hover:bg-[#ADEBFF]/90 dark:text-[#003459]  text-lg">
                Get Started
              </Button>
              <Button
                outline={true}
                className="border-[#003459] text-[#003459] hover:bg-[#ADEBFF]/20 dark:border-[#ADEBFF] dark:text-[#ADEBFF] dark:hover:bg-[#003459]/20  text-lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ADEBFF] to-[#003459] rounded-2xl blur opacity-25 animate-pulse"></div>
              <div className="relative bg-[#FFFFFF]/50 dark:bg-[#00171F]/50 rounded-2xl p-8 backdrop-blur-sm">
                <img
                  src="/email-security.png"
                  alt="Email Security"
                  className="w-full h-auto rounded-xl "
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-16 text-[#003459] dark:text-[#FFFFFF]">
          Advanced Protection Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-[#ADEBFF] hover:border-[#003459] dark:hover:border-[#ADEBFF] transition-all duration-300 p-8 bg-[#FFFFFF]/50 dark:bg-[#00171F]/50 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-[#003459] dark:text-[#ADEBFF] text-4xl">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#003459] dark:text-[#FFFFFF]">
                  {feature.title}
                </h3>
                <p className="text-[#003459]/80 dark:text-[#ADEBFF]">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="bg-gradient-to-r from-[#ADEBFF]/20 to-[#003459]/20 dark:from-[#00171F]/20 dark:to-[#003459]/20 rounded-3xl p-12 backdrop-blur-sm">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-[#003459] dark:text-[#FFFFFF]">
              Ready to Secure Your Email Communications?
            </h2>
            <p className="text-xl text-[#003459]/80 dark:text-[#ADEBFF]">
              Join thousands of users who trust our platform for their email
              security needs
            </p>
            <Button className="bg-[#003459] hover:bg-[#003459]/90 text-[#FFFFFF] dark:bg-[#ADEBFF] dark:hover:bg-[#ADEBFF]/90 dark:text-[#003459] px-8 py-6 text-lg">
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LandingPage;

const features = [
  {
    icon: "🔍",
    title: "Real-time Detection",
    description:
      "Instant analysis of incoming emails for spoofing attempts using advanced algorithms",
  },
  {
    icon: "🛡️",
    title: "AI-Powered Security",
    description:
      "Machine learning models trained to identify sophisticated phishing attempts",
  },
  {
    icon: "📊",
    title: "Detailed Analytics",
    description:
      "Comprehensive reports and insights about detected threats and patterns",
  },
  {
    icon: "🔐",
    title: "DMARC Integration",
    description:
      "Seamless integration with DMARC, SPF, and DKIM authentication protocols",
  },
  {
    icon: "⚡",
    title: "Quick Response",
    description: "Immediate alerts and automated actions for suspicious emails",
  },
  {
    icon: "🔄",
    title: "Continuous Updates",
    description:
      "Regular updates to protection mechanisms against emerging threats",
  },
];
