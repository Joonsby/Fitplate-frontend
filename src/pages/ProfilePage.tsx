// 내 정보 탭 — 신체 정보와 음식 취향을 서버에 저장합니다.
import { UserProfileForm } from "../components/forms/UserProfileForm";
import { updateMyProfile } from "../api/authApi";
import type { UserProfile } from "../types/fitplate";

interface ProfilePageProps {
  profile: UserProfile;
  onProfileSaved: (profile: UserProfile) => void;
  onError: (message: string) => void;
}

export function ProfilePage({ profile, onProfileSaved, onError }: ProfilePageProps) {
  const handleSave = async (nextProfile: UserProfile) => {
    try {
      onProfileSaved(await updateMyProfile(nextProfile));
    } catch (error) {
      onError(error instanceof Error ? error.message : "내 정보를 저장하지 못했어요.");
      throw error;
    }
  };

  return (
    <UserProfileForm
      mode="edit"
      profile={profile}
      onProfileSave={handleSave}
      onNext={() => {}}
    />
  );
}
