// 신체 정보를 자체 입력 UI로 수집하고 목표 선택 단계로 전달합니다.
import "./UserProfileForm.css";
import { useId, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Gender, UserProfile } from "../../types/fitplate";
import { Button } from "../common/Button";
import { ArrowRightIcon } from "../common/Icons";
import { StepProgress } from "../common/StepProgress";
import { FoodPreferencePicker } from "./FoodPreferencePicker";
import type { FoodPreferenceSelection } from "./FoodPreferencePicker";

interface UserProfileFormProps {
  profile: UserProfile;
  // Promise 를 돌려주면 끝날 때까지 버튼을 잠그고, 실패하면 onNext 를 부르지 않는다
  onProfileSave: (profile: UserProfile) => void | Promise<void>;
  onNext: () => void;
  mode?: "onboarding" | "edit";
  startEmpty?: boolean;
}

type ProfileFieldName = "height" | "weight" | "age" | "bodyFatRate";
type ProfileFieldValues = Record<ProfileFieldName, string>;
type ProfileFieldErrors = Partial<Record<ProfileFieldName, string>>;

const PROFILE_FIELDS = [
  {
    name: "height",
    label: "키",
    unit: "cm",
    placeholder: "170",
    optional: false,
  },
  {
    name: "weight",
    label: "몸무게",
    unit: "kg",
    placeholder: "68",
    optional: false,
  },
  {
    name: "age",
    label: "나이",
    unit: "세",
    placeholder: "30",
    optional: false,
  },
  {
    name: "bodyFatRate",
    label: "체지방률",
    unit: "%",
    placeholder: "비워도 돼요",
    optional: true,
  },
] as const;

const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
] as const;

function validateNumberField(value: string): string | null {
  const trimmedValue = value.trim();
  if (trimmedValue === "") return null;
  if (!Number.isFinite(Number(trimmedValue))) return "숫자만 입력할 수 있어요.";
  if (Number(trimmedValue) <= 0) return "0보다 큰 숫자만 입력할 수 있어요.";
  return null;
}

export function UserProfileForm({
  profile,
  onProfileSave,
  onNext,
  mode = "onboarding",
  startEmpty = false,
}: UserProfileFormProps) {
  const isOnboarding = mode === "onboarding";
  const formId = useId();
  const [selectedGender, setSelectedGender] = useState<Gender>(profile.gender);
  const [fieldValues, setFieldValues] = useState<ProfileFieldValues>({
    height: startEmpty ? "" : String(profile.height),
    weight: startEmpty ? "" : String(profile.weight),
    age: startEmpty ? "" : String(profile.age),
    bodyFatRate: profile.bodyFatRate == null ? "" : String(profile.bodyFatRate),
  });
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [foodPreferences, setFoodPreferences] = useState<FoodPreferenceSelection>({
    preferred: profile.preferredFoodCategories ?? [],
    excluded: profile.excludedFoodCategories ?? [],
    allergies: profile.allergyFoodCategories ?? [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateNumberField =
    (fieldName: ProfileFieldName) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setFieldValues((previous) => ({ ...previous, [fieldName]: nextValue }));
      setFieldErrors((previous) => ({
        ...previous,
        [fieldName]: validateNumberField(nextValue) ?? undefined,
      }));
    };

  const isProfileValid = PROFILE_FIELDS.every(
    (field) =>
      (field.optional || fieldValues[field.name].trim() !== "") &&
      validateNumberField(fieldValues[field.name]) === null,
  );

  const handleNext = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    if (!isProfileValid) {
      setFieldErrors(
        Object.fromEntries(
          PROFILE_FIELDS.map((field) => [
            field.name,
            !field.optional && fieldValues[field.name].trim() === ""
              ? "입력해 주세요."
              : (validateNumberField(fieldValues[field.name]) ?? undefined),
          ]),
        ),
      );
      return;
    }
    const nextProfile: UserProfile = {
      ...profile,
      height: Number(fieldValues.height),
      weight: Number(fieldValues.weight),
      age: Number(fieldValues.age),
      gender: selectedGender,
      bmi: profile.bmi,
      bodyFatRate:
        fieldValues.bodyFatRate.trim() === ""
          ? undefined
          : Number(fieldValues.bodyFatRate),
      preferredFoodCategories: foodPreferences.preferred,
      excludedFoodCategories: foodPreferences.excluded,
      allergyFoodCategories: foodPreferences.allergies,
    };
    setIsSaving(true);
    try {
      await onProfileSave(nextProfile);
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
    onNext();
  };

  return (
    <form
      className="profileForm"
      onSubmit={(event) => void handleNext(event)}
      noValidate
      aria-labelledby={`${formId}-title`}
    >
      <header className="profileFormHeader">
        {isOnboarding ? (
          <StepProgress current={1} total={2} />
        ) : null}
        <h1 id={`${formId}-title`}>
          {isOnboarding ? (
            <>
              내 몸 정보를
              <br />
              알려주세요
            </>
          ) : (
            "내 정보"
          )}
        </h1>
        <p>
          {isOnboarding
            ? "하루 칼로리와 영양소 목표를 계산하는 데 사용해요."
            : "저장하면 다음 식단부터 반영돼요."}
        </p>
      </header>

      <section className="profileCard" aria-label="신체 정보 입력">
        <fieldset className="profileGender">
          <legend>성별</legend>
          <div
            className={`profileSegment${selectedGender === "female" ? " isSecond" : ""}`}
          >
            <span className="profileSegmentThumb" aria-hidden="true" />
            {GENDER_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={selectedGender === option.value ? "isSelected" : ""}
                aria-pressed={selectedGender === option.value}
                onClick={() => setSelectedGender(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="profileFieldGrid">
          {PROFILE_FIELDS.map((field) => {
            const inputId = `${formId}-${field.name}`;
            const error = fieldErrors[field.name];
            return (
              <div className="profileField" key={field.name}>
                <label htmlFor={inputId}>
                  {field.label}
                  {field.optional ? (
                    <span className="profileOptional">선택</span>
                  ) : null}
                </label>
                <div className={`profileInputWrap${error ? " hasError" : ""}`}>
                  <input
                    id={inputId}
                    name={field.name}
                    type="text"
                    inputMode={field.name === "age" ? "numeric" : "decimal"}
                    autoComplete="off"
                    required={!field.optional}
                    placeholder={field.placeholder}
                    value={fieldValues[field.name]}
                    onChange={updateNumberField(field.name)}
                    aria-invalid={error != null}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                  />
                  <span className="profileUnit" aria-hidden="true">
                    {field.unit}
                  </span>
                </div>
                {error ? (
                  <span
                    className="profileFieldError"
                    id={`${inputId}-error`}
                    role="alert"
                  >
                    {error}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {isOnboarding ? null : (
        <FoodPreferencePicker value={foodPreferences} onChange={setFoodPreferences} />
      )}

      <Button className="profileSubmit" type="submit" block disabled={isSaving}>
        {isOnboarding ? (
          <>
            목표 선택하러 가기
            <ArrowRightIcon />
          </>
        ) : isSaving ? (
          "저장하는 중…"
        ) : (
          "저장하기"
        )}
      </Button>
    </form>
  );
}
