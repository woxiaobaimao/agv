import request from './request'
import { ElMessage } from 'element-plus'

interface ApiResponse<T = any> {
  data: T
  code?: number
  message?: string
}

class ApiClient {
  /**
   * GET 请求
   */
  async get<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await request.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await request.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await request.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await request.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * 统一错误处理
   */
  private handleError(error: any) {
    let message = '请求失败'

    if (error.response) {
      // 服务器响应了错误状态码
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          message = data?.message || '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 清除token，跳转登录页
          localStorage.removeItem('token')
          break
        case 403:
          message = '无权限访问'
          break
        case 404:
          message = '资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = data?.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message = '网络连接失败，请检查网络'
    } else {
      // 其他错误
      message = error.message || '未知错误'
    }

    console.error('[API Error]', message, error)
    ElMessage.error(message)
  }
}

export default new ApiClient()
