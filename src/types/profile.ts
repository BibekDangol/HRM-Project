export interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar?: string | null;
  organization_id: number | null;
  organization?: { name: string | null } | null;
}
