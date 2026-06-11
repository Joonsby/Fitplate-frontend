import { Top,Button } from "@toss/tds-mobile";
import logoImage from "../assets/images/logo.png";

interface AppTopTitleProps {
  isResultPage: boolean;
  isAiLoading: boolean;
  onSavedPlansClick: () => void;
  onFavoriteFoodsClick: () => void;
}

export function AppTopTitle({ isResultPage, isAiLoading, onSavedPlansClick, onFavoriteFoodsClick }: AppTopTitleProps) {
  if (isResultPage && isAiLoading) {
    return null;
  }

  return (
    <>
      <Top
        title={
          <div className="appTopTitle">
            <img className="appLogo" src={logoImage} alt="fitplate" />
          </div>
        }
        subtitleBottom={
          <div className="appTopSubtitle">
            신체정보와 목표로 하루 식단 기준을 확인하세요
          </div>
        }
      />
      <div className="topShortcutGrid">
        <Button color="primary" variant="weak" onClick={onSavedPlansClick}>
          저장된 식단
        </Button>
        <Button color="primary" variant="weak" onClick={onFavoriteFoodsClick}>
          즐겨찾기 음식
        </Button>
      </div>
    </>
  );
}