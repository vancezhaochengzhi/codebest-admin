export interface DictTypeVO {
  id?: number;
  name?: string;
  type?: string;
  status?: number;
  remark?: string;
  createTime?: string;
}

export interface DictTypePageParams {
  pageNo?: number;
  pageSize?: number;
  name?: string;
  type?: string;
  status?: number;
  createTime?: string[];
}

export interface DictDataVO {
  id?: number;
  sort?: number;
  label?: string;
  value?: string;
  dictType?: string;
  status?: number;
  colorType?: string;
  cssClass?: string;
  remark?: string;
  createTime?: string;
}

export interface DictDataPageParams {
  pageNo?: number;
  pageSize?: number;
  label?: string;
  dictType?: string;
  status?: number;
}
