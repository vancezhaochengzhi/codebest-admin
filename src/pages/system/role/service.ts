import { request } from '@umijs/max';
import type { RolePageParams, RoleVO } from './types';

/** 获取角色分页列表 */
export async function getRolePage(params: RolePageParams) {
  return request<API.CommonResult<{ list: RoleVO[]; total: number }>>(
    '/admin-api/system/role/page',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取角色详情 */
export async function getRole(id: number) {
  return request<API.CommonResult<RoleVO>>('/admin-api/system/role/get', {
    method: 'GET',
    params: { id },
  });
}

/** 新增角色 */
export async function createRole(data: RoleVO) {
  return request<API.CommonResult<number>>('/admin-api/system/role/create', {
    method: 'POST',
    data,
  });
}

/** 修改角色 */
export async function updateRole(data: RoleVO) {
  return request<API.CommonResult<boolean>>('/admin-api/system/role/update', {
    method: 'PUT',
    data,
  });
}

/** 删除角色 */
export async function deleteRole(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/system/role/delete', {
    method: 'DELETE',
    params: { id },
  });
}

/** 批量删除角色 */
export async function deleteRoleList(ids: number[]) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/role/delete-list',
    {
      method: 'DELETE',
      params: { ids: ids.join(',') },
    },
  );
}

/** 获取角色精简列表 */
export async function getSimpleRoleList() {
  return request<API.CommonResult<RoleVO[]>>(
    '/admin-api/system/role/simple-list',
    {
      method: 'GET',
    },
  );
}
