<template>
  <div>
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :lg="8">
            <a-form-item label="表单名称" name="name">
              <a-input placeholder="请输入表单名称" v-model:value="queryParam.tableName"/>
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
        <a-button type="primary" @click="showEdit = true" preIcon="ant-design:plus-outlined"> 新增关联表单</a-button>
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
      <template #diagramNameSlot="{ record }">
        <span @click="showResource(record)" style="color: blue; cursor: pointer">{{ record.diagramName }}</span>
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
  <!--表单-->
  <a-modal
    title="流程表单"
    width="900px"
    :confirmLoading="confirmLoading"
    :visible="showEdit"
    @cancel="closeModal"
    @ok="handleOk"
    cancelText="关闭"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
  >
    <a-spin :spinning="confirmLoading">
      <a-form ref="formRef" class="antd-modal-form" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-row>
          <a-col :span="24">
            <a-form-item label="表名" v-bind="validateInfos.tableName">
              <a-input v-model:value="formData.tableName" placeholder="请输入表名" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="访问路劲" v-bind="validateInfos.tablePath">
              <a-input v-model:value="formData.tablePath" placeholder="请输入访问路劲" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注" v-bind="validateInfos.remark">
              <a-textarea type="textarea" v-model:value="formData.remark" placeholder="请输入备注" :row="5" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="是否路由" v-bind="validateInfos.route">
              <JSwitch v-model:value="formData.route" :options="['1', '0']" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script lang="ts" name="modules-actTable" setup>
/**
 * haoyaogang table list to store all vue or http link
 */
  import { ref, reactive, defineExpose, nextTick, defineProps, computed } from "vue";
  import { BasicTable, useTable, TableAction, BasicColumn } from "/@/components/Table";
  import { useListPage } from '/@/hooks/system/useListPage';
  import {
    actTabledelete,
    actTabledeleteBatch,
    actTablelist,
    saveOrUpdateActTable
  } from "./ActReModel.api";
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { useMessage } from "/@/hooks/web/useMessage";
  import JSelectUserByDept from "/@/components/Form/src/jeecg/components/JSelectUserByDept.vue";
  import JSelectDept from "/@/components/Form/src/jeecg/components/JSelectDept.vue";
  import JSelectRole from "/@/components/Form/src/jeecg/components/JSelectRole.vue";
  import JDictSelectTag from "/@/components/Form/src/jeecg/components/JDictSelectTag.vue";
  import { getValueType } from "/@/utils";
  import { Form } from "ant-design-vue";
  import JSwitch from "/@/components/Form/src/jeecg/components/JSwitch.vue";
  import { h } from 'vue';

  const useForm = Form.useForm;
  const $message = useMessage();
  const formRef = ref();
  const queryParam = reactive<any>({});
  const toggleSearchStatus = ref<boolean>(false);
  const registerModal = ref();
  const disableSubmit = ref<boolean>(false);
  const createObj = reactive<any>({
    visible: false,
    confirmLoading: false,
  });
  const updateObj = reactive<any>({
    visible: false,
    confirmLoading: false,
  });

  const columns: BasicColumn[] = [
    {
      title: '#',
      dataIndex: '',
      key: 'rowIndex',
      width: 60,
      align: 'center',
      customRender: ({ index }) => {
        return parseInt(index) + 1;
      },
    },
    {
      title: '表名',
      align: 'center',
      dataIndex: 'tableName',
    },
    {
      title: '路径',
      align: 'center',
      dataIndex: 'tablePath',
    },
    {
      title: '备注',
      align: 'center',
      dataIndex: 'remark',
    },
    {
      title: '是否路由',
      align: 'center',
      dataIndex: 'routeType',
      customRender: ({ text }) => {
        return h('div', { style: { color: text == 0 ? 'green' : 'red' } }, text == 0 ? '路由' : '非路由');
        // return text == 0 ? '路由' : '非路由';
      },
    },
  ];

  //注册table数据
  const { tableContext } = useListPage({
    tableProps: {
      title: 'actTableList',
      api: actTablelist,
      columns,
      canResize: false,
      useSearchForm: false,
      actionColumn: {
        width: 300,
        fixed: 'right',
      },
      beforeFetch: (params) => {
        return Object.assign(params, queryParam);
      },
    },
  });
  const [registerTable, { reload, collapseAll, updateTableDataRecord, findTableDataRecord, getDataSource }, { rowSelection, selectedRowKeys }] =
    tableContext;
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 7 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 16 },
  });

  function loadData() {
    reload();
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    showEdit.value = true;
  }

  /**
   * 编辑事件
   */
  function handleEdit(record: Recordable) {
    nextTick(() => {
      resetFields();
      //赋值
      Object.assign(formData, record);
      showEdit.value = true;
    });
  }
  /**
   * 详情
   */
  function handleDetail(record: Recordable) {
    disableSubmit.value = true;
    handleEdit(record);
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await actTabledelete({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await actTabledeleteBatch({ ids: selectedRowKeys.value }, handleSuccess);
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
        label: '编辑',
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

  const confirmLoading = ref(false);
  const showEdit = ref(false);
  const formData = reactive<Record<string, any>>({
  });
  //表单验证
  const validatorRules = {};
  const { resetFields, validate, validateInfos } = useForm(formData, validatorRules, { immediate: true });
  function closeModal() {
    showEdit.value = false;
  }

  /**
   * 确定按钮点击事件
   */
  async function handleOk() {
    // 触发表单验证
    await validate();
    confirmLoading.value = true;
    const isUpdate = ref<boolean>(false);
    //时间格式化
    let model = formData;
    if (model.id) {
      isUpdate.value = true;
    }
    //循环数据
    for (let data in model) {
      //如果该数据是数组并且是字符串类型
      if (model[data] instanceof Array) {
        let valueType = getValueType(formRef.value.getProps, data);
        //如果是字符串类型的需要变成以逗号分割的字符串
        if (valueType === 'string') {
          model[data] = model[data].join(',');
        }
      }
    }
    await saveOrUpdateActTable(model, isUpdate.value)
      .then((res) => {
        if (res.success) {
          $message.createMessage.success(res.message);
          loadData();
        } else {
          $message.createMessage.warning(res.message);
        }
      })
      .finally(() => {
        confirmLoading.value = false;
        showEdit.value = false;
      });
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
  .nodespan {
    color: #999;
  }
  .ant-checkbox-wrapper + .ant-checkbox-wrapper {
    margin-left: 0;
    margin-right: 8px;
  }
  /**隐藏样式-modal确定按钮 */
  .jee-hidden {
    display: none !important;
  }
</style>
