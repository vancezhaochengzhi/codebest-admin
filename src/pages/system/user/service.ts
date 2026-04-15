import { request } from '@umijs/max';
import type { UserPageParams, UserVO } from './types';

/** 获取用户分页列表 */
export async function getUserPage(params: UserPageParams) {
  return request<API.CommonResult<{ list: UserVO[]; total: number }>>(
    '/admin-api/system/user/page',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取用户详情 */
export async function getUser(id: number) {
  return request<API.CommonResult<UserVO>>('/admin-api/system/user/get', {
    method: 'GET',
    params: { id },
  });
}

/** 新增用户 */
export async function createUser(data: UserVO) {
  return request<API.CommonResult<number>>('/admin-api/system/user/create', {
    method: 'POST',
    data,
  });
}

/** 修改用户 */
export async function updateUser(data: UserVO) {
  return request<API.CommonResult<boolean>>('/admin-api/system/user/update', {
    method: 'PUT',
    data,
  });
}

/** 删除用户 */
export async function deleteUser(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/system/user/delete', {
    method: 'DELETE',
    params: { id },
  });
}

/** 批量删除用户 */
export async function deleteUserList(ids: number[]) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/user/delete-list',
    {
      method: 'DELETE',
      params: { ids: ids.join(',') },
    },
  );
}

/** 重置用户密码 */
export async function resetUserPassword(id: number, password: string) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/user/update-password',
    {
      method: 'PUT',
      data: { id, password },
    },
  );
}

/** 修改用户状态 */
export async function updateUserStatus(id: number, status: number) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/user/update-status',
    {
      method: 'PUT',
      data: { id, status },
    },
  );
}

/** 获取用户精简列表 */
export async function getSimpleUserList() {
  return request<API.CommonResult<UserVO[]>>(
    '/admin-api/system/user/simple-list',
    {
      method: 'GET',
    },
  );
}
