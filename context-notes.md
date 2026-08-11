# 인트로 화면 작업 기록

- 기존 `App` 컴포넌트는 마운트 직후 `checkLogin()`을 실행해 `appLogin()` 바텀시트가 자동 노출된다.
- 최초 인증 상태를 인트로로 변경하고 사용자 CTA 클릭으로만 `checkLogin()`을 호출한다.
- 인트로는 서비스 가치, 주요 기능, 로그인 필요성, 명시적인 로그인 CTA를 한 화면에 제공한다.
- 실제 서비스 스크린샷은 사용자가 추후 교체할 예정이므로 이미지 파일 대신 독립적인 플레이스홀더 영역을 둔다.
- 로그인 성공 이후의 기존 라우팅과 데이터 조회 흐름은 변경하지 않는다.
- `npm run lint`는 오류 없이 완료됐으며 기존 `showToast` 의존성 경고 한 건이 남아 있다.
- `npx tsc --noEmit`과 Vite 프로덕션 번들 생성은 성공했다.
- `npm run build`의 마지막 `.ait` 패키징은 현재 실행 환경에서 `crypto is not defined` 오류로 중단됐다. 애플리케이션 소스 변환과 번들 생성 이후 도구 내부에서 발생한 환경 오류다.
- 첨부된 실제 화면을 바탕으로 4:3 미리보기를 만들고 `src/assets/images/intro-meal-plan-preview.png`에 추가했다. 클릭 가능한 요소와 날짜는 제외하고 결과 및 식단 요약만 남겼다.
- 인트로 로고는 가운데 정렬하고 제목과 설명은 가독성을 위해 왼쪽 정렬을 유지한다.

# AI 식사 구분 라벨 작업 기록

- 백엔드와 프론트 타입은 `mealType`을 `breakfast`, `lunch`, `dinner`로 제한하므로 화면 표시의 기준으로 사용한다.
- AI가 자유롭게 생성하는 `title`은 화면에 표시하지 않고 `mealType`을 아침·점심·저녁으로 변환한다.
- `MEAL_TYPE_LABELS`에 `satisfies Record<...>`를 적용해 끼니 유형이 추가되면 라벨 누락을 TypeScript가 감지하게 했다.
- `npm run lint`는 오류 없이 완료됐고 기존 `showToast` 의존성 경고 1건이 남았다. `npx tsc --noEmit`과 `npx vite build`는 성공했다.
