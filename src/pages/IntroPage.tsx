// 로그인 전에 Fitplate의 주요 가치를 소개하는 인트로 화면
import { Button } from "@toss/tds-mobile";
import logoImage from "../assets/images/logo.png";
import mealPlanPreviewImage from "../assets/images/intro-meal-plan-preview.png";

interface IntroPageProps {
  onStart: () => void;
}

export function IntroPage({ onStart }: IntroPageProps) {
  return (
    <main className="introPage">
      <header className="introHeader">
        <img className="introLogo" src={logoImage} alt="Fitplate" />
        <div>
          <h1>내 몸에 맞는 식단을<br />간편하게 시작해 보세요</h1>
          <p>신체 정보와 목표를 바탕으로 하루 영양 기준과 식단을 확인할 수 있어요.</p>
        </div>
      </header>

      <figure className="introPreview">
        <img
          src={mealPlanPreviewImage}
          alt="목표 칼로리와 영양소, AI 추천 식단을 보여주는 FitPlate 예시 화면"
        />
        <figcaption>예시 화면이에요</figcaption>
      </figure>

      <ul className="introBenefits">
        <li><span>1</span><div><strong>간편한 신체 정보 입력</strong><p>몇 가지 정보만으로 필요한 영양 기준을 계산해요.</p></div></li>
        <li><span>2</span><div><strong>목표에 맞춘 식단 추천</strong><p>체중 관리 목표에 어울리는 하루 식단을 제안해요.</p></div></li>
        <li><span>3</span><div><strong>식단 저장과 즐겨찾기</strong><p>마음에 드는 식단과 음식을 편리하게 모아볼 수 있어요.</p></div></li>
      </ul>

      <footer className="introFooter">
        <p>식단 기록을 안전하게 저장하기 위해 로그인이 필요해요.</p>
        <Button color="primary" display="block" size="large" onClick={onStart}>
          토스로 시작하기
        </Button>
      </footer>
    </main>
  );
}
