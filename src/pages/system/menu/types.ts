export interface MenuVO {
  id?: number;
  name?: string;
  permission?: string;
  type?: number; // 1=目录 2=菜单 3=按钮
  sort?: number;
  parentId?: number;
  path?: string;
  icon?: string;
  component?: string;
  componentName?: string;
  status?: number;
  visible?: boolean;
  keepAlive?: boolean;
  alwaysShow?: boolean;
  createTime?: string;
  children?: MenuVO[];
}
