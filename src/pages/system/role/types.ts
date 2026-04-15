export interface RoleVO {
  id?: number;
  name?: string;
  code?: string;
  sort?: number;
  status?: number;
  type?: number;
  remark?: string;
  createTime?: string;
}

export interface RolePageParams {
  pageNo?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
  createTime?: string[];
}
