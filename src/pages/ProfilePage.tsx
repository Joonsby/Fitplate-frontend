// 내 정보 탭 — 신체 정보를 수정해 다음 식단 생성에 반영합니다.
import { UserProfileForm } from "../components/forms/UserProfileForm";
import type { UserProfile } from "../types/fitplate";

interface ProfilePageProps {
  profile: UserProfile;
  onProfileSave: (profile: UserProfile) => void;
  onSaved: () => void;
}

export function ProfilePage({ profile, onProfileSave, onSaved }: ProfilePageProps) {
  return (
    <UserProfileForm
      mode="edit"
      profile={profile}
      onProfileSave={onProfileSave}
      onNext={onSaved}
    />
  );
}
