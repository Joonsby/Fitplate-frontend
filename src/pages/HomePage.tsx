import { useNavigate } from "react-router-dom";
import { UserProfileForm } from "../components/UserProfileForm";
import type { UserProfile } from "../types/fitplate";

interface HomePageProps {
  profile: UserProfile;
}

export function HomePage({ profile }: HomePageProps) {
  const navigate = useNavigate();

  return (
    <UserProfileForm
      profile={profile}
      onNext={() => navigate("/goal")}
    />
  );
}