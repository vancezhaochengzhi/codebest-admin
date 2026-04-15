export interface DeptVO {
  id?: number;
  name?: string;
  parentId?: number;
  sort?: number;
  leaderUserId?: number;
  phone?: string;
  email?: string;
  status?: number;
  createTime?: string;
  children?: DeptVO[];
}
