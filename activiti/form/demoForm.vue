<template>
  <!--流程业务表单-->
  <div class="">
    <a-card :body-style="{ padding: '24px 32px' }" :bordered="false">
      <a-form >
        <a-form-item label="标题" :labelCol="{ lg: { span: 7 }, sm: { span: 7 } }"
                     :wrapperCol="{ lg: { span: 10 }, sm: { span: 17 } }">
          <a-input  name="name" placeholder="给目标起个名字" />
        </a-form-item>
        <a-form-item  :wrapperCol="{ span: 24 }" style="text-align: center">
          <a-button type="primary" >保存</a-button>
          <a-button style="margin-left: 8px" @click="close">取消</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts" setup>

