import { Button, TextField } from "@toss/tds-mobile";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { ScreenSectionHeader } from "./ScreenSectionHeader";
import type { Gender, UserProfile } from "../types/fitplate";

interface UserProfileFormProps {
  profile: UserProfile;
  onProfileSave: (profile: UserProfile) => void;
  onNext: () => void;
}

type ProfileFieldName = "height" | "weight" | "age" | "bodyFatPercentage";

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

export function UserProfileForm({ profile, onProfileSave, onNext }: UserProfileFormProps) {
  const [selectedGender, setSelectedGender] = useState<Gender>(profile.gender);
  const [focusedField, setFocusedField] = useState<ProfileFieldName | null>(
    null,
  );
  const [fieldValues, setFieldValues] = useState<ProfileFieldValues>({
    height: String(profile.height),
    weight: String(profile.weight),
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
    fieldValues.height.trim() === "" ||
    fieldValues.weight.trim() === "" ||
    fieldValues.age.trim() === "";
  const isProfileValid = !hasFieldError && !hasRequiredEmptyField;

  const handleNext = () => {
    onProfileSave({
      height: Number(fieldValues.height),
      weight: Number(fieldValues.weight),
      age: Number(fieldValues.age),
      gender: selectedGender,
      bodyFatPercentage:
        fieldValues.bodyFatPercentage.trim() === ""
          ? undefined
          : Number(fieldValues.bodyFatPercentage),
    });
    onNext();
  };

  return (
    <section className="screen">
      <ScreenSectionHeader
        description="키, 몸무게, 나이, 성별을 입력하면 결과 화면에서 목표를 계산합니다."
        step="1단계"
        title="신체정보 입력"
      />

      <div className="fieldGroup">
        <TextField
          containerProps={{ className: getTextFieldClassName("height") }}
          hasError={fieldErrors.height != null}
          help={fieldErrors.height}
          label="키"
          labelOption="sustain"
          placeholder="키를 입력하세요"
          suffix="cm"
          value={fieldValues.height}
          variant="box"
          onBlur={blurNumberField}
          onChange={updateNumberField("height")}
          onFocus={focusNumberField("height")}
        />
        <TextField
          containerProps={{ className: getTextFieldClassName("weight") }}
          hasError={fieldErrors.weight != null}
          help={fieldErrors.weight}
          label="몸무게"
          labelOption="sustain"
          placeholder="몸무게를 입력하세요"
          suffix="kg"
          value={fieldValues.weight}
          variant="box"
          onBlur={blurNumberField}
          onChange={updateNumberField("weight")}
          onFocus={focusNumberField("weight")}
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
        <Button disabled={!isProfileValid} onClick={handleNext}>
          목표 선택하기
        </Button>
      </div>
    </section>
  );
}
