<template>
  <div class="search">
    <a-card style="margin-bottom: 10px">
      <p>
        <span>流程审批进度历史</span>
      </p>
      <a-row>
        <a-table :loading="loading" rowKey="id" :dataSource="data" :pagination="false" ref="table" style="width: 100%">
          <a-table-column title="#" width="50">
            <template v-slot="{ index }">
              <span> {{ index }} </span>
            </template>
          </a-table-column>
          <a-table-column title="任务名称" dataIndex="name" width="150" align="center">
            <template v-slot="{ text }">
              <span> {{ text }} </span>
            </template>
          </a-table-column>
          <a-table-column title="处理人" dataIndex="assignees" width="150" align="center">
            <template v-slot="{ text,record,index }">
              <div>
                <span v-for="item in record.assignees">
                  <span v-if="item.isExecutor" style="color: blue">{{ item.username }} </span>
                  <span v-else style="color: #999">{{ item.username }} </span>
                </span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="审批操作" dataIndex="deleteReason" align="center">
            <template v-slot="{ text }">
              <span v-if="text.toString().indexOf('通过') > -1" style="color: green">{{ text }}</span>
              <span v-else-if="text.indexOf('驳回') > -1" style="color: red">{{ text }}</span>
              <span v-else>{{ text }}</span>
            </template>
          </a-table-column>
          <a-table-column title="审批意见" dataIndex="comment"  align="center">
            <template v-slot="{ text }">
              <span>{{ text }}</span>
            </template>
          </a-table-column>
          <a-table-column title="耗时" dataIndex="duration" width="150" align="center">
            <template v-slot="{ text }">
              <span>{{ millsToTime(text) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" dataIndex="createTime" width="150" align="center">
            <template v-slot="{ text }">
              <span>{{ text }}</span>
            </template>
          </a-table-column>
          <a-table-column title="完成时间" dataIndex="endTime" width="150" align="center">
            <template v-slot="{ text }">
              <span>{{ text }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" dataIndex="endTime" key="aaa" width="150" align="center">
            <template v-slot="{ text }">
              <span v-if="text" style="color: blue">已办理</span>
              <span v-else style="color: #999999">待处理</span>
            </template>
          </a-table-column>
        </a-table>
      </a-row>
    </a-card>

    <a-tabs type="card" @change="callback">
      <a-tab-pane key="1" tab="实时流程图">
        <a-card>
          <p>
            <span>实时流程图</span>
          </p>
          <a-row style="position: relative">
            <img :src="imgUrl" />
            <a-spin size="large" fix v-if="loadingImg" />
          </a-row>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="2" tab="表单数据" v-if="lcModa">
        <a-card>
          <!--流程表单-->
          <component
            :formDisabled="lcTableData.disabled"
            :formBpm="true"
            :formData="{ disabled: lcTableData.disabled, tableId: lcTableData.tableId }"
            :is="lcTableData.formComponent"
            :processData="lcTableData.processData"
            :isNew="lcTableData.isNew"
            @close="(lcTableData.visible = false), (lcTableData.disabled = false)"
            ref="registerForm"
          />
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { ref, defineProps, reactive, watch } from "vue";
  import { historicFlow, millsToTime } from '../ActReModel.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  const emit = defineEmits(['passTask', 'backTask']);
  const $message = useMessage();
  const props = defineProps({
    procInstId: { type: String, default: '' },
    lcModa: { type: Object, default: () => {} },
  });
  watch(
    () => props.procInstId,
    (newValue, oldValue) => {
      init();
    }
  );
  const lcTableData = reactive({
    title: '',
    disabled: true,
    visible: false,
    formComponent: null,
    isNew: false,
    tableId: null,
  });
  const loading = ref(false);
  const data = ref([]);
  const imgUrl = ref('');
  const loadingImg = ref(false);
  const id = ref('');
  const url = reactive<Record<string, any>>({
    getHighlightImg: `${window._CONFIG['domianURL']}/activiti/models/getHighlightImg/`,
  });
  async function getDataList() {
    loading.value = true;
    await historicFlow(id.value).then((result) => {
      loading.value = false;
      if (result) {
        data.value = result;
        console.log('getDataList:::', JSON.stringify(data.value));
        if (result.length == 0) {
          $message.createMessage.info('未找到该记录审批历史数据,历史数据可能已被删除');
        }
      } else {
        $message.createMessage.error('数据获取错误');
      }
    });
  }
  function callback(key) {
    console.log('callback', key);
  }
  function afterSub() {
    console.log('afterSub');
  }
  function pass(v) {
    emit('passTask', v);
  }
  function back(v) {
    emit('backTask', v);
  }
  function init() {
    Object.assign(lcTableData, props.lcModa);
    id.value = props.procInstId;
    imgUrl.value = url.getHighlightImg + id.value + '?time=' + new Date();
    getDataList();
  }
  init();
</script>
<style lang="less" scoped>
  .antd-modal-form {
    min-height: 500px !important;
    overflow-y: auto;
    padding: 24px 24px 24px 24px;
  }
</style>
