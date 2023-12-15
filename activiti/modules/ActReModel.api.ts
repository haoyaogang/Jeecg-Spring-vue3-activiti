/**
 * haoyaogang API for all activiti
 */
import { defHttp } from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

export enum Api {
  list = '/activiti/models/modelListData',
  save='/modules/actReModel/add',
  edit='/modules/actReModel/edit',
  deleteOne = '/activiti/models/delete/',
  deleteBatch = '/modules/actReModel/deleteBatch',
  importExcel = '/modules/actReModel/importExcel',
  exportXls = '/modules/actReModel/exportXls',
  create = '/activiti/models/create',
  update = '/activiti/modeler.html?modelId=',
  deployment = '/activiti/models/deployment/',
  processList = '/activiti_process/listData',
  exportimg = '/activiti/models/export',
  getProcessNode = '/activiti_process/getProcessNode',
  editNodeUser = '/activiti_process/editNodeUser',

  updateStatus = '/activiti_process/updateStatus',
  updateInfo = '/activiti_process/updateInfo',

  actTablelist = '/actTable/list',
  actTabledelete = '/actTable/delete/',
  actTabledeleteBatch = '/actTable/deleteBatch',
  actTableadd = "/actTable/add",
  actTableedit = "/actTable/edit",


  actBusinessList = '/actBusiness/listData',
  getProcessDataList = '/activiti_process/listData',
  actBusinessaddApply = '/actBusiness/add',
  actBusinessEditApply = '/actBusiness/editForm',

  actProcessIns_getFirstNode = '/actProcessIns/getFirstNode',
  applyBusiness = '/actBusiness/apply',

  historicFlow = '/actTask/historicFlow/',
  actBusinesscancelApply = '/actBusiness/cancel',

  todoList = '/actTask/todoList',
  getNextNode = '/activiti_process/getNextNode',
  getBackList = '/actTask/getBackList/',

  getNode = '/activiti_process/getNode/',
  actTaskPass = '/actTask/pass',
  actTaskBack = '/actTask/back',
  actTaskPassAll = '/actTask/passAll/',
  actTaskBackAll = '/actTask/backAll/',
  actTaskBackToTask = '/actTask/backToTask',
  actTaskDelegate = '/actTask/delegate',

  doneList = '/actTask/doneList',

  getRunningProcess = '/actProcessIns/getRunningProcess',
  deleteProcessIns = '/actProcessIns/delInsByIds/',
  updateInsStatus = '/actProcessIns/updateInsStatus/',
  getFinishedProcess = '/actProcessIns/getFinishedProcess',
  delHistoricIns = '/actProcessIns/delHistoricInsByIds/',
}
export const delHistoricIns = (id) => {
  return defHttp.post({ url: Api.delHistoricIns + id });
};
export const getFinishedProcess = (params) => defHttp.get({ url: Api.getFinishedProcess, params });
export const deleteProcessIns = (deleteId, params) => {
  return defHttp.post({ url: Api.deleteProcessIns+deleteId, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
export const updateInsStatus = (params) => {
  return defHttp.post({ url: Api.updateInsStatus, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
export const getRunningProcess = (params) => defHttp.get({ url: Api.getRunningProcess, params });
export const actTaskDelegate = (params) => {
  return defHttp.post({ url: Api.actTaskDelegate, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
export const actTaskBackToTask = (params) => {
  return defHttp.post({ url: Api.actTaskBackToTask, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
export const actTaskPass = (params) => {
  return defHttp.post({ url: Api.actTaskPass, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
export const actTaskBack = (params) => {
  return defHttp.post({ url: Api.actTaskBack, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
export const getNode = (params) => defHttp.get({ url: Api.getNode, params }, { isTransformResponse: false, joinParamsToUrl: true });
export const getBackList = (procInstId, params) => defHttp.get({ url: Api.getBackList + procInstId, params });
export const getNextNode = (params) => defHttp.get({ url: Api.getNextNode, params });
export const todoList = (params) => defHttp.get({ url: Api.todoList, params });
export const doneList = (params) => defHttp.get({ url: Api.doneList, params });
export const actBusinesscancelApply = (params) => {
  return defHttp.post({ url: Api.actBusinesscancelApply, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
export const historicFlow = (params) => defHttp.get({ url: Api.historicFlow + params });
export const applyBusiness = (params) => {
  return defHttp.post({ url: Api.applyBusiness, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
export const actProcessInsGetFirstNode = (params) => defHttp.get({ url: Api.actProcessIns_getFirstNode, params });

//act business
export const actBusinessList = (params) => defHttp.get({ url: Api.actBusinessList, params });
export const getProcessDataList = (params) => defHttp.get({ url: Api.getProcessDataList, params });

export const saveOrUpdateActBusiness = (params, isNew) => {
  const url = isNew ? Api.actBusinessaddApply : Api.actBusinessEditApply;
  return defHttp.post({ url: url, params }, { isTransformResponse: false, joinParamsToUrl: true });
};
//  actTableList
export const actTablelist = (params) => defHttp.get({ url: Api.actTablelist, params });
export const actTabledelete = (params,handleSuccess) => {
  return defHttp.delete({url: Api.actTabledelete,params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
};

export const actTabledeleteBatch = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({url: Api.actTabledeleteBatch, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;

/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;

/**
 * actTable 保存或者更新 hyg
 * @param params
 */
export const saveOrUpdateActTable = (params, isUpdate) => {
  const url = isUpdate ? Api.actTableedit : Api.actTableadd;
  return isUpdate
    ? defHttp.put({ url: url, params }, { isTransformResponse: false })
    : defHttp.post({ url: url, params }, { isTransformResponse: false });
};

export const deployment = (params) => defHttp.get({ url: Api.deployment + params });
export const getProcessNode = (params) => {
  return defHttp.post({ url: Api.getProcessNode + '?id=' + params }, { isTransformResponse: false });
};
export const editNodeUser = (params) => {
  return defHttp.post({ url: Api.editNodeUser, params }, { isTransformResponse: false, joinParamsToUrl: true });
};

export const updateStatus = (params) => {
  return defHttp.post({ url: Api.updateStatus, params }, { isTransformResponse: false, joinParamsToUrl: true });
};

export const updateInfo = (params) => {
  return defHttp.post({ url: Api.updateInfo, params }, { isTransformResponse: false, joinParamsToUrl: true });
};


/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
export const processList = (params) => defHttp.get({ url: Api.processList, params });

/**
 * 删除单个
 * @param params
 * @param handleSuccess
 */
export const deleteOne = (params,handleSuccess) => {
  return defHttp.delete({url: Api.deleteOne+params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}

/**
 * 批量删除
 * @param params
 * @param handleSuccess
 */
export const batchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({url: Api.deleteBatch, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}

/**
 * 保存或者更新
 * @param params
 * @param isUpdate
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params }, { isTransformResponse: false });
}

// hyg
export const millsToTime = (mills) => {
  if (!mills) {
    return '';
  }
  const s = mills / 1000;
  if (s < 60) {
    return s.toFixed(0) + ' 秒';
  }
  const m = s / 60;
  if (m < 60) {
    return m.toFixed(0) + ' 分钟';
  }
  const h = m / 60;
  if (h < 24) {
    return h.toFixed(0) + ' 小时';
  }
  const d = h / 24;
  if (d < 30) {
    return d.toFixed(0) + ' 天';
  }
  const month = d / 30
  if (month < 12) {
    return month.toFixed(0) + ' 个月';
  }
  const year = month / 12
  return year.toFixed(0) + ' 年';
};
