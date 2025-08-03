export interface Company {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}
