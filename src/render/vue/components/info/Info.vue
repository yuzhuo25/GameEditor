<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="关卡ID:">
      <a-input v-model:value="form.name" />
    </a-form-item>
    <a-form-item label="关卡名:">
      <a-input />
    </a-form-item>
    <a-form-item label="关卡地图:">
      <a-select v-model:value="form.region" placeholder="please select your zone">
        
        <a-select-option value="beijing">
          Zone two
        </a-select-option>
      </a-select>
    </a-form-item>
   
    <a-form-item label="Tips">
      <a-input v-model:value="form.desc" type="textarea" />
    </a-form-item>
   
  </a-form>
</template>
<script>
export default {
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        name: '',
        region: undefined,
        date1: undefined,
        delivery: false,
        type: [],
        resource: '',
        desc: '',
      },
    };
  },
  methods: {
    onSubmit() {
      console.log('submit!', this.form);
    },
  },
};
</script>
