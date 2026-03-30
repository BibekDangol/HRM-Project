export interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar?: string | null;
  organization_id: number;
  organization?: { name: string | null } | null;
  role: string | null;
}
