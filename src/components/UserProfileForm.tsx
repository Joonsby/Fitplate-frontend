import { Button } from "@toss/tds-mobile";
import type { Gender, UserProfile } from "../types/fitplate";

interface UserProfileFormProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  onNext: () => void;
}

// 신체정보 입력 폼 컴포넌트입니다.
// 입력값은 이 컴포넌트 안에 저장하지 않고, 부모(App)의 state를 props로 받아서 사용합니다.
export function UserProfileForm({
  profile,
  onChange,
  onNext,
}: UserProfileFormProps) {
  const isProfileValid =
    profile.heightCm > 0 && profile.weightKg > 0 && profile.age > 0;

  const updateNumber = (
    field: keyof Omit<UserProfile, "gender">,
    value: string,
  ) => {
    const nextValue = value === "" ? 0 : Number(value);

    onChange({
      ...profile,
      [field]: Number.isFinite(nextValue) ? nextValue : 0,
    });
  };

  const updateGender = (gender: Gender) => {
    onChange({
      ...profile,
      gender,
    });
  };

  return (
    <section className="screen">
      <div className="sectionHeader">
        <p className="stepText">1단계</p>
        <h2>신체정보 입력</h2>
        <p>키, 몸무게, 나이, 성별을 입력하면 결과 화면에서 목표를 계산합니다.</p>
      </div>

      <div className="fieldGroup">
        <NumberField
          label="키"
          unit="cm"
          value={profile.heightCm}
          onChange={(value) => updateNumber("heightCm", value)}
        />
        <NumberField
          label="몸무게"
          unit="kg"
          value={profile.weightKg}
          onChange={(value) => updateNumber("weightKg", value)}
        />
        <NumberField
          label="나이"
          unit="세"
          value={profile.age}
          onChange={(value) => updateNumber("age", value)}
        />
        <NumberField
          label="체지방률"
          unit="%"
          value={profile.bodyFatPercentage ?? 0}
          optionalText="선택"
          onChange={(value) =>
            onChange({
              ...profile,
              bodyFatPercentage: value === "" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div className="choiceGroup" aria-label="성별 선택">
        <button
          className={
            profile.gender === "male" ? "choiceButton selected" : "choiceButton"
          }
          type="button"
          onClick={() => updateGender("male")}
        >
          남성
        </button>
        <button
          className={
            profile.gender === "female"
              ? "choiceButton selected"
              : "choiceButton"
          }
          type="button"
          onClick={() => updateGender("female")}
        >
          여성
        </button>
      </div>

      {!isProfileValid ? (
        <p className="formError">키, 몸무게, 나이는 0보다 큰 값으로 입력해주세요.</p>
      ) : null}

      <Button
        color="dark"
        disabled={!isProfileValid}
        size="large"
        onClick={onNext}
      >
        목표 선택하기
      </Button>
    </section>
  );
}

interface NumberFieldProps {
  label: string;
  unit: string;
  value: number;
  optionalText?: string;
  onChange: (value: string) => void;
}

// 숫자를 입력하는 작은 재사용 컴포넌트입니다.
// label은 입력 이름, unit은 cm/kg 같은 단위입니다.
function NumberField({
  label,
  unit,
  value,
  optionalText,
  onChange,
}: NumberFieldProps) {
  return (
    <label className="numberField">
      <span>
        {label}
        {optionalText ? <em>{optionalText}</em> : null}
      </span>
      <div>
        <input
          inputMode="decimal"
          min="0"
          type="number"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
        />
        <strong>{unit}</strong>
      </div>
    </label>
  );
}
