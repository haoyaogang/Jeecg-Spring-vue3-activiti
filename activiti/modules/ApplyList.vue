<template>
  <div>
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :lg="8">
            <a-form-item label="标题" name="name">
              <a-input placeholder="请输入搜索关键词" v-model:value="queryParam.title" />
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item label="状态">
              <a-select v-model:value="queryParam.status" placeholder="请选择" :allowClear="true">
                <a-select-option value="0">草稿</a-select-option>
                <a-select-option value="1">处理中</a-select-option>
                <a-select-option value="2">已结束</a-select-option>
                <a-select-option value="3">已撤回</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item label="结果">
              <a-select v-model:value="queryParam.result" placeholder="请选择" :allowClear="true">
                <a-select-option value="0">未提交</a-select-option>
                <a-select-option value="1">处理中</a-select-option>
                <a-select-option value="2">通过</a-select-option>
                <a-select-option value="3">驳回</a-select-option>
              </a-select>
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
        <a-button type="primary" @click="addApply" preIcon="ant-design:plus-outlined" :loading="addApplyLoading"> 发起申请</a-button>
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
<!--      <template #diagramNameSlot="{ record }">-->
<!--        <span @click="showResource(record)" style="color: blue; cursor: pointer">{{ record.diagramName }}</span>-->
<!--      </template>-->
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
  <!--发起申请-->
  <!--流程申请选择-->
  <a-drawer title="选择流程" width="33%" placement="right" :closable="false" @close="processModalVisible = false"
            :visible="processModalVisible">
    <a-empty description="无流程可供选择" v-if="activeKeyAll.length == 0" />
    <div v-else>
      <a-input-search style="margin-bottom: 10px; width: 200px" placeholder="输入流程名称" @search="onSearchProcess" />
      <a-collapse v-model:value="activeKey">
        <a-collapse-panel v-for="(value, index) in activeKeyAll" :header="filterDictText(value) || '默认分类'" :key="value">
          <a-list :grid="{ gutter: 10, column: 1 }" :dataSource="processDataMap[value]">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-card>
                  <div>
                    <a-row>
                      <a-col span="12" :title="item.name">{{ item.name }} </a-col>
                      <a-col span="12" style="text-align: right">
                        <a href="javascript:void (0)" @click="chooseProcess(item)">发起申请</a>
                      </a-col>
                    </a-row>
                  </div>
                  <b>版本：</b>v.{{ item.version }}
                  <br />
                  <b>说明：</b>{{ item.description }}
                </a-card>
              </a-list-item>
            </template>
          </a-list>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </a-drawer>
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

  <!--流程表单-->
  <a-modal :title="lcModa.title" :visible="lcModa.visible" :maskClosable="false" width="80%" @cancel="lcModa.visible = false" @ok="lcModaOk" :ok-button-props="{hidden: lcModa.showOkButton}">
    <component
      :formDisabled="lcModa.disabled"
      :formBpm="true"
      :formData="{ disabled: lcModa.disabled, tableId: lcModa.tableId }"
      v-if="lcModa.visible"
      :is="lcModa.formComponent"
      :processData="lcModa.processData"
      :isNew="lcModa.isNew"
      @close="(lcModa.visible = false), (lcModa.disabled = false)"
      @ok="handleFormResult"
      ref="registerForm"
    />
  </a-modal>

  <!--提交申请表单-->
  <a-modal title="提交申请" :visible="modalVisible" :mask-closable="false" width="50%" @cancel="modalVisible = false" okText="提交审批" @ok="applySubmit">
    <div v-if="modalVisible" style="padding: 10px">
      <a-form ref="" class="antd-modal-form" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-form-item label="选择审批人" v-show="showAssign">
          <a-select style="width: 100%" v-model:value="applyForm.assignees" placeholder="请选择" mode="multiple" :allowClear="true">
            <a-select-option v-for="(item, i) in assigneeList" :key="i" :value="item.username">{{ item.realname }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="下一审批人" v-show="isGateway">
          <a-alert type="info" showIcon message="分支网关处不支持自定义选择下一审批人，将自动下发给所有可审批人。">，将发送给下一节点所有人</a-alert>
        </a-form-item>
        <a-form-item label="优先级" prop="priority">
          <a-select v-model:value="applyForm.priority" placeholder="请选择" :allowClear="true" style="width: 100%">
            <a-select-option :value="0">普通</a-select-option>
            <a-select-option :value="1">重要</a-select-option>
            <a-select-option :value="2">紧急</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="消息通知">
          <a-checkbox v-model:value="applyForm.sendMessage">系统消息通知</a-checkbox>
          <a-checkbox v-model:value="applyForm.sendSms" disabled>短信通知</a-checkbox>
          <a-checkbox v-model:value="applyForm.sendEmail" disabled>邮件通知</a-checkbox>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>

  <!--审批历史-->
  <a-modal
    title="审批历史"
    :visible="modalLsVisible"
    :mask-closable="true"
    :width="'80%'"
    :class="'ant-modal-confirm'"
    @cancel="closeLsModal"
    :ok-button-props="{ hidden: true }"
    cancelText="关闭"
  >
    <historicDetail :procInstId="procInstId" :lcModa="lcModa" />
  </a-modal>

  <a-modal
    title="确认撤回"
    v-model:visible="modalCancelVisible"
    :mask-closable="false"
    :width="500"
    @cancel="modalCancelVisible = false"
    @ok="handelSubmitCancel"
    okText="提交"
  >
    <a-form ref="delForm" v-model:value="cancelForm" :label-width="70" v-if="modalCancelVisible" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <a-form-item label="撤回原因" prop="reason">
        <a-input type="textarea" v-model:value="cancelForm.reason" :rows="5" />
      </a-form-item>
    </a-form>
  </a-modal>

</template>

<script lang="ts" name="modules-actTable" setup>
  /**
   *  haoyaogang apply list for activiti
   */
  import { initDictOptions } from '/@/utils/dict/index';
  import {
    ref,
    reactive,
    defineExpose,
    nextTick,
    defineProps,
    computed,
    defineAsyncComponent
  } from "vue";
  import { BasicTable, useTable, TableAction, BasicColumn } from "/@/components/Table";
  import { useListPage } from '/@/hooks/system/useListPage';
  import {
    actBusinessList,getProcessDataList,saveOrUpdateActBusiness,actProcessInsGetFirstNode,applyBusiness,actBusinesscancelApply
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
  import filter from 'lodash/filter';
  import groupBy from 'lodash/groupBy';
  import HistoricDetail from "/@/views/activiti/modules/components/historicDetail.vue";
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
      title: '标题',
      align: 'center',
      dataIndex: 'title',
    },
    {
      title: '所属流程',
      align: 'center',
      dataIndex: 'processName',
    },
    {
      title: '当前审批环节',
      align: 'center',
      dataIndex: 'currTaskName',
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'status',
      customRender: ({ text }) => {
        let status = text;
        let textstr = "未知", color = "";
        if (status == 0) {
          textstr = "草稿";
          color = "default";
        } else if (status == 1) {
          textstr = "处理中";
          color = "orange";
        } else if (status == 2) {
          textstr = "已结束";
          color = "blue";
        } else if (status == 3) {
          textstr = "已撤回";
          color = "magenta";
        }
        return h('div', { style: { color: color } }, textstr);
      },
    },
    {
      title: '结果',
      align: 'center',
      dataIndex: 'result',
      customRender: ({ text }) => {
        let textstr = "未知", color = "";
        let result = text;
        if (result == 0) {
          textstr = "未提交";
          color = "default";
        } else if (result == 1) {
          textstr = "处理中";
          color = "orange";
        } else if (result == 2) {
          textstr = "已通过";
          color = "green";
        } else if (result == 3) {
          textstr = "已驳回";
          color = "red";
        }
        return h('div', { style: { color: color } }, textstr);
      },
    },
    {
      title: '创建时间',
      align: 'center',
      dataIndex: 'createTime',
    },
    {
      title: '提交申请时间',
      align: 'center',
      dataIndex: 'applyTime',
    },
  ];

  //注册table数据
  const { tableContext } = useListPage({
    tableProps: {
      title: 'actBusinessList',
      api: actBusinessList,
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
    if (!record.tableName) {
      $message.createMessage.warning('该流程信息未配置表单，请联系开发人员！');
      return;
    }
    lcModa.showOkButton = false;
    lcModa.tableId = record.tableId;
    lcModa.formComponent = defineAsyncComponent(() => import(`/@/views/${record.routeName}`));
    lcModa.title = '修改流程业务信息：' + record.processName;
    lcModa.processData = record;
    lcModa.isNew = false;
    lcModa.visible = true;

  }

  /**
   * 查看表单数据
   * @param record
   */
  function showTableData(record: Recordable) {
    if (!record.tableName) {
      $message.createMessage.warning('该流程信息未配置表单，请联系开发人员！');
      return;
    }
    lcModa.showOkButton = true;
    lcModa.disabled = true;
    lcModa.tableId = record.tableId;
    lcModa.formComponent = defineAsyncComponent(() => import(`/@/views/${record.routeName}`));
    lcModa.title = '修改流程业务信息：' + record.processName;
    lcModa.processData = record;
    lcModa.isNew = false;
    lcModa.visible = true;
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
    // await actTabledelete({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    // await actTabledeleteBatch({ ids: selectedRowKeys.value }, handleSuccess);
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

    if(record.status == 0){
      return [
        {
          label: '提交审批',
          onClick: handleSubmitApply.bind(null, record),
        },
        {
          label: '编辑表单',
          onClick: handleEdit.bind(null, record),
        },
      ];
    } else if (record.status == 1) {
      return [
        {
          label: '撤回',
          onClick: handleCancleSubmit.bind(null, record),
        },
        {
          label: '查看进度',
          onClick: showProgress.bind(null, record),
        },
        {
          label: '表单数据',
          onClick: showTableData.bind(null, record),
        },
      ];
    } else if ((record.status == 2 && record.result == 3) || record.status == 3) {
      return [
        {
          label: '重新申请',
          onClick: handleSubmitApply.bind(null, record),
        },
        {
          label: '编辑表单',
          onClick: handleEdit.bind(null, record),
        },
        {
          label: '审批历史',
          onClick: showProgress.bind(null, record),
        },
      ];
    } else {
      return [
        {
          label: '审批历史',
          onClick: showProgress.bind(null, record),
        },
        {
          label: '表单数据',
          onClick: showTableData.bind(null, record),
        },
      ];
    }
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
    // await saveOrUpdateActTable(model, isUpdate.value)
    //   .then((res) => {
    //     if (res.success) {
    //       $message.createMessage.success(res.message);
    //       loadData();
    //     } else {
    //       $message.createMessage.warning(res.message);
    //     }
    //   })
    //   .finally(() => {
    //     confirmLoading.value = false;
    //     showEdit.value = false;
    //   });
  }
  // processModalVisible
  const processModalVisible = ref(false);
  const activeKeyAll = ref<any>([]);
  const activeKey = ref<any>([]);
  const searchProcessKey = ref<any>(null);
  const dictOptions = ref<any>([]);
  const processDataMap = ref<any>({});
  const addApplyLoading = ref(false);
  const lcModa = reactive({
    title: '',
    disabled: false,
    visible: false,
    formComponent: null,
    isNew: false,
    tableId: null,
    showOkButton: true,
  });
  const registerForm = ref();
  function addApply() {
    getProcessList();
  }
  function getProcessList() {
    addApplyLoading.value = true;
    getProcessDataList({ status: 1, roles: true })
      .then((res) => {
        activeKeyAll.value = [];
        let result = res || [];
        if (result.length > 0) {
          console.log('getProcessDataList:::', result.length, JSON.stringify(res));
          if (searchProcessKey.value) {
            result = filter(result, function (o) {
              return o.name.indexOf(searchProcessKey.value) > -1;
            });
          }
          processDataMap.value = groupBy(result, 'categoryId');
          console.log('processDataMap groupBy:::', JSON.stringify(processDataMap.value));
          for (const categoryId in processDataMap.value) {
            activeKeyAll.value.push(categoryId);
          }
          activeKey.value = activeKeyAll;
        }
        processModalVisible.value = true;
      })
      .finally(() => (addApplyLoading.value = false));
  }
  function onSearchProcess(value) {
    searchProcessKey.value = value;
    getProcessList();
  }
  function filterDictText(text) {
    console.log('filterDictText::', text, dictOptions.value);
    if (dictOptions.value instanceof Array) {
      for (let dictItem of dictOptions.value) {
        if (text === dictItem.value) {
          return dictItem.text;
        }
      }
    }
    return text || text == 'null' ? '' : text;
  }
  function chooseProcess(v) {
    if (!v.routeName) {
      $message.createMessage.warning('该流程信息未配置表单，请联系开发人员！');
      return;
    }
    lcModa.showOkButton = false;
    lcModa.tableId = null;
    lcModa.formComponent = defineAsyncComponent(() => import(`/@/views/${v.routeName}`));
    lcModa.title = '发起流程：' + v.name;
    lcModa.isNew = true;
    lcModa.processData = v;
    lcModa.visible = true;
  }


  /**
   * 父组件modal 操作确定按钮，需要把动作传递给子组件
   * @param result
   */
  function lcModaOk() {
    registerForm.value.submitForm();
  }

  /**
   * 子组件表单传递结果给父组件
   */
  async function handleFormResult(res) {
    if (!lcModa.isNew) {
      lcModa.visible = false;
      return;
    }
    console.log("res::::",JSON.stringify(res));
    let fromdata = {
      procDefId: lcModa.processData.id,
      procDeTitle: lcModa.processData.name,
      tableName: lcModa.processData.routeName,
      name: lcModa.processData.name,
      id: res.result.id
    }
    console.log("fromdata:::",JSON.stringify(fromdata));
    await saveOrUpdateActBusiness(fromdata, lcModa.isNew).then((res) => {
      if (res.success) {
        $message.createMessage.success('保存成功！');
      } else {
        $message.createMessage.error(res.message);
      }
      lcModa.visible = false;
      loadData();
    });
  }
  /******提交表单hyg*******/
  const modalVisible = ref(false);
  const modalCancelVisible = ref(false);
  const showAssign = ref(false);
  const assigneeList = ref([]);
  const isGateway = ref(false);
  const error = ref();
  const applyForm = reactive<Record<string, any>>({
    priority: 0,
    assignees: [],
    sendMessage: true,
  });
  const cancelForm = reactive<Record<string, any>>({
    id: '',
    procInstId: '',
    reason: '',
  });

  function handleSubmitApply(record: Recordable) {
    if (!record.procDefId || record.procDefId == 'null') {
      $message.createMessage.error('流程定义为空');
      return;
    }
    applyForm.id = record.id;
    applyForm.procDefId = record.procDefId;
    applyForm.title = record.title;
    // get information of apply
    actProcessInsGetFirstNode({ procDefId: record.procDefId, tableId: record.tableId, tableName: record.tableName }).then((result) => {
      console.log('actProcessInsGetFirstNode:::', JSON.stringify(result));
      if (result.type == 3 || result.type == 4) {
        isGateway.value = true;
        modalVisible.value = true;
        applyForm.firstGateway = true;
        showAssign.value = false;
        error.value = '';
        return;
      }
      applyForm.firstGateway = false;
      isGateway.value = false;
      if (result.users && result.users.length > 0) {
        error.value = '';
        assigneeList.value = result.users;
        // 默认勾选
        let ids = [];
        result.users.forEach((e) => {
          ids.push(e.username);
          return e.username;
        });
        applyForm.assignees = ids;
        showAssign.value = true;
      } else {
        applyForm.assignees = [];
        showAssign.value = true;
        error.value = '审批节点未分配候选审批人员，请联系管理员！';
      }
      if (error.value) {
        $message.createMessage.error(error.value);
        return;
      }
      modalVisible.value = true;
      console.log('显示提交审核');
    });
  }

  /**
   * 提交审批--弹窗
   */
  function applySubmit() {
    if (showAssign.value && applyForm.assignees.length < 1) {
      error.value = '请至少选择一个审批人';
      $message.createMessage.error(error.value);
      return;
    } else {
      error.value = '';
    }

    let params = Object.assign({}, applyForm);
    params.assignees = params.assignees.join(',');
    console.log('applySubmit:::', JSON.stringify(params));
    applyBusiness(params).then((res) => {
      console.log('applyBusiness:::', JSON.stringify(res));
      if (res.success) {
        $message.createMessage.success('操作成功');
        loadData();
        modalVisible.value = false;
      } else {
        $message.createMessage.error(res.message);
      }
    });
  }

  // procInstId.value = record.procInstId;
  // modalLsVisible.value = true;
  // History
  const procInstId = ref();
  const modalLsVisible = ref(false);
  function closeLsModal() {
    nextTick(() => {
      modalLsVisible.value = false;
    });
  }

  function showProgress(record: Recordable) {
    if (!record.procInstId) {
      $message.createMessage.error('流程实例ID不存在');
      return;
    }
    if (!record.tableName) {
      $message.createMessage.warning('该流程信息未配置表单，请联系开发人员！');
      return;
    }
    lcModa.showOkButton = false;
    lcModa.tableId = record.tableId;
    lcModa.formComponent = defineAsyncComponent(() => import(`/@/views/${record.routeName}`));
    lcModa.title = '修改流程业务信息：' + record.processName;
    lcModa.processData = record;
    procInstId.value = record.procInstId;
    modalLsVisible.value = true;
  }
  function handleCancleSubmit(record) {
    cancelForm.id = record.id;
    cancelForm.procInstId = record.procInstId;
    modalCancelVisible.value = true;
  }
  function handelSubmitCancel() {
    actBusinesscancelApply(cancelForm).then((result) => {
      console.log("actBusinesscancelApply:::", JSON.stringify(result));
      // this.$message.success("操作成功");
      if (result.success) {
        $message.createMessage.success('操作成功');
        loadData();
        modalCancelVisible.value = false;
      } else {
        $message.createMessage.error(result.message);
      }
    });
  }
  //初始化字典 - 流程分类
  function initData() {
    initDictOptions('bpm_process_type').then((res) => {
      dictOptions.value = res;
      console.log('initDictOptions:::', JSON.stringify(dictOptions.value));
    });
  }
  initData();
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
