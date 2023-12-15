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
<!--        <a-button type="primary" @click="createObj.visible = true" preIcon="ant-design:plus-outlined"> 创建流程模型</a-button>-->
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
  <!--查看图片-->
  <a-modal
    :title="viewTitle" width="90%"
    :visible="viewImage" :footer="null"
    @cancel="viewImage = false"
  >
    <div style="min-height: 400px">
      <img :src="diagramUrl" :alt="viewTitle">
    </div>
  </a-modal>

  <!--节点设置 hyg-->
  <a-modal
    title="编辑流程节点"
    width="900px"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    :visible="showProcessNodeEdit"
    :footer="null"
    @cancel="closeNode"
  >
    <a-row>
      <a-col :md="4" :sm="4" style="border-right: 1px solid #999">
        <!--          选择流程节点-->
        <a-steps direction="vertical" :current="current" size="small">
          <template v-for="(item, i) in nodeList">
            <a-step
              style="cursor: pointer"
              :title="item.title"
              :description="item.description"
              :status="i == current ? 'process' : 'wait'"
              @click="change_steps(item, i)"
            />
          </template>
        </a-steps>
      </a-col>
      <a-col :md="20" :sm="20">
        <a-alert message="温馨提示：若流程运行至未分配审批人员的审批节点时，流程将自动中断取消！" banner />
        <span></span>
        <a-form  v-if="showProcessNodeEdit">
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="节点名称">
            <span class="nodespan">{{ editNode.title }}</span>
          </a-form-item>
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="节点类型">
            <span class="nodespan">{{ dictNodeType[editNode.type] }}</span>
          </a-form-item>
          <a-alert type="info" message="每个节点设置，如有修改都请保存一次，跳转节点后数据不会自动保存！" banner />
          <br />
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="审批人员" v-show="editNode.type == 1">
            <a-checkbox-group @change="spryType" v-model:value="spryTypes">
              <!-- 0角色 1用户 2部门 3发起人 4发起人的部门负责人-->
              <a-checkbox value="0"> 根据角色选择 </a-checkbox>
              <a-checkbox value="1"> 直接选择人员 </a-checkbox>
              <a-checkbox value="2"> 部门 </a-checkbox>
              <a-checkbox value="5"> 部门负责人 </a-checkbox>
              <a-checkbox value="3">
                发起人
                <a-tooltip placement="topLeft" title="自动获取发起人">
                  <a-icon type="exclamation-circle" />
                </a-tooltip>
              </a-checkbox>
              <a-checkbox value="4">
                发起人的部门负责人
                <a-tooltip placement="topLeft" title="自动获取发起人所在部门的负责人，即其上级领导。（如果其本身就是部门负责人，则指向发起人自己。）">
                  <a-icon type="exclamation-circle" />
                </a-tooltip>
              </a-checkbox>
              <a-checkbox value="6">
                表单变量
                <a-tooltip placement="topLeft" title="填写与表单中相对应的变量，role:角色，user:人员：dept:部门：deptManage:部门负责人; 例如：variable:role,variable2:user;">
                  <a-icon type="exclamation-circle" />
                </a-tooltip>
              </a-checkbox>

            </a-checkbox-group>
          </a-form-item>
          <!--            0角色 1用户 2部门 3发起人 4发起人的部门负责人-->
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="选择角色" v-if="spryTypes.indexOf('0')>-1" >
            <JSelectRole v-model:value="spry.roleIds" />
          </a-form-item>
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="选择人员" v-if="spryTypes.indexOf('1')>-1" >
            <!--  通过部门选择用户控件 -->
            <JSelectUserByDept v-model:value="spry.userIds" :multi="true" />
          </a-form-item>
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="选择部门" v-if="spryTypes.indexOf('2')>-1" >
            <JSelectDept v-model:value="spry.departmentIds" :multi="true" />
          </a-form-item>
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="选择部门负责人" v-if="spryTypes.indexOf('5')>-1" >
            <JSelectDept v-model:value="spry.departmentManageIds" :multi="true" />
          </a-form-item>
          <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="输入表单变量" v-if="spryTypes.indexOf('6')>-1" >
            <a-input v-model:value="spry.formVariables" :multi="true" />
          </a-form-item>
          <!--btn-->
          <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
            <a-button @click="sprySubmit" type="primary" html-type="submit" :disabled="editNode.type == 0 || editNode.type == 2 || confirmLoading">
              提交并保存
            </a-button>
            <a-button @click="closeNode" style="margin-left: 10px">
              关闭
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
  </a-modal>

  <!--  关联表单 -->
  <!--编辑-->
  <a-modal
    width="900px"
    :confirmLoading="confirmLoading"
    title="编辑流程表单"
    :visible="editObj.visible"
    @ok="editObjOk"
    @cancel="editObj.visible = false"
  >
    <a-form ref="modalformRef" v-if="editObj.visible" class="antd-modal-form">
      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="流程分类" v-bind="validateInfos.categoryId">
        <JDictSelectTag v-model:value="editObj.categoryId" placeholder="请选择流程分类" dictCode="bpm_process_type" />
      </a-form-item>
      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="关联表单" v-bind="validateInfos.routeName">
        <!--        <a-input v-model:value="editObj.routeName" :multi="true" />-->
        <a-select @change="change_routeName" placeholder="请选择关联表单" :trigger-change="true" v-model:value="editObj.routeName">
          <a-select-option value="">请选择</a-select-option>
          <a-select-option v-for="(item, index) in tableList" :key="item.routeName" :value="item.routeName">
            <span style="display: inline-block; width: 100%" :title="item.text">
              {{ item.text }}->【{{ item.routeType }}】-【{{ item.routeName }}】
            </span>
          </a-select-option>
        </a-select>

        <a @click="viewForm()">预览表单</a>
      </a-form-item>
      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="角色授权" v-bind="validateInfos.roles">
        <JSelectRole placeholder="不选择则所有人可用" v-model:value="editObj.roles" />
      </a-form-item>
      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="排序" v-bind="validateInfos.sort">
        <a-input-number v-model:value="editObj.sort" placeholder="排序" />
      </a-form-item>
      <a-form-item :label-col="labelCol" :wrapper-col="wrapperCol" label="备注描述" v-bind="validateInfos.description">
        <a-textarea v-model:value="editObj.description" placeholder="备注描述" :autoSize="{ minRows: 3, maxRows: 5 }" />
      </a-form-item>
    </a-form>
  </a-modal>
  <!--流程表单 预览-->
  <a-modal :title="lcModa.title" :visible="lcModa.visible" :footer="null" width="80%" @cancel="lcModa.visible = false">
    <component :is="lcModa.formComponent" :formDisabled="true" :formBpm="false" />
  </a-modal>
