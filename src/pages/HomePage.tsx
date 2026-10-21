// 식단 만들기 탭 — 새 식단 만들기 버튼과 내 정보 요약, 최근 저장 식단을 보여줍니다.
import "../styles/layout.css";
import "./HomePage.css";
import { ScreenSectionHeader } from "../components/common/ScreenSectionHeader";
import { ArrowRightIcon, ChevronRightIcon, SparkleIcon } from "../components/common/Icons";
import { FOOD_CATEGORY_LABELS, GOAL_LABELS } from "../types/fitplate";
import type { SavedMealPlan, UserProfile } from "../types/fitplate";

interface HomePageProps {
  profile: UserProfile;
  savedMealPlans: SavedMealPlan[];
  onCreate: () => void;
  onEditProfile: () => void;
  onViewSavedMealPlan: (savedMealPlan: SavedMealPlan) => void;
  onViewAllSavedMealPlans: () => void;
}

function findLatest(savedMealPlans: SavedMealPlan[]): SavedMealPlan | null {
  return savedMealPlans.reduce<SavedMealPlan | null>(
    (latest, plan) =>
      latest == null || new Date(plan.savedAt) > new Date(latest.savedAt) ? plan : latest,
    null,
  );
}

export function HomePage({
  profile,
  savedMealPlans,
  onCreate,
  onEditProfile,
  onViewSavedMealPlan,
  onViewAllSavedMealPlans,
}: HomePageProps) {
  const latest = findLatest(savedMealPlans);
  const preferenceLines = [
    { label: "좋아하는 음식", categories: profile.preferredFoodCategories ?? [] },
    { label: "빼는 음식", categories: profile.excludedFoodCategories ?? [] },
    { label: "알레르기", categories: profile.allergyFoodCategories ?? [] },
  ].filter((line) => line.categories.length > 0);
  const stats = [
    { label: "키", value: profile.height, unit: "cm" },
    { label: "몸무게", value: profile.weight, unit: "kg" },
    { label: "나이", value: profile.age, unit: "세" },
    { label: "성별", value: profile.gender === "male" ? "남성" : "여성", unit: "" },
  ];

  return (
    <section className="screen">
      <ScreenSectionHeader
        title={
          <>
            오늘은 어떤 식단을
            <br />
            만들어 볼까요?
          </>
        }
        description="내 정보와 목표에 맞춰 AI가 하루 식단을 짜 드려요."
      />

      <div className="createHero">
        <span className="createHeroBadge">
          <SparkleIcon />
          AI 맞춤 식단
        </span>
        <strong>
          목표만 고르면
          <br />
          하루 세 끼가 완성돼요
        </strong>
        <p>만드는 데 15~30초 정도 걸려요.</p>
        <button type="button" className="createHeroButton" onClick={onCreate}>
          새 식단 만들기
          <ArrowRightIcon />
        </button>
      </div>

      <div className="sectionTitle">
        <h2>내 정보</h2>
        <button type="button" className="textLink" onClick={onEditProfile}>
          수정
          <ChevronRightIcon />
        </button>
      </div>
      <dl className="card profileSummary">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              {stat.value}
              {stat.unit ? <span>{stat.unit}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
      {preferenceLines.length > 0 ? (
        <div className="profilePrefSummary">
          {preferenceLines.map((line) => (
            <p key={line.label}>
              <span>{line.label}</span>
              {line.categories.map((category) => FOOD_CATEGORY_LABELS[category]).join(", ")}
            </p>
          ))}
        </div>
      ) : null}

      {latest ? (
        <>
          <div className="sectionTitle">
            <h2>최근 저장한 식단</h2>
            <button type="button" className="textLink" onClick={onViewAllSavedMealPlans}>
              전체 보기
              <ChevronRightIcon />
            </button>
          </div>
          <button
            type="button"
            className="card recentPlan"
            onClick={() => onViewSavedMealPlan(latest)}
          >
            <span className="goalChip">{GOAL_LABELS[latest.goal]}</span>
            <span className="recentPlanText">
              <strong>{latest.title}</strong>
              <span>
                {new Date(latest.savedAt).toLocaleDateString("ko-KR", {
                  dateStyle: "medium",
                })}
              </span>
            </span>
            <ChevronRightIcon className="recentPlanChevron" />
          </button>
        </>
      ) : null}
    </section>
  );
}
