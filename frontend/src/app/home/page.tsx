//import HomePage from "../../components/Homepage";
import GmailDashboard from "../../components/gmail-dashboard-clone";
import GmailListDashboard from "../../components/gmaillistdashboard";
const Home = () => {
  return (
    <><div className="grid grid-cols-1">
      <GmailDashboard />
      <GmailListDashboard />
      </div>
    </>
  );
};

export default Home;
