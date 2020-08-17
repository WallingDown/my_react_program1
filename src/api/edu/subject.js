//引入request，它是对axios的二次封装，使用到了拦截器
import request from "@/utils/request";
//课程分类管理相关请求的公共路径
const BASE_URL = "/admin/edu/subject";

// 获取所有一级课程分类数据
// export function reqAllNo1Subject() {
//   return request({
//     url:BASE_URL,
//     method: "GET",
//   });
// }

/**
 * 获取一级课程分类(分页数据)
 * @param {Number} page 页码
 * @param {Number} pageSize 页大小
 */
export function reqNo1SubjectPaging(page,pageSize) {
  return request({
		url:`${BASE_URL}/${page}/${pageSize}`,
    method: "GET",
  });
}
/**
 * 根据一级id的二级id
 * @param {String} parentId 
 */
export function reqNo2SubjectById(parentId) {
    return request({
        url:`${BASE_URL}/get/${parentId}`,
        method: "GET",
    });
  }