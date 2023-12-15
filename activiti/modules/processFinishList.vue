<template>
  <div>
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :lg="8">
            <a-form-item label="任务名称" name="name">
              <a-input placeholder="请输入任务名称" v-model:value="queryParam.name" />
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item label="标识key" name="key">
              <a-input placeholder="请输入任务名称" v-model:value="queryParam.key" />
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
    <!--流程表单-->
    <a-modal
      :title="lcModa.title"
      :visible="lcModa.visible"
      :maskClosable="false"
      width="80%"
      @cancel="lcModa.visible = false"
      :style="{ 'z-index': 100 }"
      :footer="null"
    >
      <component
        :formDisabled="lcModa.disabled"
        :formBpm="true"
        :formData="{ disabled: lcModa.disabled, tableId: lcModa.tableId }"
        v-if="lcModa.visible"
        :is="lcModa.formComponent"
        :processData="lcModa.processData"
        :isNew="lcModa.isNew"
        @close="(lcModa.visible = false), (lcModa.disabled = false)"
        ref="registerForm"
      />
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

<script lang="ts" name="modules-processFinish" setup>
  /**
   *  haoyaogang process finished list for activiti
   */
  import { ref, reactive, defineExpose, nextTick, defineProps, defineAsyncComponent, h } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { doneList, millsToTime, getRunningProcess, getFinishedProcess, delHistoricIns } from './ActReModel.api';
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
      title: '流程实例ID',
      align: 'center',
      dataIndex: 'id',
    },
    {
      title: '流程名称',
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: '申请人',
      align: 'center',
      dataIndex: 'applyer',
    },
    {
      title: '标识Key',
      align: 'center',
      dataIndex: 'key',
    },
    {
      title: '版本',
      align: 'center',
      dataIndex: 'version',
    },
    {
      title: '审批结果',
      align: 'center',
      dataIndex: 'result',
      customRender: ({ text }) => {
        if (text == 4) {
          return h('div', { style: { color: '#999999' } }, '发起人撤回');
        } else if (text == 5) {
          return h('div', { style: { color: 'orange' } }, '已删除');
        } else if (text == 2) {
          return h('div', { style: { color: 'green' } }, '已通过');
        } else if (text == 3) {
          return h('div', { style: { color: 'red' } }, '已驳回');
        } else {
          return h('div', '未知');
        }
      },
    },
    {
      title: '原因详情',
      align: 'center',
      dataIndex: 'deleteReason',
    },
    {
      title: '总耗时',
      align: 'center',
      dataIndex: 'duration',
      customRender: ({ text }) => {
        return millsToTime(text);
      },
    },
    {
      title: '开始时间',
      align: 'center',
      dataIndex: 'startTime',
    },
    {
      title: '结束时间',
      align: 'center',
      dataIndex: 'endTime',
    },
  ];
  //注册table数据
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      title: '待办列表',
      api: getFinishedProcess,
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
        label: '表单数据',
        onClick: detail.bind(null, record),
      },
      {
        label: '审批历史',
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
  /**
   * 删除事件
   */
  async function handleDelete(v) {
    delHistoricIns(v.id).then((res) => {
      if (res.success) {
        $message.createMessage.success('操作成功');
        reload();
      } else {
        $message.createMessage.error(res.message);
      }
    });
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
    if (!v.id) {
      $message.createMessage.error('流程实例ID不存在');
      return;
    }
    procInstId.value = v.id;
    modalLsVisible.value = true;
  }
  function closeLsModal() {
    nextTick(() => {
      modalLsVisible.value = false;
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
</style>
