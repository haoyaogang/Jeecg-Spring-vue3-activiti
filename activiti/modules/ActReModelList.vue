<template>
  <div>
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :lg="8">
            <a-form-item label="模型名称" name="name">
              <a-input placeholder="请输入模型名称" v-model:value="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-col :lg="6">
                <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
                <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
                <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">
                  {{ toggleSearchStatus ? '收起' : '展开' }}
                  <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
                </a>
              </a-col>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="createObj.visible = true" preIcon="ant-design:plus-outlined"> 创建流程模型</a-button>
<!--        <a-button  type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>-->
<!--        <j-upload-button  type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>-->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"/>
      </template>
      <!--字段回显插槽-->
      <template #htmlSlot="{text}">
        <div v-html="text"></div>
      </template>
      <!--省市区字段回显插槽-->
      <template #pcaSlot="{text}">
        {{ getAreaTextByCode(text) }}
      </template>
      <template #fileSlot="{text}">
        <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
        <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined" size="small" @click="downloadFile(text)">下载</a-button>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <ActReModelModal ref="registerModal" @success="handleSuccess"></ActReModelModal>
  </div>
  <a-modal
    title="创建模型"
    :visible="createObj.visible"
    @ok="createObjOk"
    :confirmLoading="createObj.confirmLoading"
    @cancel="createObj.visible = false"
  >
    <div>
      模型名称：<a-input placeholder="输入模型名称" v-model:value="createObj.name" />
      <br />
      模型Key：<a-input placeholder="输入模型Key" v-model:value="createObj.key" />
      <br />
      模型描述：<a-textarea placeholder="输入模型描述" v-model:value="createObj.description" :rows="4" />
    </div>
  </a-modal>

  <a-modal title="审批流-设计模型" :visible="updateObj.visible" :footer="null" :maskClosable="false" width="90%" @cancel="cancelUpdate" style="top: 20px">
<!--    {{ iframUrl }}-->
    <iframe :src="iframUrl" frameborder="0" width="100%" height="800px" scrolling="auto" style="background-color: #fff"></iframe>
  </a-modal>
</template>

<script lang="ts" name="modules-actReModel" setup>
  import { ref, reactive } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { columns } from './ActReModel.data';
  import { list, deleteOne, batchDelete, getImportUrl, getExportUrl, Api, deployment } from './ActReModel.api';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import ActReModelModal from './components/ActReModelModal.vue'
  import { useMessage } from "/@/hooks/web/useMessage";

  const $message = useMessage();
  const formRef = ref();
  const queryParam = reactive<any>({});
  const toggleSearchStatus = ref<boolean>(false);
  const registerModal = ref();
  const createObj = reactive<any>({
    visible: false,
    confirmLoading: false,
  });

  const updateObj = reactive<any>({
    visible: false,
    confirmLoading: false,
  });
  const iframUrl = ref();


  //注册table数据
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: 'act_re_model',
      api: list,
      columns,
      canResize:false,
      useSearchForm: false,
      actionColumn: {
        width: 200,
        fixed: 'right',
      },
      beforeFetch: (params) => {
        return Object.assign(params, queryParam);
      },
    },
    exportConfig: {
      name: "act_re_model",
      url: getExportUrl,
      params: queryParam,
    },
	  importConfig: {
	    url: getImportUrl,
	    success: handleSuccess
	  },
  });
  const [registerTable, { reload, collapseAll, updateTableDataRecord, findTableDataRecord, getDataSource }, { rowSelection, selectedRowKeys }] = tableContext;
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 7 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 16 },
  });
  function createObjOk() {
    createObj.confirmLoading = true;
    updateObj.visible = true;
    iframUrl.value = `${window._CONFIG['domianURL']}${Api.create}?name=${createObj.name||""}&key=${createObj.key||""}&description=${createObj.description||""}`
    createObj.visible = false;
    createObj.confirmLoading = false;
  }
  function cancelUpdate() {
    $message.createConfirm({
      iconType: 'warning',
      title: '关闭前请确认已保存修改?',
      content: '关闭后未保存的修改将丢失',
      okType: 'danger',
      okText: '确认关闭',
      onOk: () => {
        updateObj.visible = false;
        loadData();
      },
      onCancel: () => {},
    });
  }

  function loadData() {
    reload();
  }
  /**
   * 新增事件
   */
  function handleAdd() {
    registerModal.value.disableSubmit = false;
    registerModal.value.add();
  }

  /**
   * 编辑事件
   */
  function handleEdit(record: Recordable) {
    // registerModal.value.disableSubmit = false;
    // registerModal.value.edit(record);
    createObj.confirmLoading = true;
    iframUrl.value = `${window._CONFIG['domianURL']}${Api.update}${record.id}`;
    updateObj.visible = true;
    createObj.confirmLoading = false;
  }

  /**
   * 发布模型
   * @param record
   */
  function handleDeployment(record: Recordable) {
    $message.createConfirm({
      iconType: 'warning',
      title: '确认部署流程',
      content: `确认部署流程：${record.name}`,
      okType: 'danger',
      okText: '发布模型',
      onOk: () => {
        deployment(record.id).then((res) => {
          if (res.success) {
            $message.createMessage.success(res.message);
          } else {
            $message.createMessage.error(res.message);
          }
          loadData();
        });
      },
      onCancel: () =>{},

    });
  }

  /**
   * 详情
   */
  function handleDetail(record: Recordable) {
    // registerModal.value.disableSubmit = true;
    // registerModal.value.edit(record);
    createObj.confirmLoading = true;
    iframUrl.value = `${window._CONFIG['domianURL']}${Api.update}${record.id}`;
    updateObj.visible = true;
    createObj.confirmLoading = false;
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteOne(record.id , handleSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '发布',
        onClick: handleDeployment.bind(null, record),
      },
      {
        label: '设计',
        onClick: handleEdit.bind(null, record),
      },

    ];
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      }, {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        }
      }
    ]
  }

  /**
   * 查询
   */
  function searchQuery() {
    reload();
  }

  /**
   * 重置
   */
  function searchReset() {
    formRef.value.resetFields();
    selectedRowKeys.value = [];
    //刷新数据
    reload();
  }




</script>

<style lang="less" scoped>
  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
    .query-group-cust{
      width: calc(50% - 15px);
      min-width: 100px !important;
    }
    .query-group-split-cust{
      width: 30px;
      display: inline-block;
      text-align: center
    }
  }
</style>
