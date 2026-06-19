export interface LoadFullScreenAdParams {
  options: {
    adGroupId: string;
  };
  onEvent: (event: { type: "loaded" }) => void;
  onError: (error: unknown) => void;
}

export type ShowFullScreenAdEvent =
  | { type: "requested" }
  | { type: "show" }
  | { type: "impression" }
  | { type: "clicked" }
  | { type: "dismissed" }
  | { type: "failedToShow" }
  | {
      type: "userEarnedReward";
      data: {
        unitType: string;
        unitAmount: number;
      };
    };