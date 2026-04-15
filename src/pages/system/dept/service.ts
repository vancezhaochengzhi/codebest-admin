import { request } from '@umijs/max';
import type { DeptVO } from './types';

/** 获取部门列表 */
export async function getDeptList(params?: { name?: string; status?: number }) {
  return request<API.CommonResult<DeptVO[]>>('/admin-api/system/dept/list', {
    method: 'GET',
    params,
  });
}

/** 获取部门详情 */
export async function getDept(id: number) {
  return request<API.CommonResult<DeptVO>>('/admin-api/system/dept/get', {
    method: 'GET',
    params: { id },
  });
}

/** 新增部门 */
export async function createDept(data: DeptVO) {
  return request<API.CommonResult<number>>('/admin-api/system/dept/create', {
    method: 'POST',
    data,
  });
}

/** 修改部门 */
export async function updateDept(data: DeptVO) {
  return request<API.CommonResult<boolean>>('/admin-api/system/dept/update', {
    method: 'PUT',
    data,
  });
}

/** 删除部门 */
export async function deleteDept(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/system/dept/delete', {
    method: 'DELETE',
    params: { id },
  });
}

/** 获取部门精简列表 */
export async function getSimpleDeptList() {
  return request<API.CommonResult<DeptVO[]>>(
    '/admin-api/system/dept/simple-list',
    {
      method: 'GET',
    },
  );
}
