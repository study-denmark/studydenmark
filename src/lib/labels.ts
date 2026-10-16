export const levelLabels = {
  academy_profession: "AP degree",
  top_up: "Top-up bachelor",
  professional_bachelor: "Prof. bachelor",
  bachelor: "University bachelor",
  master: "Master’s degree",
} as const;

export type ProgrammeLevel = keyof typeof levelLabels;

export const subscriptionStatusLabels: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Payment overdue",
  canceled: "Cancelled",
  unpaid: "Unpaid",
  incomplete: "Payment not completed",
  incomplete_expired: "Expired",
  paused: "Paused",
};
