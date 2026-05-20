import { Button, TextField } from "@toss/tds-mobile";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { ScreenSectionHeader } from "./ScreenSectionHeader";
import type { Gender, UserProfile } from "../types/fitplate";

interface UserProfileFormProps {
  profile: UserProfile;
  onNext: () => void;
}

type ProfileFieldName = "heightCm" | "weightKg" | "age" | "bodyFatPercentage";

type ProfileFieldValues = Record<ProfileFieldName, string>;
type ProfileFieldErrors = Partial<Record<ProfileFieldName, string>>;

const NUMBER_TYPE_ERROR_MESSAGE = "숫자만 입력할 수 있어요.";
const NEGATIVE_NUMBER_ERROR_MESSAGE = "0보다 큰 숫자만 입력할 수 있어요.";

function validateNumberField(value: string): string | null {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return null;
  }

  if (Number.isNaN(Number(trimmedValue))) {
    return NUMBER_TYPE_ERROR_MESSAGE;
  }

  if (Number(trimmedValue) <= 0) {
    return NEGATIVE_NUMBER_ERROR_MESSAGE;
  }

  return null;
}

export function UserProfileForm({ profile, onNext }: UserProfileFormProps) {
  const [selectedGender, setSelectedGender] = useState<Gender>(profile.gender);
  const [focusedField, setFocusedField] = useState<ProfileFieldName | null>(
    null,
  );
  const [fieldValues, setFieldValues] = useState<ProfileFieldValues>({
    heightCm: String(profile.heightCm),
    weightKg: String(profile.weightKg),
    age: String(profile.age),
    bodyFatPercentage:
      profile.bodyFatPercentage == null ? "" : String(profile.bodyFatPercentage),
  });
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  const updateNumberField =
    (fieldName: ProfileFieldName) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      const nextError = validateNumberField(nextValue);

      setFieldValues((previousValues) => ({
        ...previousValues,
        [fieldName]: nextValue,
      }));
      setFieldErrors((previousErrors) => ({
        ...previousErrors,
        [fieldName]: nextError ?? undefined,
      }));
    };

  const focusNumberField =
    (fieldName: ProfileFieldName) =>
    () => {
      setFocusedField(fieldName);
    };

  const blurNumberField = () => {
    setFocusedField(null);
  };

  const getTextFieldClassName = (fieldName: ProfileFieldName) =>
    focusedField === fieldName
      ? "profileTextField isFocused"
      : "profileTextField";

  const hasFieldError = Object.values(fieldErrors).some(Boolean);
  const hasRequiredEmptyField =
    fieldValues.heightCm.trim() === "" ||
    fieldValues.weightKg.trim() === "" ||
    fieldValues.age.trim() === "";
  const isProfileValid = !hasFieldError && !hasRequiredEmptyField;

  return (
    <section className="screen">
      <ScreenSectionHeader
        description="키, 몸무게, 나이, 성별을 입력하면 결과 화면에서 목표를 계산합니다."
        step="1단계"
        title="신체정보 입력"
      />

      <div className="fieldGroup">
        <TextField
          containerProps={{ className: getTextFieldClassName("heightCm") }}
          hasError={fieldErrors.heightCm != null}
          help={fieldErrors.heightCm}
          label="키"
          labelOption="sustain"
          placeholder="키를 입력하세요"
          suffix="cm"
          value={fieldValues.heightCm}
          variant="box"
          onBlur={blurNumberField}
          onChange={updateNumberField("heightCm")}
          onFocus={focusNumberField("heightCm")}
        />
        <TextField
          containerProps={{ className: getTextFieldClassName("weightKg") }}
          hasError={fieldErrors.weightKg != null}
          help={fieldErrors.weightKg}
          label="몸무게"
          labelOption="sustain"
          placeholder="몸무게를 입력하세요"
          suffix="kg"
          value={fieldValues.weightKg}
          variant="box"
          onBlur={blurNumberField}
          onChange={updateNumberField("weightKg")}
          onFocus={focusNumberField("weightKg")}
        />
        <TextField
          containerProps={{ className: getTextFieldClassName("age") }}
          hasError={fieldErrors.age != null}
          help={fieldErrors.age}
          label="나이"
          labelOption="sustain"
          placeholder="나이를 입력하세요"
          suffix="세"
          value={fieldValues.age}
          variant="box"
          onBlur={blurNumberField}
          onChange={updateNumberField("age")}
          onFocus={focusNumberField("age")}
        />
        <TextField
          containerProps={{
            className: getTextFieldClassName("bodyFatPercentage"),
          }}
          hasError={fieldErrors.bodyFatPercentage != null}
          help={fieldErrors.bodyFatPercentage}
          label="체지방률(선택)"
          labelOption="sustain"
          placeholder="체지방률을 입력하세요"
          suffix="%"
          value={fieldValues.bodyFatPercentage}
          variant="box"
          onBlur={blurNumberField}
          onChange={updateNumberField("bodyFatPercentage")}
          onFocus={focusNumberField("bodyFatPercentage")}
        />
      </div>

      <div className="choiceGroup" aria-label="성별 선택">
        <Button
          variant={selectedGender === "male" ? "fill" : "weak"}
          onClick={() => setSelectedGender("male")}
        >
          남성
        </Button>
        <Button
          variant={selectedGender === "female" ? "fill" : "weak"}
          onClick={() => setSelectedGender("female")}
        >
          여성
        </Button>
      </div>

      <div className="selectGroup">
        <Button disabled={!isProfileValid} onClick={onNext}>
          목표 선택하기
        </Button>
      </div>
    </section>
  );
}