</template>

<script lang="ts" name="modules-processMode" setup>
  /**
   *  haoyaogang process mode list for activiti
   */
    import { ref, reactive, defineExpose, nextTick, defineProps, defineAsyncComponent } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import {
    list,
    deleteOne,
    batchDelete,
    Api,
    deployment,
    processList,
    getProcessNode,
    editNodeUser,
    updateStatus,
    updateInfo,
    actTablelist,
  } from './ActReModel.api';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import ActReModelModal from './components/ActReModelModal.vue'
  import { useMessage } from '/@/hooks/web/useMessage';
  import JSelectUserByDept from '/@/components/Form/src/jeecg/components/JSelectUserByDept.vue';
  import JSelectDept from '/@/components/Form/src/jeecg/components/JSelectDept.vue';
  import JSelectRole from '/@/components/Form/src/jeecg/components/JSelectRole.vue';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { getValueType } from '/@/utils';
  import { Form } from 'ant-design-vue';

  const tableList = ref<any>([]);
  const modalformRef = ref();
  const useForm = Form.useForm;
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

  const viewImage = ref(false);
  const viewTitle = ref('');
  const diagramUrl = ref('');

  const iframUrl = ref();



  const columns: BasicColumn[] = [
    {
      title: '模型名称',
      align: 'center',
      dataIndex: 'name',
      fixed: 'left',
    },
    {
      title: '流程标识',
      align: 'center',
      dataIndex: 'processKey',
    },
    {
      title: '版本',
      align: 'center',
      dataIndex: 'version',
    },
    {
      title: '所属分类',
      align: 'center',
      dataIndex: 'categoryId',
    },
    {
      title: '流程图',
      align: 'center',
      dataIndex: 'diagramName',
      slots: { customRender: 'diagramNameSlot' },
    },
    {
      title: '表单路由',
      align: 'center',
      dataIndex: 'routeName',
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'status',
      customRender: ({ text }) => {
        return text == 1 ? '已启用' : '未启用';
      },
    },
    {
      title: '备注说明',
      align: 'center',
      dataIndex: 'description',
    },
    {
      title: '部署时间',
      align: 'center',
      dataIndex: 'createTime',
    },
    {
      title: '更新时间',
      align: 'center',
      dataIndex: 'updateTime',
    },
  ];

  //注册table数据
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      title: 'act_re_procdef',
      api: processList,
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
  /*查看流程图片*/
  function showResource(record) {
    viewTitle.value = '流程图片预览(' + record.diagramName + ')';
    diagramUrl.value = `${window._CONFIG['domianURL']}${Api.exportimg}?id=${record.id}`;
    viewImage.value = true;
  };

  initData();
  function loadData() {
    reload();

  }
  interface RouteItem {
    text: string;
    routeName: string;
    routeType: string;
    component: () => Promise<any>;
  }
  function initData() {
    actTablelist({}).then((res) => {
      let records = res.records;
      let arr: RouteItem[] = [];
      for (let item of records) {
        const it = {
          text: item.tableName,
          routeName: item.tablePath,
          routeType: item.routeType == 0 ? '路由' : '非路由',
          component: defineAsyncComponent(() => import(`/@/views/${item.tablePath}`)),
        };
        arr.push(it);
      }
      tableList.value = arr;
    });
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
    resetFields();
    Object.assign(editObj, record);
    editObj.visible = true;
  }
  /**
   * 详情
   */
  function handleDetail(record: Recordable) {
    // registerModal.value.disableSubmit = true;
    // registerModal.value.edit(record);
    // createObj.confirmLoading = true;
    // iframUrl.value = `${window._CONFIG['domianURL']}${Api.update}${record.id}`;
    // updateObj.visible = true;
    // createObj.confirmLoading = false;
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
    const status = record.status == 1 ? 0 : 1;
    const lablestr = record.status == 1 ? '禁用' : '启用';
    return [
      {
        label: lablestr,
        onClick: editStatus.bind(null, status, record),
      },
      {
        label: '关联表单',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '审核设置',
        onClick: getNodeData.bind(null, record),
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

  // 节点设置
  const editObj = reactive<Record<string, any>>({
    visible: false,
  });
  const confirmLoading = ref(false);
  const showProcessNodeEdit = ref(false);
  const current = ref(0);
  const nodeList = ref([]);
  const editNode = ref({});
  const dictNodeType = ref({
    '0': '开始节点',
    '1': '审批节点',
    '2': '结束节点',
  });
  const spryTypes = ref([]);
  const spry = reactive<any>({
    //选中的用户
    userIds: '',
    roleIds: '',
    departmentIds: '',
    departmentManageIds: '',
    formVariables: '',
    chooseSponsor: false,
    chooseDepHeader: false,
  });
  const updateRow = ref({});


  //表单验证
  const validatorRules = {
  };
  const { resetFields, validate, validateInfos } = useForm(editObj, validatorRules, { immediate: true });
  function closeNode() {
    showProcessNodeEdit.value = false;
    current.value = 0;
    spryTypes.value = [];
    spry.value = {};
  };
  // 节点设置
  function getNodeData(record) {
    updateRow.value = record;
    getProcessNode(record.id).then((res) => {
      if (res.success) {
        nodeList.value = res.result || [];
        console.log('_this.nodeList', nodeList);
        if (nodeList.value.length > 0) {
          editNode.value = nodeList.value[current.value];
          console.log(current, editNode.value);
          showProcessNodeEdit.value = true;
        }
      } else {
        $message.createMessage.error(res.message);
      }
    });
  }
  //状态编辑
  function editStatus(status, record) {
    let operation = '';
    if (status == 0) {
      operation = '不启用';
    } else {
      operation = '启用';
    }
    $message.createConfirm({
      iconType: 'warning',
      title: '确认' + operation + '?',
      content: `您确认要${operation}流程${record.name}?`,
      onOk() {
        let params = {
          status: status,
          id: record.id,
        };
        updateStatus(params).then((res) => {
          if (res.success) {
            $message.createMessage.success('操作成功');
            loadData();
          } else {
            $message.createMessage.error(res.message);
          }
        });
      },
      onCancel() {},
    });
  }

  function change_steps(node,index){
    spryTypes.value = [];
    console.log('onChange:', node);
    current.value = index;
    editNode.value = node;
    /* 0角色 1用户 2部门 3发起人 4发起人的部门负责人 5部门的部门负责人*/
    spry.chooseDepHeader = node.chooseDepHeader || false;
    if (spry.chooseDepHeader) spryTypes.value.push('4');
    spry.chooseSponsor = node.chooseSponsor || false;
    if (spry.chooseSponsor) spryTypes.value.push('3') ;
    var userIds = [];
    for (const user of node.users || []) {
      userIds.push(user.username);
    }
    spry.userIds = userIds.join(',');
    if (userIds.length > 0) spryTypes.value.push('1');
    var roleIds = [];
    for (const role of node.roles || []) {
      roleIds.push(role.roleCode)
    }
    spry.roleIds = roleIds.join(',');
    if (roleIds.length > 0) spryTypes.value.push('0');
    var departmentIds = []
    for (const department of node.departments || []) {
      departmentIds.push(department.id)
    }
    spry.departmentIds = departmentIds.join(',');
    if (departmentIds.length>0) spryTypes.value.push('2') ;
    var departmentManageIds = []
    for (const departmentManage of node.departmentManages || []){
      departmentManageIds.push(departmentManage.id);
    }
    spry.departmentManageIds = departmentManageIds.join(',');
    if (departmentManageIds.length>0) spryTypes.value.push('5') ;
    console.log("回显this.spry",spry);

    spry.formVariables = node.formVariables || '';
    if (spry.formVariables) spryTypes.value.push('6');
  }

  function spryType(types){
    /* 0角色 1用户 2部门 3发起人 4发起人的部门负责人 5部门负责人*/
    // this.spryTypes = types;
    if (spryTypes.value.indexOf('0') == -1) spry.roleIds = '';
    if (spryTypes.value.indexOf('1') == -1) spry.userIds = '';
    if (spryTypes.value.indexOf('2') == -1) spry.departmentIds = '';
    if (spryTypes.value.indexOf('5') == -1) spry.departmentManageIds = '';
    if (spryTypes.value.indexOf('6') == -1) spry.formVariable = '';
    //是否选中发起人
    spry.chooseSponsor = spryTypes.value.indexOf('3') > -1;
    //是否选中发起人的部门领导
    spry.chooseDepHeader = spryTypes.value.indexOf('4') > -1;
    console.log("spryTypes:::", spryTypes.value);
    console.log("spryType:::", spry.value);
  }

  function sprySubmit() {
    if (spryTypes.value.length === 0) {
      $message.createMessage.error('必须选择审批人！');
      return;
    }
    confirmLoading.value = true;
    spry.nodeId = editNode.value.id;
    spry.procDefId = editNode.value.procDefId;
    console.log('sprySubmit:::',JSON.stringify(spry) );
    editNodeUser(spry).then((res) => {
      if (res.success) {
        $message.createMessage.success('操作成功');
        /*保存成功后回显数据*/
        getNodeData(updateRow.value);
      } else {
        $message.createMessage.error(res.message);
      }
      confirmLoading.value = false;
    });
  }
  const lcModa = reactive({
    title: '流程表单预览',
    visible: false,
    formComponent: null,
  });
  const registerForm = ref();
  import CustomerBaseInfoForm from '/@/views/customer/customerInfo/components/CustomerBaseInfoForm.vue';

  function viewForm(routeName) {
    //TODO 判断是否是路由
    if (!routeName) routeName = editObj.routeName;
    if (!routeName) {
      $message.createMessage.warning('请先选择表单！');
      return;
    }
    lcModa.formComponent = defineAsyncComponent(() => import(`/@/views/${routeName}`));
    lcModa.title = '流程表单预览：';
    lcModa.visible = true;
  }
  function change_routeName() {
    nextTick(() => {
      const routeName = editObj.routeName;
      console.log('routeName', routeName);
    });
  }

  /**
   * hyg , 关联表单
   */
  async function editObjOk() {
    // 触发表单验证
    await validate();
    confirmLoading.value = true;
    let formData = editObj;
    console.log('editObjOk:::', JSON.stringify(formData));
    //循环数据
    for (let data in formData) {
      //如果该数据是数组并且是字符串类型
      if (formData[data] instanceof Array) {
        let valueType = getValueType(formRef.value.getProps, data);
        //如果是字符串类型的需要变成以逗号分割的字符串
        if (valueType === 'string') {
          formData[data] = formData[data].join(',');
        }
      }
      if (formData[data] == null) {
        delete formData[data];
      }
    }
    updateInfo(formData).then((res) => {
      confirmLoading.value = false;
      if (res.success) {
        $message.createMessage.success('操作成功');
        loadData();
        editObj.visible = false;
      } else {
        $message.createMessage.error(res.message);
      }
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
