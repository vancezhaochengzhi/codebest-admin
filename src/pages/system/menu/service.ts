import { request } from '@umijs/max';
import type { MenuVO } from './types';

/** 获取菜单列表 */
export async function getMenuList(params?: { name?: string; status?: number }) {
  return request<API.CommonResult<MenuVO[]>>('/admin-api/system/menu/list', {
    method: 'GET',
    params,
  });
}

/** 获取菜单详情 */
export async function getMenu(id: number) {
  return request<API.CommonResult<MenuVO>>('/admin-api/system/menu/get', {
    method: 'GET',
    params: { id },
  });
}

/** 新增菜单 */
export async function createMenu(data: MenuVO) {
  return request<API.CommonResult<number>>('/admin-api/system/menu/create', {
    method: 'POST',
    data,
  });
}

/** 修改菜单 */
export async function updateMenu(data: MenuVO) {
  return request<API.CommonResult<boolean>>('/admin-api/system/menu/update', {
    method: 'PUT',
    data,
  });
}

/** 删除菜单 */
export async function deleteMenu(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/system/menu/delete', {
    method: 'DELETE',
    params: { id },
  });
}

/** 获取菜单精简列表 */
export async function getSimpleMenuList() {
  return request<API.CommonResult<MenuVO[]>>(
    '/admin-api/system/menu/simple-list',
    {
      method: 'GET',
    },
  );
}
