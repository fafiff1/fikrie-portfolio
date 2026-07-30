export type MediaItem = {
  id: string;
  type: "photo" | "video";
  title: string;
  src: string;
  poster?: string;
};

export type FamilyMemberId = "rafael" | "mikhail" | "mira";

export const FAMILY_MEMBER_IDS: FamilyMemberId[] = ["rafael", "mikhail", "mira"];

export function isFamilyMemberId(value: string): value is FamilyMemberId {
  return FAMILY_MEMBER_IDS.includes(value as FamilyMemberId);
}
