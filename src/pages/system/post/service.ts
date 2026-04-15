import { request } from '@umijs/max';
import type { PostPageParams, PostVO } from './types';

/** 获取岗位分页列表 */
export async function getPostPage(params: PostPageParams) {
  return request<API.CommonResult<{ list: PostVO[]; total: number }>>(
    '/admin-api/system/post/page',
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取岗位详情 */
export async function getPost(id: number) {
  return request<API.CommonResult<PostVO>>('/admin-api/system/post/get', {
    method: 'GET',
    params: { id },
  });
}

/** 新增岗位 */
export async function createPost(data: PostVO) {
  return request<API.CommonResult<number>>('/admin-api/system/post/create', {
    method: 'POST',
    data,
  });
}

/** 修改岗位 */
export async function updatePost(data: PostVO) {
  return request<API.CommonResult<boolean>>('/admin-api/system/post/update', {
    method: 'PUT',
    data,
  });
}

/** 删除岗位 */
export async function deletePost(id: number) {
  return request<API.CommonResult<boolean>>('/admin-api/system/post/delete', {
    method: 'DELETE',
    params: { id },
  });
}

/** 批量删除岗位 */
export async function deletePostList(ids: number[]) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/post/delete-list',
    {
      method: 'DELETE',
      params: { ids: ids.join(',') },
    },
  );
}

/** 获取岗位精简列表 */
export async function getSimplePostList() {
  return request<API.CommonResult<PostVO[]>>(
    '/admin-api/system/post/simple-list',
    {
      method: 'GET',
    },
  );
}
