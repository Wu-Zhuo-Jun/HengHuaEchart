import { lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useRoutes,
} from 'react-router-dom';

const elementMap = {
    'HomePage': lazy(() => import('../pages/homepage/HomePage')),
    'DailyReport': lazy(() => import('../pages/flow/report/DailyReport')),
}

// 递归创建路由配置
export const createRoutes = (routesConfig) => {
  return routesConfig.map(route => {
    const element = elementMap[route.element];
    
    return {
      path: route.path,
      element: <element />,
      children: route.children ? createRoutes(route.children) : null,
      // 添加额外元数据（可选）
      meta: { 
        title: route.title ,
        id:route.id,
      }
    };
  });
};

export const renderRoutes = (routes) => {

}