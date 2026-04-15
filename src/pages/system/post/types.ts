export interface PostVO {
  id?: number;
  code?: string;
  name?: string;
  sort?: number;
  status?: number;
  remark?: string;
  createTime?: string;
}

export interface PostPageParams {
  pageNo?: number;
  pageSize?: number;
  code?: string;
  name?: string;
  status?: number;
}
