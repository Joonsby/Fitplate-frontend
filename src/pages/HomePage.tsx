import { useNavigate } from "react-router-dom";
import { UserProfileForm } from "../components/UserProfileForm";
import type { UserProfile } from "../types/fitplate";

interface HomePageProps {
  profile: UserProfile;
  onProfileSave: (profile: UserProfile) => void;
}

export function HomePage({ profile, onProfileSave }: HomePageProps) {
  const navigate = useNavigate();

  return (
    <UserProfileForm
      profile={profile}
      onProfileSave={onProfileSave}
      onNext={() => navigate("/goal")}
    />
  );
}