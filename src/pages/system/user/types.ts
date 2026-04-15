export interface UserVO {
  id?: number;
  username?: string;
  nickname?: string;
  deptId?: number;
  deptName?: string;
  postIds?: number[];
  email?: string;
  mobile?: string;
  sex?: number;
  avatar?: string;
  status?: number;
  remark?: string;
  createTime?: string;
}

export interface UserPageParams {
  pageNo?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
  mobile?: string;
  status?: number;
  deptId?: number;
  createTime?: string[];
}
