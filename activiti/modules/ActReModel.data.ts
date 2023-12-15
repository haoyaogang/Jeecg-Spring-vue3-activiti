import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '模型名称',
    align: "center",
    dataIndex: 'name'
  },
  {
    title: '模型key',
    align: "center",
    dataIndex: 'key'
  },
  {
    title: '版本',
    align: "center",
    dataIndex: 'version'
  },
  {
    title: '模型描述',
    align: "center",
    dataIndex: 'metaInfo',
    customRender: ({ text }) => {
      return JSON.parse(text).description;
    },
  },
  {
    title: '创建时间',
    align: "center",
    dataIndex: 'createTime',
    customRender:({text}) =>{
      return !text?"":(text.length>10?text.substr(0,10):text);
    },
  },
  {
    title: '最后更新时间',
    align: "center",
    dataIndex: 'lastUpdateTime',
    customRender:({text}) =>{
      return !text?"":(text.length>10?text.substr(0,10):text);
    },
  },
];



//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: "模型名称",
    field: 'name',
    component: 'Input',
    colProps: {span: 6},
  },
];

//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '模型名称',
    field: 'name',
    component: 'Input',
  },
  {
    label: '模型key',
    field: 'key',
    component: 'Input',
  },
	// TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];
