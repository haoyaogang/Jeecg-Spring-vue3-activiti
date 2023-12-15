<template>
  <div>
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :lg="8">
            <a-form-item label="任务名称" name="name">
              <a-input placeholder="请输入任务名称" v-model:value="queryParam.name"></a-input>
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
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <!--字段回显插槽-->
      <template #htmlSlot="{ text }">
        <div v-html="text"></div>
      </template>
    </BasicTable>
    <!-- 审批操作--通过、驳回 -->
    <a-modal :title="modalTaskTitle" :visible="modalTaskVisible" :mask-closable="false" :style="{ 'z-index': 999 }">
      <div>
        <a-form ref="form" :model="taskform" :rules="formValidate" :label-col="labelCol" :wrapper-col="wrapperCol">
          <!--审批-->
          <a-form-item label="审批意见" name="reason">
            <a-textarea type="textarea" v-model:value="taskform.comment" :rows="4" />
          </a-form-item>
          <a-form-item label="下一审批人" name="assignees" v-show="showAssign" :error="error">
            <a-select v-model:value="taskform.assignees" placeholder="请选择" allowClear mode="multiple" :loading="userLoading">
              <a-select-option v-for="(item, i) in assigneeList" :key="i" :value="item.username">{{ item.realname }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="下一审批人" v-show="isGateway">
            <span>分支网关处暂不支持自定义选择下一审批人，将发送给下一节点所有人</span>
          </a-form-item>
          <!--驳回-->

          <div v-show="taskform.type == 1">
            <a-form-item label="驳回至">
              <a-select v-model:value="taskform.backTaskKey" :loading="backLoading" @change="changeBackTask">
                <a-select-option v-for="(item, i) in backList" :key="i" :value="item.key">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="指定原节点审批人" name="assignees" v-show="taskform.backTaskKey != -1" :error="error">
              <a-select v-model:value="taskform.assignees" placeholder="请选择" allowClear mode="multiple" :loading="userLoading">
                <a-select-option v-for="(item, i) in assigneeList" :key="i" :value="item.username">{{ item.realname }}</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <!--委托-->
          <a-form-item label="选择委托人" name="userId" :error="error" v-show="taskform.type === 2">
            <JSelectUserByDept v-model:value="taskform.userId" :multi="false" />
          </a-form-item>
          <a-form-item label="消息通知">
            <a-checkbox v-model:value="taskform.sendMessage">站内消息通知</a-checkbox>
            <a-checkbox v-model:value="taskform.sendSms" disabled>短信通知</a-checkbox>
            <a-checkbox v-model:value="taskform.sendEmail" disabled>邮件通知</a-checkbox>
          </a-form-item>
        </a-form>
      </div>
      <template #footer>
        <a-button type="text" @click="modalTaskVisible = false">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handelSubmit">提交</a-button>
      </template>
    </a-modal>
    <!--流程表单-->
    <a-modal :title="lcModa.title" :visible="lcModa.visible" :maskClosable="false" width="80%" @cancel="lcModa.visible = false" :style="{ 'z-index': 100 }">
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
      <template #footer>
        <a-button @click="passTask(lcModa.processData)" type="primary"> 通过 </a-button>
        <a-button @click="backTask(lcModa.processData)" type="danger"> 驳回 </a-button>
      </template>
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
      <historicDetail :procInstId="procInstId" />
    </a-modal>
  </div>
</template>

<script lang="ts" name="modules-todo" setup>
  /**
   *  haoyaogang task todo list for activiti
   */
  import { ref, reactive, defineExpose, nextTick, defineProps, defineAsyncComponent, h } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import {
    saveOrUpdateActBusiness,
    todoList,
    getNextNode,
    getBackList,
    getNode,
    actTaskPass,
    actTaskBack,
    actTaskBackToTask,
    actTaskDelegate
  } from './ActReModel.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import HistoricDetail from '/@/views/activiti/modules/components/historicDetail.vue';
  import JSelectUserByDept from "/@/components/Form/src/jeecg/components/JSelectUserByDept.vue";
  import JSelectDept from "/@/components/Form/src/jeecg/components/JSelectDept.vue";
  import JSelectRole from "/@/components/Form/src/jeecg/components/JSelectRole.vue";
  import JDictSelectTag from "/@/components/Form/src/jeecg/components/JDictSelectTag.vue";

  const $message = useMessage();
  const queryParam = reactive<any>({});
  const toggleSearchStatus = ref<boolean>(false);
  const formRef = ref();
  const registerForm = ref();
  const columns: BasicColumn[] = [
    {
      title: '#',
      align: 'center',
      fixed: 'left',
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    {
      title: '模型名称',
      align: 'center',
      dataIndex: 'name',
      fixed: 'left',
    },
    {
      title: '所属流程',
      align: 'center',
      dataIndex: 'processName',
    },
    {
      title: '委托人',
      align: 'center',
      dataIndex: 'owner',
    },
    {
      title: '流程发起人',
      align: 'center',
      dataIndex: 'applyer',
    },
    {
      title: '优先级',
      align: 'center',
      dataIndex: 'priority',
      customRender: ({ text }) => {
        let color = '', textstr = '';
        if (text == 0) {
          color = 'green';
          textstr = '普通';
        } else if (text == 1) {
          color = 'orange';
          textstr = '重要';
        } else if (text == 2) {
          color = 'red';
          textstr = '紧急';
        } else {
          color = '#999';
          textstr = '无';
        }
        return h('div',{style:{color: color}},textstr);
      }
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'isSuspended',
      customRender: ({ text }) => {
        return h('div', { style: { color: text ? 'orange' : 'green' } }, text ? '已挂起' : '已激活');
      },
    },
    {
      title: '创建时间',
      align: 'center',
      dataIndex: 'createTime',
    },
    {
      title: '创建时间',
      align: 'center',
      dataIndex: 'createTime',
    },
  ];
  //注册table数据
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      title: '待办列表',
      api: todoList,
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

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '查看并处理',
        onClick: detail.bind(null, record),
      },
      {
        label: '委托他人代办',
        onClick: delegateTask.bind(null, record),
      },
      {
        label: '历史',
        onClick: history.bind(null, record),
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
  const procInstId = ref();
  const modalLsVisible = ref(false);
  const lcModa = reactive<Record<string, any>>({
    title: '',
    disabled: false,
    visible: false,
    formComponent: null,
    isNew: false,
    tableId: null,
    showOkButton: true,
  });
  const taskform = reactive<Record<string, any>>({
    id: '',
    userId: '',
    procInstId: '',
    comment: '',
    type: 0,
    assignees: [],
    backTaskKey: '-1',
    sendMessage: true,
    sendSms: false,
    sendEmail: false,
  });
  const backList = reactive<Record<string, any>>([
    {
      key: '-1',
      name: '发起人',
  }]);
  const modalTaskTitle = ref();
  const modalTaskVisible = ref(false);
  const showAssign = ref(false);
  const isGateway = ref(false);
  const error = ref('');
  const assigneeList = ref([]);
  const formValidate = ref({});
  const userLoading = ref(false);
  const backLoading = ref(false);
  const submitLoading = ref(false);
  /**
   * 详情
   */
  function handleDetail(record: Recordable) {
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {

  }
  function detail(r) {
    if (!r.routeName) {
      $message.createMessage.warning('该流程信息未配置表单，请联系开发人员！');
      return;
    }
    console.log('detail:::', JSON.stringify(r));
    lcModa.disabled = true;
    lcModa.title = '审批流程业务信息：' + r.processName;
    lcModa.formComponent = defineAsyncComponent(() => import(`/@/views/${r.routeName}`));
    lcModa.processData = r;
    lcModa.isNew = false;
    lcModa.visible = true;
  }

  function history(v) {
    if (!v.procInstId) {
      $message.createMessage.error('流程实例ID不存在');
      return;
    }
    procInstId.value = v.procInstId;
    modalLsVisible.value = true;
  }
  function closeLsModal() {
    nextTick(() => {
      modalLsVisible.value = false;
    });
  }
  function loadData() {
    reload();
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
      id: res.result.id,
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

  /**
   * 委托
   * @param v
   */
  function delegateTask(v) {
    modalTaskTitle.value = '委托他人代办';
    taskform.id = v.id;
    taskform.procInstId = v.procInstId;
    taskform.type = 2;
    taskform.backTaskKey = '-1';
    showAssign.value = false;
    console.log(JSON.stringify(taskform));
    modalTaskVisible.value = true;
  }
  function passTask(v) {
    modalTaskTitle.value = '审批通过';
    taskform.id = v.id;
    taskform.procInstId = v.procInstId;
    taskform.priority = v.priority;
    taskform.type = 0;
    taskform.backTaskKey = '-1';
    modalTaskVisible.value = true;
    userLoading.value = true;
    getNextNode({ procDefId: v.procDefId, currActId: v.key, procInstId: v.procInstId }).then((result) => {
      console.log("getNextNode:::", JSON.stringify(result));
      userLoading.value = false;
      if (result.type == 4) {
        isGateway.value = true;
        showAssign.value = false;
        error.value = '';
        return;
      }
      isGateway.value = false;
      if (result.users && result.users.length > 0) {
        error.value = '';
        assigneeList.value = result.users;
        console.log(assigneeList);
        // 默认勾选
        let ids = [];
        result.users.forEach((e) => {
          ids.push(e.username);
        });
        console.log("getNextNode:::", JSON.stringify(ids));
        taskform.assignees = ids;
        showAssign.value = true;
      } else {
        taskform.assignees = [];
        showAssign.value = false;
      }

    });
  }
  function backTask(v) {
    modalTaskTitle.value = '审批驳回';
    taskform.id = v.id;
    taskform.procInstId = v.procInstId;
    taskform.procDefId = v.procDefId;
    taskform.priority = v.priority;
    taskform.type = 1;
    taskform.backTaskKey = '-1';
    showAssign.value = false;
    modalTaskVisible.value = true;
    backLoading.value = true;
    getBackList(v.procInstId, {}).then((result) => {
      backLoading.value = false;
      result.forEach((e) => {
        backList.push(e);
      });
    });
  }
  /*审批提交的方法*/
  function handelSubmit() {
    console.log('提交');
    submitLoading.value = true;
    let formData = Object.assign({}, taskform);
    formData.assignees = formData.assignees.join(',');
    if (formData.type == 0) {
      // 通过
      if (showAssign.value && formData.assignees.length < 1) {
        $message.createMessage.error('请至少选择一个审批人');
        submitLoading.value = false;
        return;
      } else {
        error.value = '';
      }
      // this.postFormAction(this.url.pass,formData).then(res => {
      //   this.submitLoading = false;

      // });
      actTaskPass(formData).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          lcModa.visible = false;
          $message.createMessage.success('操作成功');
          modalTaskVisible.value = false;
          loadData();
        }
      });
    } else if (formData.type == 1) {
      // 驳回
      if (formData.backTaskKey == '-1') {
        actTaskBack(formData).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            lcModa.visible = false;
            $message.createMessage.success('操作成功');
            modalTaskVisible.value = false;
            loadData();
          }
        });
      } else {
        // 自定义驳回
        if (formData.backTaskKey != '-1' && formData.assignees.length < 1) {
          $message.createMessage.error('请至少选择一个审批人');
          submitLoading.value = false;
          return;
        } else {
          error.value = '';
        }
        actTaskBackToTask(formData).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            lcModa.visible = false
            $message.createMessage.success('操作成功');
            modalTaskVisible.value = false;
            loadData();
          }
        });
      }
    } else if (formData.type == 2) {
      // 委托
      if (!formData.userId) {
        $message.createMessage.error('请选择一委托人');
        submitLoading.value = false;
        return;
      } else {
        error.value = '';
      }
      actTaskDelegate(formData).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          $message.createMessage.success('操作成功');
          modalTaskVisible.value = false;
          loadData();
        }
      });
    }
  }
  function changeBackTask(v) {
    //TODO 貌似没啥用
    if (v == '-1') {
      return;
    }
    userLoading.value = true;
    getNode({ nodeId: v,tableName: lcModa.processData.tableName, tableId: lcModa.processData.tableId }).then((res) => {
      userLoading.value = false;
      if (res.success) {
        if (res.result.users && res.result.users.length > 0) {
          assigneeList.value = res.result.users;
          // 默认勾选
          let ids = [];
          res.result.users.forEach(e => {
            ids.push(e.username);
          });
          taskform.assignees = ids;
        }
      }
    });
  }
  /**
   * 所有通过
   */
  function passAll() {

  }

  /**
   * 所有驳回
   */
  function backAll() {

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
</style>
