import { request } from '@umijs/max';
import type {
  DictDataPageParams,
  DictDataVO,
  DictTypePageParams,
  DictTypeVO,
} from './types';

// ========== 字典类型 ==========

/** 获取字典类型分页列表 */
export async function getDictTypePage(params: DictTypePageParams) {
  return request<API.CommonResult<{ list: DictTypeVO[]; total: number }>>(
    '/admin-api/system/dict-type/page',
    { method: 'GET', params },
  );
}

/** 获取字典类型详情 */
export async function getDictType(id: number) {
  return request<API.CommonResult<DictTypeVO>>(
    '/admin-api/system/dict-type/get',
    {
      method: 'GET',
      params: { id },
    },
  );
}

/** 新增字典类型 */
export async function createDictType(data: DictTypeVO) {
  return request<API.CommonResult<number>>(
    '/admin-api/system/dict-type/create',
    {
      method: 'POST',
      data,
    },
  );
}

/** 修改字典类型 */
export async function updateDictType(data: DictTypeVO) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/dict-type/update',
    {
      method: 'PUT',
      data,
    },
  );
}

/** 删除字典类型 */
export async function deleteDictType(id: number) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/dict-type/delete',
    {
      method: 'DELETE',
      params: { id },
    },
  );
}

/** 获取字典类型精简列表 */
export async function getSimpleDictTypeList() {
  return request<API.CommonResult<DictTypeVO[]>>(
    '/admin-api/system/dict-type/simple-list',
    {
      method: 'GET',
    },
  );
}

// ========== 字典数据 ==========

/** 获取字典数据分页列表 */
export async function getDictDataPage(params: DictDataPageParams) {
  return request<API.CommonResult<{ list: DictDataVO[]; total: number }>>(
    '/admin-api/system/dict-data/page',
    { method: 'GET', params },
  );
}

/** 获取字典数据详情 */
export async function getDictData(id: number) {
  return request<API.CommonResult<DictDataVO>>(
    '/admin-api/system/dict-data/get',
    {
      method: 'GET',
      params: { id },
    },
  );
}

/** 新增字典数据 */
export async function createDictData(data: DictDataVO) {
  return request<API.CommonResult<number>>(
    '/admin-api/system/dict-data/create',
    {
      method: 'POST',
      data,
    },
  );
}

/** 修改字典数据 */
export async function updateDictData(data: DictDataVO) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/dict-data/update',
    {
      method: 'PUT',
      data,
    },
  );
}

/** 删除字典数据 */
export async function deleteDictData(id: number) {
  return request<API.CommonResult<boolean>>(
    '/admin-api/system/dict-data/delete',
    {
      method: 'DELETE',
      params: { id },
    },
  );
}

/** 获取全部字典数据精简列表 */
export async function getSimpleDictDataList() {
  return request<API.CommonResult<DictDataVO[]>>(
    '/admin-api/system/dict-data/simple-list',
    {
      method: 'GET',
    },
  );
}
